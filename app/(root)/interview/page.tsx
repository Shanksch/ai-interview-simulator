import InterviewForm from "@/components/InterviewForm";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Please sign in to create an interview.</div>;
  }

  return (
    <>
      <div className="w-full flex items-center justify-center pt-8">
        <InterviewForm userId={user.id} />
      </div>
    </>
  );
};

export default Page;