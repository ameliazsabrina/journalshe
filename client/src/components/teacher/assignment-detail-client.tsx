"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
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

type AssignmentDetailClientProps = {
  assignmentId: string;
};

export const AssignmentDetailClient: React.FC<AssignmentDetailClientProps> = ({
  assignmentId,
}) => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://journalshe-server.azakiyasabrina.workers.dev";
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
      const response = await axios.get(
        `${apiUrl}/api/assignments/${id}/details`,
        {
          withCredentials: true,
        }
      );
      console.log("Assignment response:", response.data);
      setAssignment(response.data.assignment);
      setSelectedClassIds(
        response.data.assignment.classes?.map(
          (c: any) => c.class?.id || c.classId
        ) || []
      );
      setSubmissions(response.data.submissions || []);

      if (response.data.assignment.teacher?.user?.fullName) {
        setTeacherName(response.data.assignment.teacher.user.fullName);
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
      await axios.delete(`${apiUrl}/api/assignments/${assignmentId}`, {
        withCredentials: true,
      });
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
      await axios.put(
        `${apiUrl}/api/assignments/${assignmentId}`,
        {
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          classIds: selectedClassIds,
        },
        {
          withCredentials: true,
        }
      );

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

  const filteredSubmissions = submissions.filter((submission) => {
    if (!selectedClassFilter) return true;
    if (selectedClassFilter === "all") return true;
    if (Array.isArray(selectedClassFilter)) {
      return selectedClassFilter.includes(submission.student?.classId);
    }
    return submission.student?.classId === selectedClassFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TeacherNavbar username={teacherName} />
        <div
          className="container mx-auto px-4 py-8 flex justify-center items-center"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading assignment details...</p>
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
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-md p-6">
              <div className="flex flex-col items-center gap-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-bold">Error</h2>
                <p className="text-muted-foreground">
                  {error || "Assignment not found"}
                </p>
                <Button onClick={() => router.push("/teacher/dashboard")}>
                  Return to Dashboard
                </Button>
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
        <div className="max-w-3xl mx-auto">
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
            <CardHeader className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    Due: {format(dueDate, "PPP")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={isPastDue ? "destructive" : "default"}>
                    {isPastDue ? "Past Due" : "Active"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setIsAssignmentExpanded(!isAssignmentExpanded)
                    }
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isAssignmentExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {isAssignmentExpanded && (
              <CardContent className="space-y-6 pt-0">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div className="p-4 bg-muted/30 rounded-md">
                    <p className="text-muted-foreground">
                      {assignment.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Assignment Actions</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="flex items-center gap-2"
                      onClick={() =>
                        router.push(`/teacher/assignments/edit/${assignmentId}`)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Assignment
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="flex items-center gap-2"
                          disabled={deleting}
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Delete Assignment
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the assignment and remove it from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            )}
            <CardFooter>
              <div className="w-full bg-muted/30 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">
                  This assignment was created on{" "}
                  {format(new Date(assignment.createdAt), "PPP")}.
                  {assignment.updatedAt &&
                    assignment.updatedAt !== assignment.createdAt &&
                    ` Last updated on ${format(
                      new Date(assignment.updatedAt),
                      "PPP"
                    )}.`}
                </p>
              </div>
            </CardFooter>
          </Card>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Student Submissions</h2>
              <div className="w-64">
                <ClassSelect
                  selectedClassId={selectedClassFilter}
                  onClassChange={(classId) => {
                    if (classId === "all") {
                      setSelectedClassFilter("all");
                    } else if (Array.isArray(classId)) {
                      const numericIds = classId
                        .map((id) =>
                          typeof id === "string" ? parseInt(id, 10) : id
                        )
                        .filter((id) => !isNaN(id));
                      setSelectedClassFilter(numericIds);
                    } else if (typeof classId === "string") {
                      const numericId = parseInt(classId, 10);
                      setSelectedClassFilter(
                        isNaN(numericId) ? null : numericId
                      );
                    } else {
                      setSelectedClassFilter(classId);
                    }
                  }}
                />
              </div>
            </div>
            {filteredSubmissions.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-center">
                    {submissions.length === 0
                      ? "No submissions yet"
                      : "No submissions found for the selected class"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredSubmissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {submission.student?.user?.fullName || " "}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          {submission.aiScore !== null && (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Star className="h-4 w-4" />
                              Score: {submission.aiScore}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
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
                      <CardContent className="pt-0 px-4 pb-4">
                        <div className="space-y-4 border-t pt-4">
                          <div>
                            <h4 className="font-medium mb-2">Submission</h4>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                              {submission.content}
                            </p>
                          </div>
                          {submission.aiFeedback && (
                            <div>
                              <h4 className="font-medium mb-2">AI Feedback</h4>
                              <p className="text-muted-foreground whitespace-pre-wrap">
                                {submission.aiFeedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
