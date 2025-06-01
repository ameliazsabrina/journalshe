"use client";

import type React from "react";
import { Suspense } from "react";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
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

function EditAssignmentPageContent() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("id");
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
        const response = await axios.get(`${apiUrl}/api/teachers/me`, {
          withCredentials: true,
        });
        const user = response.data;
        if (!user.id) {
          toast({
            title: "User ID not found",
            description: "Please log in again",
            variant: "destructive",
          });
          router.push("/teacher/login");
          return;
        }
        setTeacherId(user.id);
        if (user.user?.fullName || user.username) {
          setTeacherName(user.user?.fullName || user.username);
        }
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
  }, [router, toast, apiUrl]);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) return;

      setFetchingAssignment(true);
      try {
        const response = await axios.get(
          `${apiUrl}/api/assignments/${assignmentId}`
        );
        const assignment = response.data;

        setTitle(assignment.title);
        setDescription(assignment.description || "");
        setDueDate(
          assignment.dueDate ? new Date(assignment.dueDate) : undefined
        );
        setSelectedClassId(
          assignment.classId ? assignment.classId.toString() : null
        );
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
  }, [assignmentId, router, toast, apiUrl]);

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
        const response = await axios.get(
          `${apiUrl}/api/teachers/${teacherId}/classes`,
          { withCredentials: true }
        );
        classIdsToSend = response.data.map((cls: any) => cls.id);
      } else if (selectedClassId && Array.isArray(selectedClassId)) {
        classIdsToSend = selectedClassId;
      } else if (selectedClassId && typeof selectedClassId === "number") {
        classIdsToSend = [selectedClassId];
      } else {
        const response = await axios.get(
          `${apiUrl}/api/teachers/${teacherId}/classes`,
          { withCredentials: true }
        );
        classIdsToSend = response.data.map((cls: any) => cls.id);
      }

      await axios.put(
        `${apiUrl}/api/assignments/${assignmentId}`,
        {
          title,
          description: description.trim() || null,
          dueDate,
          classIds: classIdsToSend,
        },
        { withCredentials: true }
      );

      toast({
        title: "Assignment updated!",
        description: "Your assignment has been updated successfully.",
      });

      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Failed to update assignment",
        description:
          error.response?.data?.error ||
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (assignmentId) {
      toast({
        title: "Changes reset",
        description: "Form has been reset to original values.",
      });
    }
    setFormErrors({});
  };

  const handleViewAssignment = () => {
    router.push(`/teacher/assignments/${assignmentId}`);
  };

  if (fetchingAssignment) {
    return (
      <div className="min-h-screen bg-background">
        <TeacherNavbar username={teacherName} />
        <div
          className="container mx-auto px-4 py-8 flex justify-center items-center"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading assignment...</p>
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
                Update details for this assignment
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
                        {!selectedClassId ||
                        (Array.isArray(selectedClassId) &&
                          selectedClassId.length === 0)
                          ? "This assignment will be available to all students in your assigned classes."
                          : Array.isArray(selectedClassId)
                          ? `This assignment will be available to students in ${
                              selectedClassId.length
                            } selected class${
                              selectedClassId.length > 1 ? "es" : ""
                            }.`
                          : typeof selectedClassId === "string" &&
                            selectedClassId === "all"
                          ? "This assignment will be available to students in all your classes."
                          : "This assignment will be available to students in the selected class."}{" "}
                        Changes will be immediately visible to students.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset Changes
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
                  Your assignment "{title}" has been updated successfully.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction asChild>
                  <Button className="w-full" onClick={handleViewAssignment}>
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <EditAssignmentPageContent />
    </Suspense>
  );
}
