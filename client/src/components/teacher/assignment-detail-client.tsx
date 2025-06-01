"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  GraduationCap,
  User,
  Star,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import TeacherNavbar from "@/components/teacher/navbar";
import ClassSelect from "@/components/teacher/class-select";
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
import { teacherAPI, assignmentAPI } from "@/lib/api";

type AssignmentDetailClientProps = {
  assignmentId: string;
};

export const AssignmentDetailClient: React.FC<AssignmentDetailClientProps> = ({
  assignmentId,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const [teacherName, setTeacherName] = useState<string>("Teacher");
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingClass, setUpdatingClass] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [expandedSubmissions, setExpandedSubmissions] = useState<number[]>([]);
  const [isAssignmentExpanded, setIsAssignmentExpanded] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<
    number | number[] | "all" | null
  >(null);

  const fetchAssignment = async (id: string) => {
    setLoading(true);
    try {
      console.log("Fetching assignment with ID:", id);
      const response = await assignmentAPI.getWithSubmissions(id);
      console.log("Assignment response:", response);
      setAssignment(response.assignment);
      setSelectedClassIds(
        response.assignment.classes?.map(
          (c: any) => c.class?.id || c.classId
        ) || []
      );
      setSubmissions(response.submissions || []);

      if (response.assignment.teacher?.user?.fullName) {
        setTeacherName(response.assignment.teacher.user.fullName);
      }
    } catch (err: any) {
      console.error("Error fetching assignment:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      if (err.response?.status === 401) {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        router.push("/teacher/login");
        return;
      }

      if (err.response?.status === 404) {
        setError("Assignment not found");
      } else if (err.response?.status === 403) {
        setError("Access denied - This is not your assignment");
      } else {
        setError("Failed to load assignment");
      }

      toast({
        title: "Error",
        description:
          err.response?.data?.error || "Failed to load assignment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment(assignmentId);
    }
  }, [assignmentId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await assignmentAPI.delete(assignmentId);
      toast({
        title: "Assignment deleted",
        description: "The assignment has been deleted successfully",
      });
      router.push("/teacher/dashboard");
    } catch (err: any) {
      console.error("Error deleting assignment:", err);
      toast({
        title: "Deletion failed",
        description: err.response?.data?.error || "Failed to delete assignment",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateClass = async () => {
    if (!assignmentId) return;

    setUpdatingClass(true);
    try {
      await assignmentAPI.update(assignmentId, {
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
      });

      await fetchAssignment(assignmentId);

      toast({
        title: "Classes updated",
        description: "The assignment has been assigned to the selected classes",
      });
    } catch (err: any) {
      console.error("Error updating classes:", err);
      toast({
        title: "Update failed",
        description:
          err.response?.data?.error || "Failed to update class assignments",
        variant: "destructive",
      });
      setSelectedClassIds(
        assignment.classes?.map((c: any) => c.class?.id || c.classId) || []
      );
    } finally {
      setUpdatingClass(false);
    }
  };

  const toggleSubmission = (submissionId: number) => {
    setExpandedSubmissions((prev) =>
      prev.includes(submissionId)
        ? prev.filter((id) => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const getSubmissionStatusBadge = (submission: any) => {
    if (submission.aiFeedback && submission.aiScore !== null) {
      const score = submission.aiScore;
      if (score >= 80) return <Badge variant="default">Excellent</Badge>;
      if (score >= 60) return <Badge variant="secondary">Good</Badge>;
      return <Badge variant="outline">Needs Improvement</Badge>;
    }
    return <Badge variant="outline">Pending Review</Badge>;
  };

  const filteredSubmissions = submissions.filter((submission) => {
    if (!selectedClassFilter || selectedClassFilter === "all") return true;
    if (Array.isArray(selectedClassFilter)) {
      return selectedClassFilter.includes(submission.student?.classId);
    }
    return submission.student?.classId === selectedClassFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TeacherNavbar username={teacherName} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/teacher/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <CardTitle>Loading Assignment...</CardTitle>
                </div>
                <CardDescription>
                  Please wait while we fetch the assignment details
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-background">
        <TeacherNavbar username={teacherName} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="shadow-md p-6">
              <div className="flex flex-col items-center gap-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-bold">Assignment Not Available</h2>
                <p className="text-muted-foreground">
                  {error || "Unable to load assignment details"}
                </p>
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/teacher/dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                  <Button onClick={() => fetchAssignment(assignmentId)}>
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

  return (
    <div className="min-h-screen bg-background">
      <TeacherNavbar username={teacherName} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/teacher/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/teacher/assignments/edit/${assignmentId}`)
                }
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this assignment? This
                      action cannot be undone and will remove all associated
                      submissions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Assignment"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Card className="shadow-md mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due: {format(dueDate, "PPP")}
                    </div>
                    <span className="hidden sm:inline">|</span>
                    <div>
                      Created: {format(new Date(assignment.createdAt), "PPP")}
                    </div>
                  </CardDescription>
                </div>
                <Badge variant={isPastDue ? "destructive" : "default"}>
                  {isPastDue ? "Past Due" : "Active"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <p className="text-muted-foreground">
                      {assignment.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Assignment Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-primary/10 p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">
                        Total Submissions
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {submissions.length}
                      </div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">
                        Average Score
                      </div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {submissions.length > 0
                          ? Math.round(
                              submissions.reduce(
                                (acc, sub) => acc + (sub.aiScore || 0),
                                0
                              ) / submissions.length
                            )
                          : 0}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">
                        Completion Rate
                      </div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {assignment.totalStudents > 0
                          ? Math.round(
                              (submissions.length / assignment.totalStudents) *
                                100
                            )
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Student Submissions</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Filter by class:
                  </span>
                  <ClassSelect
                    selectedClassId={selectedClassFilter}
                    onClassChange={(classId) => {
                      if (classId === "all" || classId === null) {
                        setSelectedClassFilter(classId);
                      } else if (Array.isArray(classId)) {
                        const numericIds = classId
                          .map((id) =>
                            typeof id === "string" ? parseInt(id, 10) : id
                          )
                          .filter((id) => !isNaN(id));
                        setSelectedClassFilter(numericIds);
                      } else {
                        const numericId =
                          typeof classId === "string"
                            ? parseInt(classId, 10)
                            : classId;
                        if (!isNaN(numericId)) {
                          setSelectedClassFilter(numericId);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 rounded-md">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No submissions yet for this assignment
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <Card
                      key={submission.id}
                      className="border-l-4 border-l-primary/20"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-medium">
                                {submission.student?.user?.fullName ||
                                  submission.student?.user?.username ||
                                  "Unknown Student"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {submission.student?.class?.name ||
                                  "Unknown Class"}{" "}
                                •{" "}
                                {format(
                                  new Date(submission.submittedAt),
                                  "PPp"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getSubmissionStatusBadge(submission)}
                            {submission.aiScore !== null && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">
                                  {submission.aiScore}/100
                                </span>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSubmission(submission.id)}
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  expandedSubmissions.includes(submission.id)
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {expandedSubmissions.includes(submission.id) && (
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-medium mb-2">
                                Student Response
                              </h5>
                              <div className="bg-muted/30 p-3 rounded-md">
                                <p className="text-sm whitespace-pre-wrap">
                                  {submission.content}
                                </p>
                              </div>
                            </div>
                            {submission.aiFeedback && (
                              <div>
                                <h5 className="font-medium mb-2">
                                  AI Feedback
                                </h5>
                                <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-md">
                                  <p className="text-sm">
                                    {submission.aiFeedback}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
