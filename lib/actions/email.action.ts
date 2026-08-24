"use server";

import { Resend } from "resend";
import { auth } from "@/firebase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendCustomVerificationEmail = async (email: string, name: string = "User") => {
  try {
    // 1. Generate the verification link via Firebase Admin SDK
    const actionCodeSettings = {
      // The URL you want to redirect back to. We point it to the custom handler we built.
      url: process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/action`
        : "http://localhost:3000/auth/action",
      handleCodeInApp: true,
    };

    const link = await auth.generateEmailVerificationLink(email, actionCodeSettings);

    // 2. Send the email via Resend
    const { data, error } = await resend.emails.send({
      // Use onboarding@resend.dev for testing, or your verified domain
      from: "Aimhyr <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your email to start practicing",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0f1014; color: #f5f5f5; border-radius: 12px;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Welcome to Aimhyr!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
            Hi ${name},<br><br>
            Thanks for creating an account. You're just one step away from practicing realistic AI mock interviews. 
            Please verify your email address to continue.
          </p>
          
          <a href="${link}" style="display: inline-block; background-color: #e8a04c; color: #000000; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; margin-bottom: 24px;">
            Verify Email Address
          </a>
          
          <p style="font-size: 14px; line-height: 1.5; color: #71717a; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${link}" style="color: #e8a04c; word-break: break-all;">${link}</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, message: "Failed to send email." };
    }

    return { success: true, message: "Verification email sent!" };
  } catch (error: any) {
    console.error("Error sending custom verification email:", error);
    return { success: false, message: "An error occurred while sending the email." };
  }
};
