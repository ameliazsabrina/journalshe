"use client";

import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast-provider";
import { createContext } from "react";

export const SupabaseContext = createContext(null);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  );
}
