"use client";

import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "../../../context/AdminAuthContext";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // We'll hide the main admin layout and sidebar on the login page.
  const isLoginPage = [
    "/admin/login",
    "/admin/AdminLoginPage/pending-admin-confirmation",
  ].includes(pathname);

  return (
    <AdminAuthProvider>
      {isLoginPage ? (
        <>{children}</>
      ) : (
        <div className="flex min-h-screen bg-background">
          {/* <AdminSidebar /> */}
          <main className="flex-1 overflow-auto">
            <div className="p-6 max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      )}
    </AdminAuthProvider>
  );
}
