"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw, Flame } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentNavbar from "@/components/student/navbar";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { studentAPI, assignmentAPI, loginStreakAPI } from "@/lib/api";

interface StreakData {
  currentStreak: number;
  lastLogin: string;
  user: {
    username: string;
    fullName: string;
  };
  recentLogins: Array<{
    loginDate: string;
    consecutive: boolean;
  }>;
}

export default function StudentDashboard() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

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

      await loginStreakAPI.record();

      const [
        assignmentData,
        submissionsData,
        streakDataResponse,
        submissionHistoryData,
      ] = await Promise.all([
        assignmentAPI.getByClass(currentStudent.classId),
        studentAPI.getSubmissions(currentStudent.id),
        loginStreakAPI.getMyStreak(),
        studentAPI.getSubmissions(currentStudent.id),
      ]);

      setAssignments(assignmentData);
      setSubmissions(submissionsData);
      setStreakData(streakDataResponse);
      setSubmissionHistory(submissionHistoryData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      setError(error.message || "Failed to load dashboard data");

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
        title: "Error loading dashboard",
        description: "Failed to load your dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router, toast]);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      await loadData();
      toast({
        title: "Dashboard refreshed",
        description: "Your dashboard has been updated with the latest data",
      });
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  const calculateCurrentStreak = () => {
    return streakData?.currentStreak || 0;
  };

  const currentStreakDays = calculateCurrentStreak();

  const generateStreakCalendar = () => {
    if (!streakData?.recentLogins) return [];

    const today = new Date();
    const calendar = [];

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      const loginData = streakData.recentLogins.find(
        (login) => login.loginDate === dateString
      );

      calendar.push({
        date: dateString,
        day: date.getDate(),
        weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
        hasLogin: !!loginData,
        consecutive: loginData?.consecutive || false,
      });
    }

    return calendar;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access your dashboard.
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudentNavbar username={student?.user?.username || "Student"} />

      <div className="flex-grow px-4 py-6 md:px-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-6">
            <ol className="flex text-sm text-muted-foreground">
              <li className="flex items-center">
                <Link
                  href="/student/dashboard"
                  className="hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <Card className="h-full shadow-md overflow-hidden">
                <CardHeader className="border-b pb-4">
                  {loading ? (
                    <>
                      <Skeleton className="h-8 w-48 mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        Welcome, {student?.user?.fullName || "Student"}!
                        {currentStreakDays > 0 && (
                          <Badge className="ml-2 animate-pulse bg-orange-500 hover:bg-orange-600">
                            <Flame className="h-3 w-3 mr-1" />
                            {currentStreakDays} day streak
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {student?.class?.name} &mdash; {student?.school?.name}
                      </CardDescription>
                    </>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs defaultValue="progress" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="progress">Progress</TabsTrigger>
                      <TabsTrigger value="history">
                        Submission History
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="progress" className="space-y-6">
                      {loading ? (
                        <div className="space-y-4">
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-40 w-full" />
                        </div>
                      ) : (
                        <>
                          <div className="mb-6">
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <Flame className="h-5 w-5 text-orange-500" />
                              Login Streak
                              {currentStreakDays > 0 && (
                                <Badge variant="outline" className="ml-2">
                                  {currentStreakDays} days
                                </Badge>
                              )}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {error ? (
                                <span className="text-muted-foreground">
                                  Unable to load streak data.
                                </span>
                              ) : !streakData ? (
                                <div className="w-full text-center py-4 bg-muted/30 rounded-md">
                                  <p className="text-muted-foreground">
                                    Log in daily to build your streak!
                                  </p>
                                </div>
                              ) : (
                                <div className="w-full">
                                  <div className="grid grid-cols-7 gap-2 mb-4">
                                    {generateStreakCalendar().map(
                                      (day, index) => (
                                        <div
                                          key={day.date}
                                          className="flex flex-col items-center"
                                        >
                                          <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all hover:scale-105 ${
                                              day.hasLogin
                                                ? day.consecutive
                                                  ? "bg-orange-500 text-white shadow-md"
                                                  : "bg-blue-500 text-white shadow-md"
                                                : "bg-muted text-muted-foreground"
                                            }`}
                                          >
                                            {day.day}
                                          </div>
                                          <span className="text-xs text-muted-foreground mt-1">
                                            {day.weekday}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                      <span>Consecutive</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                      <span>Login</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-3 h-3 rounded-full bg-muted"></div>
                                      <span>No login</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-8">
                            <h3 className="font-semibold text-lg mb-3">
                              Newest Assignments
                            </h3>
                            {error ? (
                              <div className="bg-muted/50 rounded-md p-8 text-center border">
                                <p className="text-muted-foreground mb-4">
                                  Unable to load assignments.
                                </p>
                                <Button
                                  onClick={handleRefresh}
                                  disabled={isRefreshing}
                                >
                                  {isRefreshing ? (
                                    <>
                                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                      Refreshing...
                                    </>
                                  ) : (
                                    "Retry"
                                  )}
                                </Button>
                              </div>
                            ) : (
                              (() => {
                                const submittedAssignmentIds = new Set(
                                  submissions.map(
                                    (submission: any) =>
                                      submission.assignment?.id ||
                                      submission.assignmentId
                                  )
                                );

                                const pendingAssignments = assignments.filter(
                                  (assignment: any) =>
                                    !submittedAssignmentIds.has(assignment.id)
                                );

                                return pendingAssignments.length === 0 ? (
                                  <div className="bg-muted/50 rounded-md p-8 text-center border">
                                    <p className="text-muted-foreground mb-4">
                                      {assignments.length > 0
                                        ? "All assignments have been completed! Great work!"
                                        : "No assignments available yet."}
                                    </p>
                                    <Button asChild>
                                      <Link href="/student/task">
                                        {assignments.length > 0
                                          ? "View all assignments"
                                          : "Check for assignments"}{" "}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {pendingAssignments
                                      .slice(0, 3)
                                      .map((assignment: any) => (
                                        <Card
                                          key={assignment.id}
                                          className="bg-muted/30 hover:bg-muted/50 transition-colors"
                                        >
                                          <CardHeader className="pb-2">
                                            <CardTitle className="text-base">
                                              {assignment.title}
                                            </CardTitle>
                                            <CardDescription>
                                              Due:{" "}
                                              {new Date(
                                                assignment.dueDate
                                              ).toLocaleDateString()}
                                            </CardDescription>
                                          </CardHeader>
                                          <CardContent className="pt-0">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-sm text-muted-foreground">
                                                {assignment.description ||
                                                  "No description provided"}
                                              </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                              <Badge variant="outline">
                                                {new Date(assignment.dueDate) <
                                                new Date()
                                                  ? "Past Due"
                                                  : "Active"}
                                              </Badge>
                                              <Button asChild size="sm">
                                                <Link
                                                  href={`/student/task/submit/${assignment.id}`}
                                                >
                                                  View Assignment
                                                </Link>
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    {pendingAssignments.length > 3 && (
                                      <Button
                                        variant="outline"
                                        asChild
                                        className="w-full"
                                      >
                                        <Link href="/student/task">
                                          View all assignments
                                        </Link>
                                      </Button>
                                    )}
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        </>
                      )}
                    </TabsContent>
                    <TabsContent value="history">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Submission History
                        </h3>
                        {loading ? (
                          <div className="space-y-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                          </div>
                        ) : error ? (
                          <div className="bg-muted/50 rounded-md p-8 text-center border">
                            <p className="text-muted-foreground">
                              Unable to load your submission history.
                            </p>
                            <Button
                              onClick={handleRefresh}
                              className="mt-4"
                              disabled={isRefreshing}
                            >
                              {isRefreshing ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Refreshing...
                                </>
                              ) : (
                                "Retry"
                              )}
                            </Button>
                          </div>
                        ) : (
                          (() => {
                            // Filter submissions to only show those graded by AI
                            const gradedSubmissions = submissionHistory.filter(
                              (submission: any) =>
                                submission.feedback !== null &&
                                submission.points_earned !== null &&
                                submission.graded_at !== null
                            );

                            return gradedSubmissions.length === 0 ? (
                              <div className="bg-muted/50 rounded-md p-8 text-center border">
                                <p className="text-muted-foreground">
                                  No graded submissions yet.
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Submit assignments to see your graded work
                                  here.
                                </p>
                                <Button asChild className="mt-4">
                                  <Link href="/student/task">
                                    Browse available assignments
                                  </Link>
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {gradedSubmissions.map((submission: any) => (
                                  <Card
                                    key={submission.id}
                                    className="bg-muted/30 hover:bg-muted/50 transition-colors"
                                  >
                                    <CardHeader>
                                      <CardTitle className="text-lg">
                                        {submission.assignment?.title ||
                                          "Assignment"}
                                      </CardTitle>
                                      <CardDescription>
                                        Submitted:{" "}
                                        {new Date(
                                          submission.submitted_at
                                        ).toLocaleString()}
                                        {submission.graded_at && (
                                          <>
                                            {" • "}
                                            Graded:{" "}
                                            {new Date(
                                              submission.graded_at
                                            ).toLocaleString()}
                                          </>
                                        )}
                                      </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="mb-2">
                                        <span className="font-semibold">
                                          Score:
                                        </span>{" "}
                                        <Badge
                                          variant={
                                            (submission.points_earned || 0) > 80
                                              ? "default"
                                              : (submission.points_earned ||
                                                  0) > 60
                                              ? "secondary"
                                              : "outline"
                                          }
                                        >
                                          {submission.points_earned ?? "-"} /
                                          100
                                        </Badge>
                                      </div>
                                      {submission.feedback && (
                                        <div className="mb-2">
                                          <span className="font-semibold">
                                            AI Feedback:
                                          </span>{" "}
                                          <div className="mt-1 bg-primary/5 p-3 rounded-md border border-primary/10">
                                            <p className="text-sm text-muted-foreground">
                                              {submission.feedback}
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                              {(submission.points_earned || 0) >
                                                80 && (
                                                <Badge
                                                  variant="outline"
                                                  className="bg-green-500/10 text-green-600 border-green-200"
                                                >
                                                  Excellent work
                                                </Badge>
                                              )}
                                              {(submission.points_earned || 0) >
                                                60 &&
                                                (submission.points_earned ||
                                                  0) <= 80 && (
                                                  <Badge
                                                    variant="outline"
                                                    className="bg-yellow-500/10 text-yellow-600 border-yellow-200"
                                                  >
                                                    Good progress
                                                  </Badge>
                                                )}
                                              {(submission.points_earned ||
                                                0) <= 60 &&
                                                submission.points_earned !==
                                                  null && (
                                                  <Badge
                                                    variant="outline"
                                                    className="bg-orange-500/10 text-orange-600 border-orange-200"
                                                  >
                                                    Needs improvement
                                                  </Badge>
                                                )}
                                              <Badge
                                                variant="outline"
                                                className="bg-primary/10"
                                              >
                                                {new Date(
                                                  submission.submitted_at
                                                ).toLocaleDateString()}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      <div>
                                        <span className="font-semibold">
                                          Content:
                                        </span>
                                        <div className="bg-background rounded p-3 mt-1 text-sm border max-h-32 overflow-y-auto">
                                          {submission.content ||
                                            "No content available"}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            );
                          })()
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="gap-2"
                  >
                    {isRefreshing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                      </>
                    )}
                  </Button>
                  <Button asChild>
                    <Link href="/student/task" className="gap-2">
                      Explore Tasks <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Sidebar - 1/4 width on desktop */}
            <div className="md:col-span-1 space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Your Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center hover:bg-muted/70 transition-colors">
                        <p className="text-muted-foreground text-sm">Level</p>
                        <p className="text-2xl font-bold">
                          {student?.classLevel || "-"}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg p-3 text-center hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-950/30 dark:hover:to-red-950/30 transition-colors border border-orange-200/50 dark:border-orange-800/50">
                        <p className="text-muted-foreground text-sm">Streak</p>
                        <p className="text-2xl font-bold flex items-center justify-center gap-1">
                          {currentStreakDays}
                          <span className="text-sm">days</span>
                          {currentStreakDays > 0 && (
                            <Flame className="h-5 w-5 text-orange-500" />
                          )}
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center hover:bg-muted/70 transition-colors">
                        <p className="text-muted-foreground text-sm">Points</p>
                        <p className="text-2xl font-bold">
                          {student?.totalPoints || 0}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
