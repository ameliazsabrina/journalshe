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
import { LogOut, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import axios from "axios";

export default function AdminNavbar() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    const fetchUser = async () => {
      const res = await axios.get(`${apiUrl}/api/auth/profile`, {
        withCredentials: true,
      });
      const user = res.data.user;

      if (user?.fullName) {
        setAdminName(user.fullName);
      }
    };

    fetchUser();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    axios.post(`${apiUrl}/api/auth/logout`, {
      withCredentials: true,
    });
    router.push("/");
  };

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  const initials = adminName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
            href="/admin/register-school"
            className="text-2xl font-semibold flex items-center"
          >
            <span className="text-primary dark:text-white">Journal</span>
            <span className="text-primary/50 dark:text-gray-400">she</span>
            <span className="ml-3 text-xs bg-primary/10 px-2 py-0.5 rounded text-primary">
              Admin
            </span>
          </Link>
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
                  <p className="text-sm font-medium leading-none">
                    {adminName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Administrator
                  </p>
                </div>
              </DropdownMenuLabel>
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

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left">Admin Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{adminName}</p>
                    <p className="text-sm text-muted-foreground">
                      Administrator
                    </p>
                  </div>
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
