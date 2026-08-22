"use client";

import { z } from "zod";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp, googleSignIn } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

interface AuthFormProps {
  initialType: FormType;
  onSuccess?: () => void;
  isNavigating?: boolean;
}

const AuthForm = ({ initialType, onSuccess, isNavigating = false }: AuthFormProps) => {
  const [type, setType] = useState<FormType>(initialType);
  const [isLoading, setIsLoading] = useState(false);
  
  const showLoading = isLoading || isNavigating;

  // Email verification states
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [unverifiedUser, setUnverifiedUser] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset form state when type changes
  useEffect(() => {
    setVerificationSent(false);
    setUnverifiedUser(false);
    setVerificationEmail("");
    form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // Sync with parent when initialType changes (e.g. modal reopens with different type)
  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const idToken = await user.getIdToken();
      
      const result = await googleSignIn({
        uid: user.uid,
        email: user.email || "",
        name: user.displayName || "User",
        idToken,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Signed in with Google successfully!");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      // Handle closed popup error gracefully
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = useCallback(async () => {
    if (resendCooldown > 0) return;
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        setResendCooldown(60);
        toast.success("Verification email resent.");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend verification email. Please try again.");
    }
  }, [resendCooldown]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Send verification email
        await sendEmailVerification(userCredential.user);

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        // Auto-login: create session cookie so user is immediately authenticated
        const idToken = await userCredential.user.getIdToken();
        await signIn({ email, idToken });

        // Show verification notice instead of immediately closing
        setVerificationSent(true);
        setVerificationEmail(email);
        setResendCooldown(60);
        toast.success("Account created! Check your inbox to verify your email.");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Gate on email verification
        if (!userCredential.user.emailVerified) {
          setUnverifiedUser(true);
          setVerificationEmail(email);
          return;
        }

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in failed. Please try again.");
          return;
        }

        await signIn({ email, idToken });

        toast.success("Signed in successfully.");
        onSuccess?.();
      }
    } catch (error: any) {
      console.error(error);

      // User-friendly error messages for common Firebase errors
      if (error?.code === "auth/email-already-in-use") {
        toast.error("This email is already registered. Please sign in.");
      } else if (error?.code === "auth/invalid-credential") {
        toast.error("Invalid email or password.");
      } else if (error?.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isSignIn = type === "sign-in";

  // ── Verification email sent state (post-sign-up) ──
  if (verificationSent) {
    return (
      <div className="flex flex-col gap-6 p-8 pt-10">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-bold text-lp-text">Check your inbox</h2>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-lp-accent/15 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-lp-accent"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          <p className="text-sm text-lp-text-muted leading-relaxed max-w-[36ch] mt-4">
            We sent a verification email to{" "}
            <strong className="text-lp-text">{verificationEmail}</strong>.
            Click the link to verify your account.
          </p>

          <Button
            className="btn mt-2"
            onClick={() => onSuccess?.()}
          >
            Continue to Dashboard
          </Button>

          <div className="flex flex-col items-center gap-1 mt-2">
            <button
              onClick={handleResendVerification}
              disabled={resendCooldown > 0}
              className="text-sm text-lp-accent hover:text-lp-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend verification email"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Unverified user state (sign-in blocked) ──
  if (unverifiedUser) {
    return (
      <div className="flex flex-col gap-6 p-8 pt-10">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-bold text-lp-text">Verify your email</h2>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-400"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          <p className="text-sm text-lp-text-muted leading-relaxed max-w-[36ch] mt-4">
            Your email <strong className="text-lp-text">{verificationEmail}</strong>{" "}
            hasn&apos;t been verified yet. Please check your inbox and click the
            verification link.
          </p>

          <button
            onClick={handleResendVerification}
            disabled={resendCooldown > 0}
            className="text-sm text-lp-accent hover:text-lp-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend verification email"}
          </button>

          <button
            onClick={() => {
              setUnverifiedUser(false);
              setVerificationEmail("");
            }}
            className="text-xs text-lp-text-muted hover:text-lp-text transition-colors mt-1 cursor-pointer"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // ── Main auth form ──
  return (
    <div className="flex flex-col gap-6 p-8 pt-10">
      <div className="flex flex-col gap-1 text-center mb-2">
        <h2 className="text-2xl font-bold text-lp-text">
          {isSignIn ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-sm text-lp-text-muted">
          {isSignIn 
            ? "Sign in to continue practicing your interviews." 
            : "Start practicing job interviews with AI today."}
        </p>
      </div>

      <div className="w-full flex flex-col gap-4 mt-2">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full relative bg-transparent border-white/10 hover:bg-white/5 transition-colors text-white"
          onClick={handleGoogleSignIn}
          disabled={showLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="currentColor"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="currentColor"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="currentColor"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="currentColor"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-lp-surface px-2 text-white/50 font-medium">
              Or continue with email
            </span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6 mt-4 form"
        >
          {!isSignIn && (
            <FormField
              control={form.control}
              name="name"
              label="Name"
              placeholder="Your Name"
              type="text"
            />
          )}

          <FormField
            control={form.control}
            name="email"
            label="Email"
            placeholder="Your email address"
            type="email"
          />

          <FormField
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
          />

          <Button className="btn" type="submit" disabled={showLoading}>
            {showLoading
              ? "Please wait..."
              : isSignIn
                ? "Sign In"
                : "Create an Account"}
          </Button>
        </form>
      </Form>

      <p className="text-center">
        {isSignIn ? "No account yet?" : "Have an account already?"}
        <button
          type="button"
          onClick={() => setType(isSignIn ? "sign-up" : "sign-in")}
          className="font-bold text-lp-accent ml-1 hover:underline cursor-pointer"
        >
          {isSignIn ? "Sign Up" : "Sign In"}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;