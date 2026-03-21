"use client";

import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "../../../context/AdminAuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // We'll hide the main admin layout and sidebar on the login page.
  const [queryClient] = useState(() => new QueryClient());
  const isLoginPage = [
    "/admin/login",
    "/admin/AdminLoginPage/pending-admin-confirmation",
  ].includes(pathname);

  return (
   <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        {isLoginPage ? (
          <>{children}</>
        ) : (
          <div className="flex min-h-screen bg-background">
            <main className="flex-1 overflow-auto">
              <div className="p-6 max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        )}
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}
