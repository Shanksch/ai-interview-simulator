"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthModal } from "./AuthModalProvider";

/**
 * Reads ?auth=true&type=sign-in|sign-up&redirect=/some/path from the URL,
 * opens the auth modal, and immediately strips those params so a refresh
 * or back-button press doesn't re-trigger the modal.
 */
export default function AuthParamHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { openAuthModal } = useAuthModal();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const authParam = searchParams.get("auth");
    if (authParam !== "true") return;

    handled.current = true;

    const type =
      (searchParams.get("type") as "sign-in" | "sign-up") ?? "sign-in";
    const redirect = searchParams.get("redirect") ?? undefined;

    openAuthModal(type, redirect);

    // Strip auth-related params from the URL without triggering a navigation
    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth");
    params.delete("type");
    params.delete("redirect");

    const cleanUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(cleanUrl, { scroll: false });
  }, [searchParams, router, pathname, openAuthModal]);

  return null;
}
