"use client";

import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "@/app/context/AdminAuthContext";
import AdminSidebar from "./components/AdminSidebar";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // We'll hide the main admin layout and sidebar on the login page.
  const isPublicPage = [
    "/admin/login",
    "/admin/unauthorized",
    "/admin/AdminLoginPage/pending-admin-confirmation",
  ].includes(pathname);
const [queryClient] = useState(() => new QueryClient());
  return (
    
      <QueryClientProvider client={queryClient}>
    <AdminAuthProvider>
      {isPublicPage ? (
        <>{children}</>
      ) : (

     <AdminProtectedRoute>
          <div className="flex min-h-screen bg-background">
            <AdminSidebar>
              <main className="flex-1 overflow-auto">
                <div className="p-6 max-w-7xl mx-auto">{children}</div>
              </main>
            </AdminSidebar>
          </div>
        </AdminProtectedRoute>
      )}
    </AdminAuthProvider>
     </QueryClientProvider>
  );
}
