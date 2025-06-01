"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

export default function TeacherLoginPage() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://journalshe-server.azakiyasabrina.workers.dev";
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.username || !form.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting login...");
      const res = await axios.post(
        `${apiUrl}/api/auth/login`,
        {
          username: form.username,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Login response:", res.data);

      if (res.data.user.roleId !== 2) {
        setLoading(false);
        toast({
          title: "Access Denied",
          description: "Only teachers can access this area.",
          variant: "destructive",
        });
        return;
      }

      console.log("Cookies set, waiting for state update...");

      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("Setting auth state with user data:", res.data.user);

      await new Promise((resolve) => setTimeout(resolve, 200));

      toast({
        title: "Logged in!",
        description: `Welcome back, ${res.data.user.username}`,
        variant: "default",
      });

      router.push("/teacher/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setLoading(false);
      setError(err.response?.data?.error || "Invalid credentials");
      toast({
        title: "Error",
        description: err.response?.data?.error || "Something went wrong.",
        variant: "destructive",
      });
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
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Teacher Log In</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to manage assignments and students
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="bambangsuprapto"
                className="w-full border rounded px-3 py-2 bg-muted/30 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full border rounded px-3 py-2 bg-muted/30 text-sm"
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>

          <div className="text-center text-sm mt-4">
            Don't have an account?{" "}
            <a href="/teacher/signup" className="text-primary underline">
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
