"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import StudentNavbar from "@/components/student/navbar";
import { ArrowLeft, Search, Calendar, SortAsc, SortDesc } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { studentAPI, assignmentAPI } from "@/lib/api";

export default function StudentTasksPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(true);
  const [student, setStudent] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const router = useRouter();
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentStudent = await studentAPI.getCurrentStudent();

      if (!currentStudent) {
        setIsAuthenticated(false);
        router.push("/student/login");
        return;
      }

      setStudent(currentStudent);
      setStudentId(currentStudent.id);
      setClassId(currentStudent.classId);

      const [assignmentsData, submissionsData] = await Promise.all([
        assignmentAPI.getByClass(currentStudent.classId),
        studentAPI.getSubmissions(currentStudent.id),
      ]);

      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("Error loading task data:", error);
      setError(error.message || "Failed to load tasks");

      if (
        error.response?.status === 401 ||
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized")
      ) {
        setIsAuthenticated(false);
        router.push("/student/login");
        return;
      }

      toast({
        title: "Error loading tasks",
        description: "Failed to load your tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router, toast]);

  const getTaskStatus = (dueDate: string) => {
    const now = new Date();
    const taskDueDate = new Date(dueDate);
    const diffTime = taskDueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: "Past due", variant: "destructive" as const };
    } else if (diffDays <= 2) {
      return { label: "Due soon", variant: "default" as const };
    } else {
      return {
        label: `Due in ${diffDays} days`,
        variant: "secondary" as const,
      };
    }
  };

  const getFilteredAndSortedAssignments = () => {
    let filteredAssignments = [...assignments];

    filteredAssignments = filteredAssignments.filter(
      (task: any) => !submissions.some((sub) => sub.assignment?.id === task.id)
    );

    if (searchQuery) {
      filteredAssignments = filteredAssignments.filter(
        (task) =>
          task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      const now = new Date();
      filteredAssignments = filteredAssignments.filter((task) => {
        if (!task.dueDate) return true;
        const dueDate = new Date(task.dueDate);
        return filterStatus === "upcoming" ? dueDate > now : dueDate < now;
      });
    }

    filteredAssignments.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return sortOrder === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

    return filteredAssignments;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access your tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/student/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayedAssignments = getFilteredAndSortedAssignments();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudentNavbar username={student?.user?.username || "Student"} />
      <div className="flex-grow px-4 py-6 md:px-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/student/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
            <span className="mx-2 text-muted-foreground">/</span>
            <span>Tasks</span>
          </nav>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">Your Tasks</h1>
                <p className="text-muted-foreground">
                  View and manage your writing assignments
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={filterStatus}
                    onValueChange={(value: "all" | "upcoming" | "past") =>
                      setFilterStatus(value)
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="past">Past Due</SelectItem>
                    </SelectContent>
                  </Select>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                          }
                        >
                          {sortOrder === "asc" ? (
                            <SortAsc className="h-4 w-4" />
                          ) : (
                            <SortDesc className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sort by due date</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="shadow-md">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="bg-destructive/10 border-destructive/20 shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-destructive">Error: {error}</p>
                  <Button
                    onClick={() => loadData()}
                    className="mt-4"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : displayedAssignments.length === 0 ? (
              <Card className="bg-muted/50 border-none shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterStatus !== "all"
                      ? "No tasks match your current filters."
                      : "No new tasks available at the moment."}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {(searchQuery || filterStatus !== "all") && (
                      <Button
                        onClick={() => {
                          setSearchQuery("");
                          setFilterStatus("all");
                        }}
                        variant="outline"
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Button
                      onClick={() => router.push("/student/dashboard")}
                      variant="secondary"
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedAssignments.map((task: any) => {
                  const status = task.dueDate
                    ? getTaskStatus(task.dueDate)
                    : { label: "No due date", variant: "outline" as const };

                  const isUpcoming =
                    task.dueDate && new Date(task.dueDate) > new Date();

                  return (
                    <Card
                      key={task.id}
                      className="shadow-md hover:shadow-lg transition-all duration-300 group"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base leading-tight">
                            {task.title}
                          </CardTitle>
                          <Badge
                            variant={status.variant}
                            className="ml-2 shrink-0"
                          >
                            {status.label}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "No due date"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-1 mb-3">
                          <span className="text-xs font-medium text-muted-foreground">
                            Assigned by:
                          </span>
                          <span className="text-xs text-foreground">
                            {task.teacher?.user?.fullName || "Teacher"}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                          {task.description || "No description provided."}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          onClick={() =>
                            router.push(`/student/task/submit/${task.id}`)
                          }
                        >
                          Start Task
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}

            {!loading && !error && displayedAssignments.length > 0 && (
              <div className="text-center text-sm text-muted-foreground mt-8">
                Showing {displayedAssignments.length} available task
                {displayedAssignments.length !== 1 ? "s" : ""}
                {submissions.length > 0 && (
                  <span className="block mt-1">
                    ({submissions.length} task
                    {submissions.length !== 1 ? "s" : ""} already completed)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
