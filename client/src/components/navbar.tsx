"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "next-themes";
import { Menu, X, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const isSignedIn = false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`${
        isScrolled
          ? "bg-card/90 dark:bg-black/90 shadow-md"
          : "bg-card/50 dark:bg-black/50"
      } text-card-foreground dark:text-white shadow-sm backdrop-blur-md py-4 sticky top-0 z-50 transition-all duration-300`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-semibold flex items-center">
          <span className="text-primary dark:text-white">Journal</span>
          <span className="text-primary/50 dark:text-gray-400">she</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-3 ml-4">
            {!isSignedIn ? (
              <>
                <Button
                  variant="outline"
                  className="bg-black text-white border-black  dark:bg-white dark:text-black dark:border-white"
                  onClick={() => router.push("/student/login")}
                >
                  I am Student
                </Button>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => router.push("/teacher/login")}
                >
                  I am Teacher
                </Button>

                <Button
                  variant="outline"
                  className="ml-4"
                  onClick={() => router.push("/admin/login")}
                >
                  Register a School
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="border-secondary/70 dark:border-gray-700 text-foreground dark:text-white hover:bg-secondary/10 dark:hover:bg-gray-800"
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => router.push("/profile")}
                >
                  <User className="h-5 w-5" />
                </Button>
              </>
            )}

            <ThemeToggle />
          </div>
        </div>

        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          {isSignedIn && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.push("/profile")}
            >
              <User className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-card dark:bg-black border-t border-border dark:border-gray-900 py-4 px-4 animate-fadeIn">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col gap-2 pt-2 border-t border-border dark:border-gray-800">
              {!isSignedIn ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full bg-black text-white border-black  dark:bg-white dark:text-black dark:border-white"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push("/student/login");
                    }}
                  >
                    I am Student
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push("/teacher/login");
                    }}
                  >
                    I am Teacher
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push("/admin/login");
                    }}
                  >
                    Register a School
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/dashboard");
                  }}
                >
                  Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
