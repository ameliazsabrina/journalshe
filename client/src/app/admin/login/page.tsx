"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";

import axios from "axios";

export default function AdminLoginPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
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

      if (res.data.user.roleId !== 3) {
        toast({
          title: "Access Denied",
          description: "Only admins can access this area.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(res.data.user));

      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      router.push("/admin/register-school");
    } catch (err: any) {
      console.error("Login error:", err);

      let errorMessage = "Invalid credentials";
      if (err.response) {
        errorMessage = err.response.data?.error || errorMessage;
        console.log("Response error data:", err.response.data);
        console.log("Response error status:", err.response.status);
      } else if (err.request) {
        errorMessage = "No response from server. Please try again later.";
        console.log("Request error:", err.request);
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
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
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Admin Log In</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to manage schools and teachers
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
                placeholder="admin1"
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
        </form>
      </div>
    </div>
  );
}
