"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios from "axios";

export default function StudentLoginPage() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://journalshe-server.azakiyasabrina.workers.dev";
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form.username || !form.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
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

      if (res.data.error) {
        toast({
          title: "Login Failed",
          description: res.data.error,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (res.data.user.roleId !== 1) {
        toast({
          title: "Access Denied",
          description: "Only students can access this area.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Success",
        description: "Login successful!",
      });

      setTimeout(() => {
        router.push("/student/dashboard");
        router.refresh();
      }, 100);
    } catch (err: any) {
      console.error("Login error:", err);
      toast({
        title: "Error",
        description:
          err.response?.data?.error || "An unexpected error occurred.",
        variant: "destructive",
      });
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
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold">Student Log In</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your account
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="johndoe123"
                className="w-full border rounded px-3 py-2 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full border rounded px-3 py-2 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
          <div className="text-center text-sm mt-4">
            Don't have an account?{" "}
            <a href="/student/signup" className="text-primary underline">
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
