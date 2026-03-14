"use client";

import { useAdminAuth } from "@/app/context/AdminAuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { navItems, ROLE_HIERARCHY } from "../config";

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, isLoading, isAdmin } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until authentication status is loaded
    }

    // If not loading and not an admin user, redirect to login
    if (!user || !isAdmin) {
      router.replace("/admin/login");
      return;
    }

    // Find the configuration for the current route
    const getRequiredRoles = () => {
      if (pathname === "/admin") {
        return navItems.find((item) => item.path === "/admin")?.roles;
      }
      // Find the most specific matching route by checking which base path it starts with
      const matchingItem = navItems
        .filter((item) => item.path !== "/admin")
        // Sort by path length descending to find the most specific match first
        .sort((a, b) => b.path.length - a.path.length)
        .find((item) => pathname.startsWith(item.path));
      return matchingItem?.roles;
    };

    const requiredRoles = getRequiredRoles();

    if (requiredRoles && role) {
      const userLevel = ROLE_HIERARCHY[role] || 0;
      const minRequiredLevel = Math.min(
        ...requiredRoles.map(
          (r) => ROLE_HIERARCHY[r as keyof typeof ROLE_HIERARCHY] || 99,
        ),
      );

      if (userLevel < minRequiredLevel) {
        router.replace("/admin/unauthorized");
      }
    }
  }, [isLoading, user, isAdmin, role, pathname, router]);

  // While loading, or if no user, show a loading screen to prevent content flicker
  if (isLoading || !user || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
