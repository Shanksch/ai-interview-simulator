"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteInterview } from "@/lib/actions/general.action";

const DeleteInterviewButton = ({
  interviewId,
  userId,
}: {
  interviewId: string;
  userId: string;
}) => {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this interview?")) return;

    try {
      const result = await deleteInterview({ interviewId, userId });
      if (result.success) {
        toast.success("Interview deleted.");
        router.refresh();
      } else {
        toast.error("Failed to delete interview.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-1.5 rounded bg-white/[0.04] border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 text-lp-text-muted transition-all duration-200 cursor-pointer flex items-center justify-center"
      title="Delete interview"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
};

export default DeleteInterviewButton;
