"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 5;

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastContextType = {
  toasts: ToasterToast[];
  toast: (props: Omit<ToasterToast, "id">) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
  dismiss: (id?: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToasterToast[]>([]);

  const toast = useCallback((props: Omit<ToasterToast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const update = (updateProps: ToasterToast) =>
      setToasts((state) =>
        state.map((t) => (t.id === id ? { ...t, ...updateProps } : t))
      );
    const dismiss = () =>
      setToasts((state) => state.filter((t) => t.id !== id));
    setToasts((state) =>
      [...state, { ...props, id, update, dismiss }].slice(-TOAST_LIMIT)
    );
    return { id, dismiss, update };
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    setToasts((state) =>
      toastId ? state.filter((t) => t.id !== toastId) : []
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx)
    throw new Error("useToastContext must be used within a ToastProvider");
  return ctx;
}
