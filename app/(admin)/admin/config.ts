import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ScrollText,
  Settings,
} from "lucide-react";

export const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
    roles: ["support", "manager", "admin", "super_admin"],
  },
  {
    label: "Products",
    icon: Package,
    path: "/admin/products",
    roles: ["manager", "admin", "super_admin"],
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    path: "/admin/orders",
    roles: ["support", "manager", "admin", "super_admin"],
  },
  {
    label: "Users",
    icon: Users,
    path: "/admin/users",
    roles: ["admin", "super_admin"],
  },
  {
    label: "Activity Logs",
    icon: ScrollText,
    path: "/admin/logs",
    roles: ["admin", "super_admin"],
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
    roles: ["super_admin"],
  },
];

export type AdminRole = "super_admin" | "admin" | "manager" | "user";

export const ROLE_HIERARCHY: Record<AdminRole, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  user: 1,
};
