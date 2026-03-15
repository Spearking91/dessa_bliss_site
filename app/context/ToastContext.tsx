// "use client";

// import React, {
//   createContext,
//   useContext,
//   useState,
//   ReactNode,
//   useRef,
// } from "react";
// import Toast from "@/app/components/toast";

// type ToastVariant = "success" | "error" | "info" | "warning" | "default";

// interface ToastMessage {
//   title: string;
//   description?: string;
//   variant: ToastVariant;
// }

// interface ToastContextType {
//   showToast: (
//     title: string,
//     variant: ToastVariant,
//     description?: string,
//   ) => void;
// }

// const ToastContext = createContext<ToastContextType | undefined>(undefined);

// export const ToastProvider = ({ children }: { children: ReactNode }) => {
//   const [toast, setToast] = useState<ToastMessage | null>(null);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const showToast = (
//     title: string,
//     variant: ToastVariant,
//     description: string = "",
//   ) => {
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);

//     setToast({ title, description, variant });
//     timeoutRef.current = setTimeout(() => setToast(null), 3000);
//   };

//   return (
//     <ToastContext.Provider value={{ showToast }}>
//       {children}
//       {toast && <Toast {...toast} />}
//     </ToastContext.Provider>
//   );
// };

// export const useToast = () => {
//   const context = useContext(ToastContext);
//   if (context === undefined) {
//     throw new Error("useToast must be used within a ToastProvider");
//   }
//   return context;
// };

"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import Toast from "../components/toast";

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (
      title: string,
      variant: ToastVariant["variant"] = "default",
      description: string = "",
    ) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setToast({ title, description, variant });
      timeoutRef.current = setTimeout(() => setToast(null), 3000);
    },
    [],
  );

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
