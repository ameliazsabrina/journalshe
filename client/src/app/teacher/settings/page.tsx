"use client";

import { useEffect, useState } from "react";
import axios from "axios";
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
import { useToast } from "@/components/ui/use-toast";

import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  BookOpen,
  School,
  Trash2,
  Plus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import TeacherNavbar from "@/components/teacher/navbar";

interface SchoolClass {
  id: number;
  name: string;
}

interface TeacherProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  school?: {
    id: string;
    name: string;
    address: string;
  };
  classes: {
    id: string;
    name: string;
  }[];
}

export default function TeacherSettingsPage() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://journalshe-server.azakiyasabrina.workers.dev";
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<TeacherProfile | null>(null);
  const [availableClasses, setAvailableClasses] = useState<SchoolClass[]>([]);
  const [assignedClassIds, setAssignedClassIds] = useState<number[]>([]);
  const [selectedNewClassId, setSelectedNewClassId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        setError(null);

        const profileResponse = await axios.get(`${apiUrl}/api/teachers/me`, {
          withCredentials: true,
        });

        if (profileResponse.data?.user) {
          setUser(profileResponse.data.user);
        } else {
          throw new Error("Invalid profile data");
        }

        const classesResponse = await axios.get(
          `${apiUrl}/api/teachers/me/school-classes`,
          {
            withCredentials: true,
          }
        );

        if (classesResponse.data) {
          setAvailableClasses(classesResponse.data.classes || []);
          setAssignedClassIds(classesResponse.data.assignedClassIds || []);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);

        if (err.response?.status === 401) {
          toast({
            title: "Authentication required",
            description: "Please sign in to continue",
            variant: "destructive",
          });
          router.push("/teacher/login");
          return;
        }

        setError("Failed to load data");
        toast({
          title: "Error",
          description:
            err.response?.data?.error || "Failed to load settings data",
          variant: "destructive",
        });
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [router, toast, apiUrl]);

  const refreshData = async () => {
    try {
      const [profileResponse, classesResponse] = await Promise.all([
        axios.get(`${apiUrl}/api/teachers/me`, {
          withCredentials: true,
        }),
        axios.get(`${apiUrl}/api/teachers/me/school-classes`, {
          withCredentials: true,
        }),
      ]);

      if (profileResponse.data?.user) {
        setUser(profileResponse.data.user);
      }

      if (classesResponse.data) {
        setAvailableClasses(classesResponse.data.classes || []);
        setAssignedClassIds(classesResponse.data.assignedClassIds || []);
      }
    } catch (err: any) {
      console.error("Error refreshing data:", err);
    }
  };

  const handleAddClass = async () => {
    if (!user || !selectedNewClassId) return;

    setLoading(true);
    try {
      const newClassIds = [...assignedClassIds, parseInt(selectedNewClassId)];

      await axios.put(
        `${apiUrl}/api/teachers/me/classes`,
        {
          classIds: newClassIds,
        },
        {
          withCredentials: true,
        }
      );

      toast({
        title: "Class added",
        description: "The class has been added to your assignments",
      });

      setSelectedNewClassId("");
      await refreshData();
    } catch (err: any) {
      console.error("Error adding class:", err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to add class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!user) return;

    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/teachers/me/classes/${classId}`, {
        withCredentials: true,
      });

      toast({
        title: "Class removed",
        description: "The class has been removed from your assignments",
      });

      await refreshData();
      setShowDeleteDialog(false);
      setClassToDelete(null);
    } catch (err: any) {
      console.error("Error removing class:", err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to remove class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableClassesToAdd = () => {
    return availableClasses.filter((cls) => !assignedClassIds.includes(cls.id));
  };

  const getAssignedClasses = () => {
    return availableClasses.filter((cls) => assignedClassIds.includes(cls.id));
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-background">
        <TeacherNavbar username="Teacher" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-32" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <TeacherNavbar username="Teachr" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-6">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-destructive/10 p-3 rounded-full">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h2 className="text-xl font-bold">Settings Not Available</h2>
                  <p className="text-muted-foreground">
                    {error || "Failed to load your settings"}
                  </p>
                  <div className="flex gap-4 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/teacher/dashboard")}
                    >
                      Back to Dashboard
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

  const assignedClasses = getAssignedClasses();
  const availableToAdd = getAvailableClassesToAdd();

  return (
    <div className="min-h-screen bg-background">
      <TeacherNavbar username={user.fullName || "Teacher"} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6 justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/teacher/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>

            <h2 className="text-2xl font-bold">Settings</h2>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Your Current Classes</CardTitle>
              </div>
              <CardDescription>
                Classes you are currently teaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!user.school ? (
                <div className="bg-muted/30 p-4 rounded-md text-center">
                  <School className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-2">
                    You are not assigned to any school yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please contact an administrator to be assigned to a school
                    before managing classes.
                  </p>
                </div>
              ) : assignedClasses.length === 0 ? (
                <div className="bg-muted/30 p-4 rounded-md text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-2">
                    No classes assigned yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add classes from the section below to start teaching.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-medium">{cls.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setClassToDelete(cls.id);
                          setShowDeleteDialog(true);
                        }}
                        disabled={loading}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {user.school && (
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <CardTitle>Add New Class</CardTitle>
                </div>
                <CardDescription>
                  Select a class from your school to add to your assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableToAdd.length === 0 ? (
                  <div className="bg-muted/30 p-4 rounded-md text-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-2">
                      All available classes are already assigned
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Contact an administrator if you need access to more
                      classes.
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="class-select">Select Class</Label>
                      <Select
                        value={selectedNewClassId}
                        onValueChange={setSelectedNewClassId}
                      >
                        <SelectTrigger id="class-select">
                          <SelectValue placeholder="Choose a class to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableToAdd.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id.toString()}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleAddClass}
                      disabled={!selectedNewClassId || loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add Class
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Class</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this class from your
                  assignments? This action cannot be undone and you will lose
                  access to manage this class.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setClassToDelete(null);
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (classToDelete) {
                      handleDeleteClass(classToDelete);
                    }
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remove Class
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
