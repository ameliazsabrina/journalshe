"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { authAPI, schoolAPI } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function StudentSignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    schoolId: "",
    classIds: [""],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

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

  useEffect(() => {
    fetchSchools();
    fetchClasses();
  }, []);

  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSchoolChange = (value: string) => {
    setForm({ ...form, schoolId: value, classIds: [""] });
  };

  const handleClassChange = (index: number, value: string) => {
    const newClassIds = [...form.classIds];
    newClassIds[index] = value;
    setForm({ ...form, classIds: newClassIds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
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

    const classIdsAsNumbers = validClassIds
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));

    if (classIdsAsNumbers.length === 0) {
      setError("Invalid class selection");
      setLoading(false);
      return;
    }

    try {
      const data = await authAPI.registerStudent({
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
        schoolId: form.schoolId,
        classIds: classIdsAsNumbers,
      });

      if (!data.message) {
        throw new Error(data.error || "Registration failed");
      }

      toast({
        title: "Success!",
        description:
          "Account created successfully. Please log in with your credentials.",
        variant: "default",
      });

      setTimeout(() => {
        router.push("/student/login");
      }, 2000);
    } catch (err: any) {
      if (err.message && err.message.includes("already registered")) {
        toast({
          title: "Already signed up",
          description: "Redirecting to login...",
          variant: "default",
        });

        setTimeout(() => {
          router.push("/student/login");
        }, 2000);
      } else {
        setError(err.message || "An error occurred during signup");

        toast({
          title: "Error",
          description: err.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="relative bg-white dark:bg-black rounded-xl shadow-md p-8 w-full max-w-md space-y-6">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-1">Student Sign Up</h2>
            <p className="text-sm text-muted-foreground">
              Create your account below
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 bg-muted/30 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 bg-muted/30 text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 bg-muted/30 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full border rounded px-3 py-2 bg-muted/30 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full border rounded px-3 py-2 bg-muted/30 text-sm"
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
              <Label>Classes</Label>
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
                </>
              ) : (
                <div className="text-sm text-muted-foreground mt-2">
                  Please select a school first to view available classes
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </Button>

          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <a href="/student/login" className="text-primary underline">
              Log in
            </a>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
}
