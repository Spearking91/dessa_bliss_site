"use client";
import {
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useState } from "react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import { navItems, ROLE_HIERARCHY } from "../config";

const AdminSidebar = () => {
  const pathname = usePathname();
  const { role, signOut, user } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);

  const hasAccess = (requiredRoles: string[]) => {
    if (!role) return false;
    const minRequired = Math.min(
      ...requiredRoles.map((r) => ROLE_HIERARCHY[r] || 0),
    );
    return ROLE_HIERARCHY[role] >= minRequired;
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-card border-r border-border min-h-screen transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground">Admin</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full btn btn-ghost h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems
          .filter((item) => hasAccess(item.roles))
          .map((item) => {
            const isActive =
              pathname === item.path ||
              (item.path !== "/admin" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-border space-y-2">
        {!collapsed && (
          <div className="text-xs text-muted-foreground truncate">
            <p className="font-medium text-foreground truncate">
              {user?.email}
            </p>
            <p className="capitalize">{role?.replace("_", " ")}</p>
          </div>
        )}
        <button
          // size={collapsed ? "icon" : "default"}
          onClick={signOut}
          className={cn(
            "w-full text-destructive hover:text-destructive hover:bg-destructive/10 btn-ghost",
            collapsed && "w-10",
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
