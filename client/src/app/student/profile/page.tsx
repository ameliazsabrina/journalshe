"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Mail,
  School,
  BookOpen,
  User,
  Building,
  Pencil,
} from "lucide-react";

import StudentNavbar from "@/components/student/navbar";
import { studentAPI } from "@/lib/api";

interface StudentProfile {
  id: string;
  user: {
    username: string;
    email: string;
    fullName: string;
  };
  class: {
    id: number;
    name: string;
  };
  school: {
    id: number;
    name: string;
  };
  classLevel: string;
  streakDays: number;
  totalPoints: number;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const student = await studentAPI.getCurrentStudent();

        if (!student) {
          toast({
            title: "Authentication required",
            description: "Please log in to view your profile",
            variant: "destructive",
          });
          router.push("/student/login");
          return;
        }

        if (!student) {
          toast({
            title: "User ID not found",
            description: "Please log in again",
            variant: "destructive",
          });
          router.push("/student/login");
          return;
        }

        setProfile(student);
      } catch (err: any) {
        console.error("Error fetching student profile:", err);
        setError(err.response?.data?.error || "Failed to load profile");
        toast({
          title: "Error",
          description: err.response?.data?.error || "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, toast]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar username="Student" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar username="Student" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-6">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-destructive/10 p-3 rounded-full">
                    <User className="h-8 w-8 text-destructive" />
                  </div>
                  <h2 className="text-xl font-bold">Profile Not Available</h2>
                  <p className="text-muted-foreground">
                    {error || "Unable to load your profile information"}
                  </p>
                  <div className="flex gap-4 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/student/dashboard")}
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

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar username={profile.user.username} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/student/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarFallback className="text-xl">
                      {getInitials(profile.user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-4">
                    {profile.user.fullName}
                  </CardTitle>
                  <CardDescription className="flex justify-center">
                    <Badge variant="outline" className="mt-1">
                      Student
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.school.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.class.name}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          School & Class
                        </h3>
                        <div className="bg-muted/30 p-4 rounded-md">
                          <div className="flex items-start gap-3">
                            <Building className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <h4 className="font-medium">
                                {profile.school.name}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Class: {profile.class.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Account Information
                        </h3>
                        <div className="bg-muted/30 p-4 rounded-md">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Username
                              </p>
                              <p className="font-medium">
                                {profile.user.username}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Email
                              </p>
                              <p className="font-medium">
                                {profile.user.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Full Name
                              </p>
                              <p className="font-medium">
                                {profile.user.fullName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Student ID
                              </p>
                              <p className="font-medium">{profile.id}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stats" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Statistics</CardTitle>
                      <CardDescription>
                        Track your progress and achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-primary/10 p-4 rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Total Points
                              </p>
                              <p className="text-2xl font-bold text-primary">
                                {profile.totalPoints}
                              </p>
                            </div>
                            <div className="bg-primary/20 p-2 rounded-full">
                              <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Login Streak
                              </p>
                              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {profile.streakDays} days
                              </p>
                            </div>
                            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full">
                              <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-muted/30 rounded-md">
                        <h3 className="font-medium mb-2">
                          Achievement Summary
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          You've earned {profile.totalPoints} points and
                          maintained a {profile.streakDays}-day login streak.
                          Keep up the great work!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
