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
      className="absolute top-0 left-0 p-2 rounded-br-lg bg-destructive-100/80 hover:bg-destructive-100 transition-colors cursor-pointer"
      title="Delete interview"
    >
      <Trash2 className="size-4 text-white" />
    </button>
  );
};

export default DeleteInterviewButton;
