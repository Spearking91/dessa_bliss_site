"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Toast from "@/app/components/toast";

type ToastVariant = "success" | "error" | "info" | "warning" | "default";

interface ToastMessage {
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (
    title: string,
    variant: ToastVariant,
    description?: string,
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (
    title: string,
    variant: ToastVariant,
    description: string = "",
  ) => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3000); // Toast disappears after 3 seconds
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast {...toast} />}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
