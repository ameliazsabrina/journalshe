"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
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
    router.push(getDashboardUrl());
    setRedirecting(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-5xl font-bold text-primary mb-4">Oops!</h1>
      <h2 className="text-2xl mb-6">Something went wrong</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        An unexpected error occurred. We apologize for the inconvenience.
      </p>

      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mr-3"
        >
          Try again
        </Button>

        <Button onClick={handleRedirect} disabled={redirecting}>
          {redirecting
            ? "Redirecting..."
            : userRole
            ? `Back to ${
                userRole.charAt(0).toUpperCase() + userRole.slice(1)
              } Dashboard`
            : "Go to Homepage"}
        </Button>
      </div>
    </div>
  );
}
