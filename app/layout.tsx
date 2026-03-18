import type { Metadata } from "next";
import { mona_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const monaSans = mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Aimhyr - AI Interview Simulator",
  description: "Aimhyr is an AI interview simulator that helps you prepare for your next job interview.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body
        className={`${monaSans.classname} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
