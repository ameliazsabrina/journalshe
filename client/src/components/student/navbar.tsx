"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  Settings,
  BookOpen,
  Award,
  Home,
  Menu,
  Bell,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import axios from "axios";

interface StudentNavbarProps {
  username: string;
}

export default function StudentNavbar({ username }: StudentNavbarProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  const [user, setUser] = useState<any>(null);

  const fetchUser = async () => {
    const { data } = await axios.get(`${apiUrl}/api/auth/profile`, {
      withCredentials: true,
    });
    setUser(data.user);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const initials = user?.fullName
    ?.split(" ")
    .map((name: string) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    axios.post(`${apiUrl}/api/auth/logout`, {}, { withCredentials: true });
    router.push("/");
  };

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  return (
    <nav
      className={`${
        isScrolled
          ? "bg-card/90 dark:bg-black/90 shadow-md"
          : "bg-card/50 dark:bg-black/50"
      } text-card-foreground dark:text-white shadow-sm backdrop-blur-md py-3 sticky top-0 z-50 transition-all duration-300`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/student/dashboard"
            className="text-2xl font-semibold flex items-center"
          >
            <span className="text-primary dark:text-white">Journal</span>
            <span className="text-primary/50 dark:text-gray-400">she</span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant={isActive("/student/dashboard") ? "default" : "ghost"}
              size="sm"
              className="text-sm font-medium transition-all"
              asChild
            >
              <Link href="/student/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant={isActive("/student/task") ? "default" : "ghost"}
              size="sm"
              className="text-sm font-medium transition-all"
              asChild
            >
              <Link href="/student/task">
                <BookOpen className="h-4 w-4 mr-2" />
                Tasks
              </Link>
            </Button>
            <Button
              variant={isActive("/student/leaderboard") ? "default" : "ghost"}
              size="sm"
              className="text-sm font-medium transition-all"
              asChild
            >
              <Link href="/student/leaderboard">
                <Award className="h-4 w-4 mr-2" />
                Leaderboard
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 transition-transform hover:scale-110">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Student
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/student/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{username}</p>
                    <p className="text-sm text-muted-foreground">Student</p>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <SheetClose asChild>
                    <Button
                      variant={
                        isActive("/student/dashboard") ? "default" : "ghost"
                      }
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/student/dashboard">
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  </SheetClose>

                  <SheetClose asChild>
                    <Button
                      variant={isActive("/student/task") ? "default" : "ghost"}
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/student/task">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Tasks
                      </Link>
                    </Button>
                  </SheetClose>

                  <SheetClose asChild>
                    <Button
                      variant={
                        isActive("/student/leaderboard") ? "default" : "ghost"
                      }
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/student/leaderboard">
                        <Award className="h-4 w-4 mr-2" />
                        Leaderboard
                      </Link>
                    </Button>
                  </SheetClose>

                  <SheetClose asChild>
                    <Button
                      variant={
                        isActive("/student/profile") ? "default" : "ghost"
                      }
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/student/profile">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </Button>
                  </SheetClose>
                </div>

                <div className="mt-auto pt-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
