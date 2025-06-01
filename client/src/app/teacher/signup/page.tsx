"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authAPI, schoolAPI } from "@/lib/api";

interface School {
  id: number;
  name: string;
  address: string;
}

interface Class {
  id: number;
  name: string;
  schoolId: number;
}

export default function TeacherSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    schoolId: "",
    classIds: [""],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (form.schoolId) {
      const schoolClasses = classes.filter(
        (cls) => cls.schoolId.toString() === form.schoolId
      );
      setFilteredClasses(schoolClasses);
    } else {
      setFilteredClasses([]);
    }
  }, [form.schoolId, classes]);

  const fetchSchools = async () => {
    try {
      setIsLoadingSchools(true);
      const data = await schoolAPI.listSchools();
      setSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast({
        title: "Error",
        description: "Failed to fetch schools",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setIsLoadingClasses(true);
      const data = await schoolAPI.listClasses();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSchoolChange = (value: string) => {
    setForm({ ...form, schoolId: value, classIds: [""] });
  };

  const handleClassChange = (index: number, value: string) => {
    const newClassIds = [...form.classIds];
    newClassIds[index] = value;
    setForm({ ...form, classIds: newClassIds });
  };

  const handleAddClassField = () => {
    setForm({ ...form, classIds: [...form.classIds, ""] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const selectedSchool = schools.find(
      (s) => s.id.toString() === form.schoolId
    );
    if (!selectedSchool) {
      setError("Please select a school");
      setLoading(false);
      return;
    }

    const validClassIds = form.classIds.filter(Boolean);
    if (validClassIds.length === 0) {
      setError("Please select at least one class");
      setLoading(false);
      return;
    }

    try {
      const data = await authAPI.registerTeacher({
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
        schoolId: form.schoolId,
        classIds: validClassIds.map((id) => parseInt(id)),
      });

      if (!data.message) {
        throw new Error(data.error || "Registration failed");
      }

      toast({ title: "Success!", description: "Redirecting to login..." });
      setTimeout(() => router.push("/teacher/login"), 1000);
    } catch (err: any) {
      console.error("Signup failed:", err.message);
      setError(err.message || "An error occurred during signup");
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-md border-none">
        <CardHeader className="text-center pb-2">
          <Link
            href="/teacher/login"
            className="inline-flex items-center gap-1 text-sm mb-4 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <CardTitle className="text-2xl font-bold">Teacher Sign Up</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Bambang Suprapto"
                required
              />
            </div>

            <div>
              <Label>Username</Label>
              <Input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="bambangsuprapto"
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="bambang@example.com"
                type="email"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Password</Label>
                <Input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  minLength={6}
                  placeholder="••••••"
                  required
                />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  type="password"
                  minLength={6}
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <div>
              <Label>School</Label>
              {isLoadingSchools ? (
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                  schools...
                </div>
              ) : (
                <Select
                  value={form.schoolId}
                  onValueChange={handleSchoolChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label>Teaching Classes</Label>
              {isLoadingClasses ? (
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                  classes...
                </div>
              ) : form.schoolId ? (
                <>
                  {form.classIds.map((classId, index) => (
                    <div key={index} className="mt-2">
                      <Select
                        value={classId}
                        onValueChange={(value) =>
                          handleClassChange(index, value)
                        }
                        disabled={
                          !form.schoolId || filteredClasses.length === 0
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredClasses.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id.toString()}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddClassField}
                    className="mt-2 w-full"
                    disabled={!form.schoolId || filteredClasses.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Another Class
                  </Button>
                </>
              ) : (
                <div className="text-sm text-muted-foreground mt-2">
                  Please select a school first to view available classes
                </div>
              )}
            </div>

            {error && (
              <div className="text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pt-0">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/teacher/login" className="text-primary underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
