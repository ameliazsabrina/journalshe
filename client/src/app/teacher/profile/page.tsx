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
import Link from "next/link";
import TeacherNavbar from "@/components/teacher/navbar";

interface UserProfile {
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
  classes: {
    id: string;
    name: string;
  }[];
}

export default function TeacherProfilePage() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://journalshe-server.azakiyasabrina.workers.dev";
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${apiUrl}/api/teachers/me`, {
          withCredentials: true,
        });

        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          throw new Error("Invalid profile data");
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);

        if (err.response?.status === 401) {
          toast({
            title: "Authentication required",
            description: "Please sign in to continue",
            variant: "destructive",
          });
          router.push("/teacher/login");
          return;
        }

        setError("Failed to load profile");
        toast({
          title: "Error",
          description:
            err.response?.data?.error || "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, toast, apiUrl]);

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
        <TeacherNavbar username="Teacher" />
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

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <TeacherNavbar username="Teacher" />
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

  return (
    <div className="min-h-screen bg-background">
      <TeacherNavbar username={user.fullName} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/teacher/dashboard")}
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
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-4">{user.fullName}</CardTitle>
                  <CardDescription className="flex justify-center">
                    <Badge variant="outline" className="mt-1">
                      {user.role}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {user.school?.name || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {user.classes?.length || 0} Classes
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/teacher/settings">
                      <Pencil className="h-4 w-4" />
                      Manage Classes
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="classes">Classes</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Teacher Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          School
                        </h3>
                        <div className="bg-muted/30 p-4 rounded-md">
                          {user.school ? (
                            <div className="flex items-start gap-3">
                              <Building className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <h4 className="font-medium">
                                  {user.school.name}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {user.school.address}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              No school assigned
                            </p>
                          )}
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
                              <p className="font-medium">{user.username}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Email
                              </p>
                              <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Role
                              </p>
                              <p className="font-medium">{user.role}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="classes" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Assigned Classes</CardTitle>
                      <CardDescription>
                        Classes you are currently teaching
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {user.classes && user.classes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {user.classes.map((cls) => (
                            <div
                              key={cls.id}
                              className="bg-muted/30 p-3 rounded-md"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                  <span className="font-medium">
                                    {cls.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-muted/20 rounded-md">
                          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground mb-2">
                            No classes assigned yet
                          </p>
                          <Button asChild>
                            <Link href="/teacher/settings">
                              <Pencil className="h-4 w-4" />
                              Manage Classes
                            </Link>
                          </Button>
                        </div>
                      )}
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
