"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar, Send, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import StudentNavbar from "@/components/student/navbar";
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
import axios from "axios";

export default async function StudentTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const assignmentId = resolvedParams.id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const router = useRouter();
  const [journalText, setJournalText] = useState("");
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentStudent = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/students/me`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching current student:", error);
      throw error;
    }
  };

  const fetchAssignment = async (assignmentId: string) => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/assignments/${assignmentId}`,
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

  const submitAssignment = async (
    content: string,
    assignmentId: string,
    studentId: string
  ) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/submissions`,
        {
          content,
          assignmentId: parseInt(assignmentId),
          studentId,
        },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting assignment:", error);
      throw error;
    }
  };

  const regenerateAIFeedback = async (submissionId: number) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/submissions/${submissionId}/regenerate-feedback`,
        {},
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error regenerating AI feedback:", error);
      throw error;
    }
  };

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

        setUser(currentStudent.user);
        setStudentId(currentStudent.id);

        const assignmentData = await fetchAssignment(assignmentId);

        if (!assignmentData) {
          setError("Assignment not found");
          return;
        }

        setAssignment(assignmentData);

        toast({
          title: "Task loaded",
          description: `Ready to work on: ${assignmentData.title}`,
        });
      } catch (err: any) {
        console.error("Error loading assignment:", err);

        if (err.response?.status === 401) {
          router.push("/student/login");
          return;
        }

        if (err.response?.status === 404) {
          setError("Assignment not found");
        } else {
          setError("Failed to load assignment");
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

  const handleSubmission = async () => {
    if (!journalText.trim()) {
      toast({
        title: "Error",
        description: "Please write something before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!studentId) {
      toast({
        title: "Error",
        description: "Student information not found.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitAssignment(
        journalText,
        assignmentId,
        studentId
      );

      setSubmissionResult(result);

      toast({
        title: "Submitted!",
        description: "Your assignment has been submitted successfully.",
        variant: "default",
      });

      setJournalText("");
    } catch (err: any) {
      console.error("Submission failed:", err);
      toast({
        title: "Error",
        description:
          err.response?.data?.error || "Failed to submit assignment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!studentId && !loading) {
    return null;
  }

  if (loading) {
    return (
      <div>
        <StudentNavbar username={user?.username || "Student"} />
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <Card className="shadow-md">
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
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

  if (error || !assignment) {
    return (
      <div>
        <StudentNavbar username={user?.username || "Student"} />
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="shadow-md p-6">
              <div className="flex flex-col items-center gap-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-bold">Failed to load task</h2>
                <p className="text-muted-foreground">
                  {error ||
                    "There was an error loading this task. Please try again."}
                </p>
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/student/task")}
                  >
                    Back to Tasks
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const dueDate = new Date(assignment.dueDate);
  const isPastDue = dueDate < new Date();
  const characterCount = journalText.length;
  const minRecommendedChars = 100;
  const progress = Math.min(
    100,
    Math.round((characterCount / minRecommendedChars) * 100)
  );

  return (
    <div>
      <StudentNavbar username={user?.username || "Student"} />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/student/task")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Tasks</span>
            </Button>
          </nav>

          <Card className="shadow-md">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due: {dueDate.toLocaleDateString()}
                    </div>
                    <span className="hidden sm:inline">|</span>
                    <div>
                      Assigned by:{" "}
                      {assignment.teacher?.user?.fullName || "Teacher"}
                    </div>
                  </CardDescription>
                </div>
                <Badge variant={isPastDue ? "destructive" : "default"}>
                  {isPastDue ? "Past Due" : "Active"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-muted/30 rounded-md">
                <h3 className="font-semibold mb-2">Instructions</h3>
                <p className="text-muted-foreground">
                  {assignment.description || "No description provided."}
                </p>
              </div>

              <h3 className="font-semibold mt-6 mb-2">Write Your Response</h3>
              <Textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Write your response here..."
                rows={8}
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

              <div className="flex justify-end mt-4">
                <AlertDialog
                  open={showConfirmDialog}
                  onOpenChange={setShowConfirmDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      className="gap-2"
                      disabled={!journalText.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Assignment
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Submit your assignment?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Once submitted, you won't be able to edit your response.
                        Are you sure you want to submit?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmission}>
                        Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {submissionResult && (
                <div className="mt-6 p-4 bg-muted/30 rounded-md border animate-in fade-in-50 duration-300">
                  <h3 className="font-semibold">Submission Successful!</h3>
                  <p className="mt-2">
                    Your assignment has been submitted successfully. You will
                    receive AI feedback shortly.
                  </p>

                  {submissionResult.aiFeedback && (
                    <>
                      <h4 className="font-semibold mt-4">AI Feedback:</h4>
                      <p className="mt-2">{submissionResult.aiFeedback}</p>
                    </>
                  )}

                  {submissionResult.aiScore && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="font-semibold">Score:</span>
                      <Badge
                        variant={
                          submissionResult.aiScore > 80
                            ? "default"
                            : submissionResult.aiScore > 60
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {submissionResult.aiScore}/100
                      </Badge>
                    </div>
                  )}

                  {submissionResult.aiFeedback && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await regenerateAIFeedback(submissionResult.id);
                            toast({
                              title: "Feedback regeneration started",
                              description:
                                "AI feedback is being regenerated. This may take a moment.",
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description:
                                "Failed to regenerate feedback. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Regenerate Feedback
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/student/task">Back to Tasks</Link>
              </Button>

              {submissionResult && (
                <Button
                  asChild
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  <Link href="/student/dashboard">Go to Dashboard</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
