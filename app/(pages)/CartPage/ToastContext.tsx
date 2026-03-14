"use client";
import Toast from "@/app/components/toast";
import { createContext, useContext, useState, ReactNode } from "react";

interface ToastVariant {
  title: string;
  description?: string;
  variant?: "default" | "error" | "success" | "warning" | "info";
}

interface ToastContextType {
  showToast: (
    title: string,
    variant?: ToastVariant["variant"],
    description?: string,
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastVariant | null>(null);

  const showToast = (
    title: string,
    variant: ToastVariant["variant"] = "default",
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
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
