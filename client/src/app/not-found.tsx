"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  const getDashboardUrl = () => {
    if (!userRole) return "/";

    switch (userRole) {
      case "student":
        return "/student/dashboard";
      case "teacher":
        return "/teacher/dashboard";
      case "admin":
        return "/admin/register-school";
      default:
        return "/";
    }
  };

  const handleRedirect = () => {
    setRedirecting(true);
    const path = getDashboardUrl();
    router.push(path);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">Oops!</h1>
      <h2 className="text-2xl mb-6">Page not found</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        The page you are looking for doesn't exist or there was an error in
        navigation.
      </p>

      {isLoading ? (
        <Button disabled>Loading...</Button>
      ) : (
        <div className="space-y-3">
          <Button size="lg" onClick={handleRedirect} disabled={redirecting}>
            {redirecting
              ? "Redirecting..."
              : userRole
              ? `Back to ${
                  userRole.charAt(0).toUpperCase() + userRole.slice(1)
                } Dashboard`
              : "Go to Homepage"}
          </Button>

          {!userRole && (
            <div className="flex gap-3 mt-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/student/login">Student Login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/teacher/login">Teacher Login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/login">Admin Login</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
