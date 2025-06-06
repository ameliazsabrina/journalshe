"use client";

import type React from "react";
import { Suspense } from "react";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  CalendarIcon,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import TeacherNavbar from "@/components/teacher/navbar";
import ClassSelect from "@/components/teacher/class-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { teacherAPI, assignmentAPI } from "@/lib/api";

function EditAssignmentPageContent() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  const { toast } = useToast();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string>("Teacher");
  const [loading, setLoading] = useState(false);
  const [fetchingAssignment, setFetchingAssignment] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [selectedClassId, setSelectedClassId] = useState<
    number | number[] | null
  >(null);
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    dueDate?: string;
  }>({});

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const data = await teacherAPI.getCurrentTeacher();

        if (!data.user?.id) {
          toast({
            title: "User ID not found",
            description: "Please log in again",
            variant: "destructive",
          });
          router.push("/teacher/login");
          return;
        }

        if (!data.teacherId) {
          toast({
            title: "Teacher ID not found",
            description: "Please log in again",
            variant: "destructive",
          });
          router.push("/teacher/login");
          return;
        }

        setTeacherId(data.teacherId);
        setTeacherName(data.user.fullName || data.user.username || "Teacher");
      } catch (error) {
        console.error("Error fetching teacher:", error);
        toast({
          title: "Authentication required",
          description: "Please log in to edit assignments",
          variant: "destructive",
        });
        router.push("/teacher/login");
      }
    };

    fetchTeacher();
  }, [router, toast]);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) return;

      setFetchingAssignment(true);
      try {
        const assignment = await assignmentAPI.getById(assignmentId);

        setTitle(assignment.title);
        setDescription(assignment.description || "");
        setDueDate(
          assignment.dueDate ? new Date(assignment.dueDate) : undefined
        );

        // For now, set to null - the ClassSelect component will handle the default selection
        setSelectedClassId(null);
      } catch (error: any) {
        console.error("Error fetching assignment:", error);
        toast({
          title: "Failed to fetch assignment",
          description: error.response?.data?.error || "Assignment not found",
          variant: "destructive",
        });
        router.push("/teacher/dashboard");
      } finally {
        setFetchingAssignment(false);
      }
    };

    fetchAssignment();
  }, [assignmentId, router, toast]);

  const validateForm = () => {
    const errors: { title?: string; dueDate?: string } = {};
    let isValid = true;

    if (!title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }

    if (!dueDate) {
      errors.dueDate = "Due date is required";
      isValid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(dueDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.dueDate = "Due date cannot be in the past";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!assignmentId) {
      toast({
        title: "Error",
        description: "Assignment ID not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let classIdsToSend: number[] = [];

      if (typeof selectedClassId === "string" && selectedClassId === "all") {
        const classes = await teacherAPI.getTeacherClasses(teacherId!);
        classIdsToSend = classes.map((cls: any) => cls.id);
      } else if (selectedClassId && Array.isArray(selectedClassId)) {
        classIdsToSend = selectedClassId;
      } else if (selectedClassId && typeof selectedClassId === "number") {
        classIdsToSend = [selectedClassId];
      } else {
        const classes = await teacherAPI.getTeacherClasses(teacherId!);
        classIdsToSend = classes.map((cls: any) => cls.id);
      }

      console.log("Updating assignment with classIds:", classIdsToSend);

      const response = await assignmentAPI.update(assignmentId, {
        title,
        description: description.trim() || "",
        dueDate: dueDate!.toISOString(),
      });

      console.log("Assignment updated:", response);
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Failed to update assignment",
        description:
          error.response?.data?.error || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setDueDate(undefined);
    setSelectedClassId(null);
    setFormErrors({});
  };

  const handleViewAssignment = () => {
    router.push(`/teacher/assignments/${assignmentId}`);
  };

  if (fetchingAssignment) {
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
            <CardHeader>
              <CardTitle>Edit Assignment</CardTitle>
              <CardDescription>
                Update the assignment details below
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-1">
                    Assignment Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter assignment title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={formErrors.title ? "border-destructive" : ""}
                  />
                  {formErrors.title && (
                    <p className="text-sm text-destructive">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter assignment description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                  />
                </div>

                {teacherId && (
                  <ClassSelect
                    selectedClassId={selectedClassId}
                    onClassChange={(classId: any) =>
                      setSelectedClassId(classId)
                    }
                  />
                )}

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="flex items-center gap-1">
                    Due Date <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground",
                          formErrors.dueDate && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? (
                          format(dueDate, "PPP")
                        ) : (
                          <span>Select due date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.dueDate && (
                    <p className="text-sm text-destructive">
                      {formErrors.dueDate}
                    </p>
                  )}
                </div>

                <div className="bg-muted/30 p-4 rounded-md">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">
                        Important Information
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Changes to this assignment will be immediately visible
                        to students. Make sure all details are correct before
                        saving.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset Form
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Assignment"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Success Dialog */}
          <AlertDialog
            open={showSuccessDialog}
            onOpenChange={setShowSuccessDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <AlertDialogTitle>
                    Assignment Updated Successfully
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription>
                  Your assignment "{title}" has been updated and the changes are
                  now visible to your students.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="sm:w-full"
                  onClick={() => setShowSuccessDialog(false)}
                >
                  Continue Editing
                </Button>
                <AlertDialogAction asChild>
                  <Button className="sm:w-full" onClick={handleViewAssignment}>
                    View Assignment
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

export default function EditAssignmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditAssignmentPageContent />
    </Suspense>
  );
}
