"use client";

import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createInterviewFromForm } from "@/lib/actions/general.action";

const formSchema = z.object({
  role: z.string().min(2, "Role must be at least 2 characters."),
  level: z.enum(["junior", "mid", "senior", "lead"]),
  type: z.enum(["technical", "behavioural", "mixed"]),
  techstack: z.string().min(2, "Please enter at least one technology."),
  amount: z.coerce.number().min(1).max(20).default(5),
});

interface InterviewFormProps {
  userId: string;
}

const InterviewForm = ({ userId }: InterviewFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
      level: "mid",
      type: "mixed",
      techstack: "",
      amount: 5,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const result = await createInterviewFromForm({
        userId,
        ...values,
      });

      if (result.success) {
        toast.success("Interview created successfully!");
        router.push("/");
      } else {
        toast.error("Failed to create interview. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during creation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const levels = ["junior", "mid", "senior", "lead"];
  const types = ["technical", "behavioural", "mixed"];

  return (
    <div className="card-border lg:min-w-[566px] w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-6 card py-10 px-8 sm:px-12">
        <div className="text-center space-y-2">
          <h2 className="text-primary-100">Create Interview</h2>
          <p className="text-light-100 text-sm">Configure your AI mock interview session.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 form">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label font-medium">Job Role</FormLabel>
                  <FormControl>
                    <Input className="input bg-dark-200" placeholder="e.g. Frontend Developer" {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive-100" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="label font-medium">Experience Level</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {levels.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => field.onChange(level)}
                          className={`pill-btn capitalize ${
                            field.value === level ? "active" : ""
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive-100" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="label font-medium">Interview Type</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {types.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => field.onChange(type)}
                          className={`pill-btn capitalize ${
                            field.value === type ? "active" : ""
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive-100" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="techstack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label font-medium">Tech Stack (comma separated)</FormLabel>
                  <FormControl>
                    <Input className="input bg-dark-200" placeholder="e.g. React, Next.js, Tailwind" {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive-100" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label font-medium">Number of Questions</FormLabel>
                  <FormControl>
                    <Input 
                      className="input bg-dark-200" 
                      type="number"
                      min={1}
                      max={20}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-destructive-100" />
                </FormItem>
              )}
            />

            <Button className="btn w-full mt-8" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Create Interview"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default InterviewForm;
