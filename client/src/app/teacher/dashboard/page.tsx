"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TeacherNavbar from "@/components/teacher/navbar";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  dueDate: string;
  createdAt: string;
  teacherId: string;
  pointsPossible: number;
  submissionCount: number;
  totalStudents: number;
}

interface Teacher {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  school?: {
    id: string;
    name: string;
    address: string;
  };
  classes?: any[];
}

interface TeacherStats {
  totalAssignments: number;
  totalSubmissions: number;
  assignmentsDueSoon: number;
  averageCompletionRate: number;
}

export default function TeacherDashboardPage() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://journalshe-server.azakiyasabrina.workers.dev";
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const teacherResponse = await axios.get(`${apiUrl}/api/teachers/me`, {
          withCredentials: true,
        });
        setTeacher(teacherResponse.data.user || teacherResponse.data);

        const assignmentsResponse = await axios.get(
          `${apiUrl}/api/teachers/me/assignments`,
          { withCredentials: true }
        );
        setAssignments(assignmentsResponse.data);

        const statsResponse = await axios.get(
          `${apiUrl}/api/teachers/me/stats`,
          { withCredentials: true }
        );
        setStats(statsResponse.data);

        toast({
          title: "Dashboard loaded",
          description: `Found ${assignmentsResponse.data.length} assignments`,
        });
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

        if (err.response?.status === 404) {
          setError("Teacher profile not found");
        } else {
          setError("Failed to load dashboard data");
        }

        toast({
          title: "Error",
          description:
            err.response?.data?.error ||
            "Failed to load dashboard. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSubmissionRate = (submitted: number, total: number) => {
    return Math.round((submitted / total) * 100);
  };

  const getStatusBadge = (daysUntilDue: number, submissionRate: number) => {
    if (daysUntilDue < 0) {
      return <Badge variant="secondary">Past Due</Badge>;
    } else if (daysUntilDue <= 3) {
      return <Badge variant="destructive">Due Soon</Badge>;
    } else if (submissionRate >= 80) {
      return <Badge variant="default">Good Progress</Badge>;
    } else {
      return <Badge variant="outline">Active</Badge>;
    }
  };

  if (loading && !teacher) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="animate-pulse bg-muted h-16 w-full mb-6" />
        <main className="flex-1 p-6 container mx-auto">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="shadow-sm">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TeacherNavbar username={teacher?.fullName || "Teacher"} />

      <main className="flex-1 p-6 container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
            <p className="text-muted-foreground">
              Manage and track your class assignments
            </p>
          </div>
          <Button asChild>
            <Link
              href="/teacher/assignments/create"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Assignment
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-destructive/10 border-destructive/20 shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">Error: {error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : assignments.length === 0 ? (
          <Card className="bg-muted/50 border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first assignment to get started with your class.
              </p>
              <Button asChild>
                <Link href="/teacher/assignments/create">
                  Create Assignment
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => {
              const daysUntilDue = getDaysUntilDue(assignment.dueDate);
              const submissionRate = getSubmissionRate(
                assignment.submissionCount,
                assignment.totalStudents
              );

              return (
                <Card
                  key={assignment.id}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 mb-2">
                          {assignment.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due {formatDate(assignment.dueDate)}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/teacher/assignments/${assignment.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/teacher/assignments/${assignment.id}/edit`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Assignment
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {assignment.description}
                    </p>

                    <div className="flex items-center justify-between">
                      {getStatusBadge(daysUntilDue, submissionRate)}
                      <div className="text-sm text-muted-foreground">
                        {assignment.pointsPossible} points
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Submissions
                        </span>
                        <span className="font-medium">
                          {assignment.submissionCount}/
                          {assignment.totalStudents}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${submissionRate}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground text-center">
                        {submissionRate}% completion rate
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {daysUntilDue > 0
                          ? `${daysUntilDue} days left`
                          : daysUntilDue === 0
                          ? "Due today"
                          : `${Math.abs(daysUntilDue)} days overdue`}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {assignment.totalStudents} students
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/teacher/assignments/${assignment.id}`}>
                        View Submissions
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && assignments.length > 0 && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.totalAssignments}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Assignments
                </div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.totalSubmissions}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Submissions
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.averageCompletionRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg. Completion
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.assignmentsDueSoon}
                </div>
                <div className="text-sm text-muted-foreground">Due Soon</div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
