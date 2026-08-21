import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Aimhyr — AI Interview Practice & Feedback",
  description:
    "Practice job interviews with AI-powered mock sessions. Get instant, specific feedback on your answers. Voice and text mode. 50+ industries. Start free.",
};

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
