"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useAuthModal } from "./AuthModalProvider";
import AuthForm from "./AuthForm";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { isOpen, type, redirectTo, closeAuthModal } = useAuthModal();

  // Close modal automatically when route changes
  useEffect(() => {
    if (isOpen) {
      closeAuthModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleSuccess = () => {
    const destination = redirectTo ?? "/dashboard";
    // Start transition keeps the modal open while Next.js fetches the new route in the background.
    // Once the route resolves, the useEffect above will trigger and close the modal.
    startTransition(() => {
      router.push(destination);
      router.refresh();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent
        className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto custom-scrollbar bg-lp-surface border-white/[0.08] p-0 gap-0"
        showCloseButton={true}
      >
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">
          {type === "sign-in" ? "Sign In" : "Sign Up"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Authenticate to access the application.
        </DialogDescription>

        <AuthForm initialType={type} onSuccess={handleSuccess} isNavigating={isPending} />
      </DialogContent>
    </Dialog>
  );
}
