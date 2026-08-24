"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { auth } from "@/firebase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function ActionHandler() {
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your request...");

  useEffect(() => {
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");

    if (!mode || !oobCode) {
      setStatus("error");
      setMessage("Invalid action link. Missing required parameters.");
      return;
    }

    const handleAction = async () => {
      try {
        if (mode === "verifyEmail") {
          await applyActionCode(auth, oobCode);
          setStatus("success");
          setMessage("Your email has been successfully verified! You can now access all features.");
        } else if (mode === "resetPassword") {
          // Future implementation: handle reset password
          setStatus("error");
          setMessage("Password reset UI not yet implemented on this page.");
        } else if (mode === "recoverEmail") {
           setStatus("error");
           setMessage("Email recovery not yet implemented on this page.");
        } else {
          setStatus("error");
          setMessage("Invalid action mode.");
        }
      } catch (error: any) {
        console.error("Action error:", error);
        setStatus("error");
        
        if (error?.code === "auth/expired-action-code") {
          setMessage("This link has expired. Please request a new one.");
        } else if (error?.code === "auth/invalid-action-code") {
          setMessage("This link is invalid or has already been used.");
        } else {
          setMessage("Something went wrong while processing your request.");
        }
      }
    };

    handleAction();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto p-6">
      <div className="bg-lp-surface border border-white/[0.08] p-8 rounded-2xl shadow-xl flex flex-col items-center text-center w-full">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-lp-accent/10 flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 animate-spin text-lp-accent" />
            </div>
            <h2 className="text-xl font-bold text-lp-text mb-2">Processing</h2>
            <p className="text-sm text-lp-text-muted">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-lp-text mb-2">Success!</h2>
            <p className="text-sm text-lp-text-muted mb-8">{message}</p>
            <Button asChild className="btn w-full">
              <Link href="/dashboard">Continue to Dashboard</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-lp-text mb-2">Action Failed</h2>
            <p className="text-sm text-lp-text-muted mb-8">{message}</p>
            <Button asChild className="btn w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] w-full">
          <Loader2 className="w-8 h-8 animate-spin text-lp-accent" />
        </div>
      }
    >
      <ActionHandler />
    </Suspense>
  );
}
