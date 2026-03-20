"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth.action";
import { toast } from "sonner";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully.");
      router.push("/sign-in");
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign out.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="btn-secondary cursor-pointer"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
