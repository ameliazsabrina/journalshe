"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Send,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  HelpCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import StudentNavbar from "@/components/student/navbar";
import { format } from "date-fns";
import axios from "axios";

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  dueDate: string;
  teacherId: string;
  teacher: {
    user: {
      username: string;
      fullName: string;
    };
  };
}

interface TaskSubmitProps {
  assignmentId: string;
}

export default function TaskSubmit({ assignmentId }: TaskSubmitProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>("");
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const fetchCurrentStudent = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/students/me`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching current student:", error);
      throw error;
    }
  };

  const fetchAssignment = async (assignmentId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/assignments/${assignmentId}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching assignment:", error);
      throw error;
    }
  };

  const getSubmissionById = async (submissionId: number) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/submissions/${submissionId}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching submission:", error);
      throw error;
    }
  };

  const pollForFeedback = useCallback(async (submissionId: number) => {
    const maxAttempts = 12;
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const updatedSubmission = await getSubmissionById(submissionId);

        if (
          updatedSubmission.aiFeedback &&
          updatedSubmission.aiScore !== null
        ) {
          setSubmissionResult(updatedSubmission);
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          console.log("Max polling attempts reached for AI feedback");
        }
      } catch (error) {
        console.error("Error polling for feedback:", error);
      }
    };

    poll();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentStudent = await fetchCurrentStudent();

        if (!currentStudent) {
          router.push("/student/login");
          return;
        }

        setStudentId(currentStudent.id);
        setStudentName(
          currentStudent.user?.fullName || currentStudent.user?.username
        );

        const assignmentData = await fetchAssignment(assignmentId);

        if (!assignmentData) {
          setError(
            "Assignment not found. Please select a valid task to submit."
          );
          return;
        }

        setAssignment(assignmentData);

        toast({
          title: "Task loaded",
          description: `Ready to work on: ${assignmentData.title}`,
        });
      } catch (err: any) {
        console.error("Error loading data:", err);

        if (err.response?.status === 401) {
          router.push("/student/login");
          return;
        }

        if (err.response?.status === 404) {
          setError(
            "Assignment not found. Please select a valid task to submit."
          );
        } else {
          setError("Failed to load assignment. Please try again.");
        }

        toast({
          title: "Error",
          description: "Failed to load assignment details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [assignmentId, router, toast]);

  const handleSubmit = async (
    content: string,
    assignmentId: string,
    studentId: string
  ) => {
    const result = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/submissions`,
      {
        content: content,
        assignmentId: parseInt(assignmentId),
        studentId,
      },
      {
        withCredentials: true,
      }
    );
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please write something before submitting",
        variant: "destructive",
      });
      return;
    }

    if (!studentId || !assignmentId) {
      toast({
        title: "Error",
        description: "Missing required information for submission",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      setSubmissionResult(result.data);
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);

      if (!result.data.aiFeedback) {
        pollForFeedback(result.data.id);
      }

      toast({
        title: "Submission successful",
        description:
          "Your assignment has been submitted successfully. AI feedback will be generated shortly.",
        variant: "default",
      });

      setTimeout(() => {
        router.push("/student/dashboard");
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting task:", err);
      toast({
        title: "Submission failed",
        description:
          err.response?.data?.error ||
          "Failed to submit your task. Please try again.",
        variant: "destructive",
      });
      setShowConfirmDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  const characterCount = submissionContent.length;
  const minRecommendedChars = 250;
  const progress = Math.min(
    100,
    Math.round((characterCount / minRecommendedChars) * 100)
  );

  const isPastDue = assignment
    ? new Date(assignment.dueDate) < new Date()
    : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar username={studentName} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar username={studentName} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-6">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-destructive/10 p-3 rounded-full">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h2 className="text-xl font-bold">Task Not Available</h2>
                  <p className="text-muted-foreground">{error}</p>
                  <div className="flex gap-4 mt-4">
                    <Button variant="outline" asChild>
                      <Link href="/student/task">Back to Tasks</Link>
                    </Button>
                    <Button onClick={() => window.location.reload()}>
                      Retry
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar username={studentName} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/student/task")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Tasks</span>
            </Button>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle className="text-2xl">
                    {assignment?.title}
                  </CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due: {format(new Date(assignment?.dueDate || ""), "PPP")}
                    </div>
                    <span className="hidden sm:inline">|</span>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Assigned by: {assignment?.teacher?.user?.fullName}
                    </div>
                  </CardDescription>
                </div>
                {isPastDue ? (
                  <Badge
                    variant="destructive"
                    className="self-start md:self-center"
                  >
                    Past Due
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="self-start md:self-center"
                  >
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Task Instructions</h3>
                <p className="text-muted-foreground">
                  {assignment?.description ||
                    "No specific instructions provided for this task."}
                </p>
              </div>

              <Tabs defaultValue="write">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="write">Write Submission</TabsTrigger>
                  <TabsTrigger value="tips">Tips & Guidelines</TabsTrigger>
                </TabsList>

                <TabsContent value="write" className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Your Submission</h3>
                    <Textarea
                      placeholder="Write your response here..."
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      rows={12}
                      className="w-full bg-muted/50 rounded-md p-3 border focus:border-primary transition-colors"
                    />

                    <div className="mt-2 flex justify-between items-center text-sm text-muted-foreground">
                      <div>
                        Characters: {characterCount}
                        {characterCount < minRecommendedChars && (
                          <span className="ml-1">
                            (Recommended: at least {minRecommendedChars})
                          </span>
                        )}
                      </div>
                      <div className="w-1/3">
                        <Progress value={progress} className="h-1" />
                      </div>
                    </div>
                  </div>

                  {isPastDue && (
                    <div className="bg-destructive/10 p-4 rounded-md flex items-start gap-3">
                      <Clock className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-1 text-destructive">
                          Past Due Warning
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          This task is past its due date. Your submission may
                          still be accepted, but it will be marked as late.
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tips" className="mt-4 space-y-4">
                  <div className="bg-muted/30 p-4 rounded-md">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Submission Guidelines
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>
                        Write clearly and concisely, focusing on the task
                        requirements
                      </li>
                      <li>
                        Aim for at least 250 characters to provide a meaningful
                        response
                      </li>
                      <li>
                        Proofread your submission before sending to catch any
                        errors
                      </li>
                      <li>Once submitted, you cannot edit your response</li>
                      <li>
                        Your submission will be evaluated by AI and may also be
                        reviewed by your teacher
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-md">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      What Happens After Submission
                    </h3>
                    <p className="text-muted-foreground">
                      After submitting your task, our AI will analyze your
                      response and provide immediate feedback and a score. This
                      feedback is designed to help you understand your strengths
                      and areas for improvement. Your teacher may also provide
                      additional feedback later.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex justify-end">
              <AlertDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    className="gap-2"
                    disabled={!submissionContent.trim() || submitting}
                    variant={isPastDue ? "outline" : "default"}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Task
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to submit your response? Once
                      submitted, you won't be able to edit it.
                      {isPastDue && (
                        <div className="mt-2 text-destructive font-medium">
                          Note: This submission will be marked as late.
                        </div>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        handleSubmit(
                          submissionContent,
                          assignmentId,
                          studentId || ""
                        )
                      }
                    >
                      Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>

          <AlertDialog
            open={showSuccessDialog}
            onOpenChange={setShowSuccessDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <AlertDialogTitle>Submission Successful</AlertDialogTitle>
                </div>
                <AlertDialogDescription>
                  Your response has been submitted successfully. Our AI is
                  analyzing your submission and will provide feedback shortly.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="p-4 bg-muted/30 rounded-md mt-2">
                {submissionResult?.aiFeedback ? (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">AI Feedback:</h3>
                      <p className="mt-1 text-muted-foreground">
                        {submissionResult.aiFeedback}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Score:</h3>
                      <Badge
                        variant={
                          (submissionResult.aiScore || 0) > 80
                            ? "default"
                            : (submissionResult.aiScore || 0) > 60
                            ? "secondary"
                            : "outline"
                        }
                        className="mt-1"
                      >
                        {submissionResult.aiScore}/100
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating feedback...</span>
                  </div>
                )}
              </div>
              <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                <AlertDialogCancel asChild>
                  <Button variant="outline" className="sm:flex-1" asChild>
                    <Link href="/student/task">Back to Tasks</Link>
                  </Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button className="sm:flex-1" asChild>
                    <Link href="/student/dashboard">Go to Dashboard</Link>
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
