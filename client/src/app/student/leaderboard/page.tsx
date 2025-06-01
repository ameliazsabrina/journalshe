"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import StudentNavbar from "@/components/student/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  Star,
  Calendar,
  Flame,
  TrendingUp,
  Users,
  Target,
  Crown,
  Zap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { studentAPI, leaderboardAPI, loginStreakAPI } from "@/lib/api";

interface User {
  username: string;
  fullName: string;
}

interface Student {
  id: string;
  user: User;
  totalPoints: number;
  streakDays: number;
}

interface LeaderboardStudent {
  id: string;
  user: User;
  points: number;
  rank: number;
  updated: string;
}

interface CombinedLeaderboardStudent {
  id: string;
  user: User;
  points: number;
  streakDays: number;
  totalScore: number;
  rank: number;
  lastLogin: string;
}

interface StreakLeaderboardStudent {
  rank: number;
  studentId: string;
  user: User;
  streakDays: number;
  lastLogin: string;
}

interface MyRanking {
  rank: number | string;
  points: number;
  classId: number;
  totalStudents: number;
  updated?: string;
}

export default function LeaderboardPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("week");
  const [students, setStudents] = useState<LeaderboardStudent[]>([]);
  const [combinedStudents, setCombinedStudents] = useState<
    CombinedLeaderboardStudent[]
  >([]);
  const [streakStudents, setStreakStudents] = useState<
    StreakLeaderboardStudent[]
  >([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [myRanking, setMyRanking] = useState<MyRanking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentStudent = await studentAPI.getCurrentStudent();

        if (!currentStudent) {
          router.push("/student/login");
          return;
        }

        setStudent(currentStudent);
        setStudentId(currentStudent.id);
        setClassId(currentStudent.classId);
      } catch (err: any) {
        console.error("Error loading student data:", err);

        if (err.response?.status === 401) {
          router.push("/student/login");
          return;
        }

        setError("Failed to load your profile");
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [router, toast]);

  const loadLeaderboardData = async () => {
    if (!classId) return;

    setLoading(true);
    setError(null);

    try {
      const [leaderboardData, combinedData, streakData, rankingData] =
        await Promise.all([
          leaderboardAPI.getClassLeaderboard(classId.toString()),
          leaderboardAPI.getCombinedLeaderboard(classId.toString()),
          loginStreakAPI.getStreakLeaderboard(classId.toString()),
          leaderboardAPI.getMyRanking(),
        ]);

      setStudents(leaderboardData);
      setCombinedStudents(combinedData);
      setStreakStudents(streakData);
      setMyRanking(rankingData);
    } catch (err: any) {
      console.error("Error loading leaderboard data:", err);
      setError("Failed to load leaderboard data");
      toast({
        title: "Error",
        description: "Failed to load leaderboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      loadLeaderboardData();
    }
  }, [classId, selectedPeriod]);

  const currentStudent = students.find((student) => student.id === studentId);
  const highestPoints = students.length > 0 ? students[0].points : 100;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-yellow-500 mr-1" />
            <span className="font-bold">1st</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center">
            <Medal className="h-5 w-5 text-gray-400 mr-1" />
            <span className="font-bold">2nd</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center">
            <Award className="h-5 w-5 text-amber-700 mr-1" />
            <span className="font-bold">3rd</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <span className="font-bold">{rank}th</span>
          </div>
        );
    }
  };

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!studentId) {
    return null;
  }

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
          </nav>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Class Leaderboard</h1>
              <p className="text-muted-foreground">
                See how you rank among your classmates based on points earned
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="semester">This Semester</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Student Rankings</CardTitle>
                  <CardDescription>
                    Compare your performance with classmates across different
                    metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="points" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger
                        value="points"
                        className="flex items-center gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Points
                      </TabsTrigger>
                      <TabsTrigger
                        value="combined"
                        className="flex items-center gap-2"
                      >
                        <Trophy className="h-4 w-4" />
                        Combined
                      </TabsTrigger>
                      <TabsTrigger
                        value="streaks"
                        className="flex items-center gap-2"
                      >
                        <Flame className="h-4 w-4" />
                        Streaks
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="points">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                          {selectedPeriod === "week"
                            ? "Points earned this week"
                            : selectedPeriod === "month"
                            ? "Points earned this month"
                            : selectedPeriod === "semester"
                            ? "Points earned this semester"
                            : "Total points earned"}
                        </p>
                      </div>
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="flex items-center gap-4 p-3 rounded-md"
                            >
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <div className="flex-1">
                                <Skeleton className="h-5 w-40 mb-2" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                              <Skeleton className="h-6 w-16" />
                            </div>
                          ))}
                        </div>
                      ) : error ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">
                            Unable to load leaderboard data.
                          </p>
                          <Button onClick={loadLeaderboardData}>Retry</Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {students.map((student, index) => {
                            const isCurrentUser = student.id === studentId;
                            const highestPoints =
                              students.length > 0 ? students[0].points : 100;
                            const progressPercentage = Math.round(
                              (student.points / highestPoints) * 100
                            );

                            return (
                              <div
                                key={student.id}
                                className={`flex items-center gap-4 p-3 rounded-md transition-colors ${
                                  isCurrentUser
                                    ? "bg-primary/10 border border-primary/20"
                                    : index % 2 === 0
                                    ? "bg-muted/30"
                                    : ""
                                } ${isCurrentUser ? "" : "hover:bg-muted/50"}`}
                              >
                                <div className="flex-shrink-0 w-8 text-center">
                                  {getRankBadge(student.rank)}
                                </div>

                                <div className="flex items-center gap-3 flex-1">
                                  <Avatar
                                    className={`h-10 w-10 ${
                                      isCurrentUser ? "ring-2 ring-primary" : ""
                                    }`}
                                  >
                                    <AvatarFallback>
                                      {getInitials(student.user.username)}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div>
                                    <div className="font-medium flex items-center">
                                      {student.user.fullName}
                                      {isCurrentUser && (
                                        <Badge
                                          variant="outline"
                                          className="ml-2"
                                        >
                                          You
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                      <span className="flex items-center">
                                        <Star className="h-3 w-3 mr-1" />
                                        {student.points} points
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 min-w-[100px]">
                                  <div className="font-bold text-lg">
                                    {student.points}
                                  </div>
                                  <div className="w-full">
                                    <Progress
                                      value={progressPercentage}
                                      className="h-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="combined">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                          Combined score based on points and login streaks
                          (streak days × 5 bonus points)
                        </p>
                      </div>
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="flex items-center gap-4 p-3 rounded-md"
                            >
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <div className="flex-1">
                                <Skeleton className="h-5 w-40 mb-2" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                              <Skeleton className="h-6 w-16" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {combinedStudents.map((student, index) => {
                            const isCurrentUser = student.id === studentId;
                            const highestScore =
                              combinedStudents.length > 0
                                ? combinedStudents[0].totalScore
                                : 100;
                            const progressPercentage = Math.round(
                              (student.totalScore / highestScore) * 100
                            );

                            return (
                              <div
                                key={student.id}
                                className={`flex items-center gap-4 p-3 rounded-md transition-colors ${
                                  isCurrentUser
                                    ? "bg-primary/10 border border-primary/20"
                                    : index % 2 === 0
                                    ? "bg-muted/30"
                                    : ""
                                } ${isCurrentUser ? "" : "hover:bg-muted/50"}`}
                              >
                                <div className="flex-shrink-0 w-8 text-center">
                                  {getRankBadge(student.rank)}
                                </div>

                                <div className="flex items-center gap-3 flex-1">
                                  <Avatar
                                    className={`h-10 w-10 ${
                                      isCurrentUser ? "ring-2 ring-primary" : ""
                                    }`}
                                  >
                                    <AvatarFallback>
                                      {getInitials(student.user.username)}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div>
                                    <div className="font-medium flex items-center">
                                      {student.user.fullName}
                                      {isCurrentUser && (
                                        <Badge
                                          variant="outline"
                                          className="ml-2"
                                        >
                                          You
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                      <span className="flex items-center">
                                        <Star className="h-3 w-3 mr-1" />
                                        {student.points} pts
                                      </span>
                                      <span className="flex items-center">
                                        <Flame className="h-3 w-3 mr-1" />
                                        {student.streakDays} days
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 min-w-[100px]">
                                  <div className="font-bold text-lg">
                                    {student.totalScore}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {student.points} + {student.streakDays * 5}
                                  </div>
                                  <div className="w-full">
                                    <Progress
                                      value={progressPercentage}
                                      className="h-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="streaks">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                          Current login streaks - consecutive days of logging in
                        </p>
                      </div>
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="flex items-center gap-4 p-3 rounded-md"
                            >
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <div className="flex-1">
                                <Skeleton className="h-5 w-40 mb-2" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                              <Skeleton className="h-6 w-16" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {streakStudents.map((student, index) => {
                            const isCurrentUser =
                              student.studentId === studentId;
                            const highestStreak =
                              streakStudents.length > 0
                                ? streakStudents[0].streakDays
                                : 30;
                            const progressPercentage = Math.round(
                              (student.streakDays / highestStreak) * 100
                            );

                            return (
                              <div
                                key={student.studentId}
                                className={`flex items-center gap-4 p-3 rounded-md transition-colors ${
                                  isCurrentUser
                                    ? "bg-primary/10 border border-primary/20"
                                    : index % 2 === 0
                                    ? "bg-muted/30"
                                    : ""
                                } ${isCurrentUser ? "" : "hover:bg-muted/50"}`}
                              >
                                <div className="flex-shrink-0 w-8 text-center">
                                  {getRankBadge(student.rank)}
                                </div>

                                <div className="flex items-center gap-3 flex-1">
                                  <Avatar
                                    className={`h-10 w-10 ${
                                      isCurrentUser ? "ring-2 ring-primary" : ""
                                    }`}
                                  >
                                    <AvatarFallback>
                                      {getInitials(student.user.username)}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div>
                                    <div className="font-medium flex items-center">
                                      {student.user.fullName}
                                      {isCurrentUser && (
                                        <Badge
                                          variant="outline"
                                          className="ml-2"
                                        >
                                          You
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                      <span className="flex items-center">
                                        <Flame className="h-3 w-3 mr-1" />
                                        {student.streakDays} day streak
                                      </span>
                                      {student.lastLogin && (
                                        <span className="text-xs">
                                          Last:{" "}
                                          {new Date(
                                            student.lastLogin
                                          ).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 min-w-[100px]">
                                  <div className="font-bold text-lg flex items-center gap-1">
                                    {student.streakDays}
                                    {student.streakDays > 0 && (
                                      <Flame className="h-4 w-4 text-orange-500" />
                                    )}
                                  </div>
                                  <div className="w-full">
                                    <Progress
                                      value={progressPercentage}
                                      className="h-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" asChild>
                    <Link href="/student/dashboard">Back to Dashboard</Link>
                  </Button>
                  <Button variant="outline" onClick={loadLeaderboardData}>
                    Refresh
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-1">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Your Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-muted-foreground text-sm">
                          Current Rank
                        </p>
                        <div className="flex items-center justify-center mt-1">
                          {myRanking?.rank === 1 ? (
                            <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
                          ) : myRanking?.rank === 2 ? (
                            <Medal className="h-6 w-6 text-gray-400 mr-2" />
                          ) : myRanking?.rank === 3 ? (
                            <Award className="h-6 w-6 text-amber-700 mr-2" />
                          ) : null}
                          <p className="text-3xl font-bold">
                            {myRanking?.rank || "N/A"}
                            {typeof myRanking?.rank === "number" && (
                              <span className="text-lg">
                                {myRanking.rank === 1
                                  ? "st"
                                  : myRanking.rank === 2
                                  ? "nd"
                                  : myRanking.rank === 3
                                  ? "rd"
                                  : "th"}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-muted-foreground text-sm">
                          Points This{" "}
                          {selectedPeriod === "all" ? "Year" : selectedPeriod}
                        </p>
                        <p className="text-2xl font-bold mt-1">
                          {myRanking?.points || 0}
                        </p>
                      </div>

                      {myRanking && myRanking.totalStudents > 0 && (
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <p className="text-muted-foreground text-sm">
                            Total Students
                          </p>
                          <p className="text-lg font-bold mt-1">
                            {myRanking.totalStudents}
                          </p>
                        </div>
                      )}
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
