"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type AuthType = "sign-in" | "sign-up";

interface AuthModalState {
  isOpen: boolean;
  type: AuthType;
  redirectTo: string | null;
}

interface AuthModalContextValue extends AuthModalState {
  openAuthModal: (type?: AuthType, redirectTo?: string) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within <AuthModalProvider>");
  }
  return ctx;
}

export default function AuthModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<AuthModalState>({
    isOpen: false,
    type: "sign-in",
    redirectTo: null,
  });

  const openAuthModal = useCallback(
    (type: AuthType = "sign-in", redirectTo?: string) => {
      setState({ isOpen: true, type, redirectTo: redirectTo ?? null });
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, redirectTo: null }));
  }, []);

  return (
    <AuthModalContext.Provider
      value={{ ...state, openAuthModal, closeAuthModal }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}
