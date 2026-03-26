// "use client";
// import { LogOut, Shield, ChevronLeft, ChevronRight } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useState } from "react";
// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import { useAdminAuth } from "@/app/context/AdminAuthContext";
// import { navItems, ROLE_HIERARCHY } from "../config";
// const AdminSidebar = () => {
//   const pathname = usePathname();
//   const { role, signOut, user } = useAdminAuth();
//   const [collapsed, setCollapsed] = useState(false);
//   const hasAccess = (requiredRoles: string[]) => {
//     if (!role) return false;
//     const minRequired = Math.min(
//       ...requiredRoles.map(
//         (r) => ROLE_HIERARCHY[r as keyof typeof ROLE_HIERARCHY] || 0,
//       ),
//     );
//     return ROLE_HIERARCHY[role] >= minRequired;
//   };
//   return (
//     <aside
//       className={cn(
//         "flex flex-col bg-card border-r border-border min-h-screen transition-all duration-300",
//         collapsed ? "w-16" : "w-64",
//       )}
//     >
//       {/* Logo */}
//       <div className="flex items-center justify-between p-4 border-b border-border">
//         {!collapsed && (
//           <div className="flex items-center gap-2">
//             <Shield className="h-6 w-6 text-primary" />
//             <span className="font-bold text-lg text-foreground">Admin</span>
//           </div>
//         )}
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           className="rounded-full btn btn-ghost h-8 w-8"
//         >
//           {collapsed ? (
//             <ChevronRight className="h-4 w-4" />
//           ) : (
//             <ChevronLeft className="h-4 w-4" />
//           )}
//         </button>
//       </div>
//       {/* Navigation */}
//       <nav className="flex-1 p-2 space-y-1">
//         {navItems
//           .filter((item) => hasAccess(item.roles))
//           .map((item) => {
//             const isActive =
//               pathname === item.path ||
//               (item.path !== "/admin" && pathname.startsWith(item.path));
//             return (
//               <Link
//                 key={item.path}
//                 href={item.path}
//                 className={cn(
//                   "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
//                   isActive
//                     ? "bg-primary text-primary-foreground"
//                     : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
//                 )}
//               >
//                 <item.icon className="h-5 w-5 shrink-0" />
//                 {!collapsed && <span>{item.label}</span>}
//               </Link>
//             );
//           })}
//       </nav>
//       {/* User & Logout */}
//       <div className="p-4 border-t border-border space-y-2">
//         {!collapsed && (
//           <div className="text-xs text-muted-foreground truncate">
//             <p className="font-medium text-foreground truncate">
//               {user?.email}
//             </p>
//             <p className="capitalize">{role?.replace("_", " ")}</p>
//           </div>
//         )}
//         <button
//           // size={collapsed ? "icon" : "default"}
//           onClick={signOut}
//           className={cn(
//             "w-full text-destructive hover:text-destructive hover:bg-destructive/10 btn-ghost",
//             collapsed && "w-10",
//           )}
//         >
//           <LogOut className="h-4 w-4" />
//           {!collapsed && <span className="ml-2">Sign Out</span>}
//         </button>
//       </div>
//     </aside>
//   );
// };
// export default AdminSidebar;

"use client";
import {
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Bell,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import { navItems, ROLE_HIERARCHY } from "../config";
import { supabase } from "@/utils/supabase/supabase_client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/app/context/ToastContext";

interface NotificationAudit {
  id: string;
  created_at: string;
  table_name: string;
  operation: string;
  actor_user_id: string;
  row_id: string;
  old_row: any;
  new_row: any;
  is_read: boolean; // Assuming this column is added for read status
}

const AdminSidebar = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { role, signOut, user } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasAccess = (requiredRoles: string[]) => {
    if (!role) return false;
    const minRequired = Math.min(
      ...requiredRoles.map(
        (r) => ROLE_HIERARCHY[r as keyof typeof ROLE_HIERARCHY] || 0,
      ),
    );
    return ROLE_HIERARCHY[role] >= minRequired;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications for the current user
  const {
    data: notifications = [],
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery<NotificationAudit[]>({
    queryKey: ["admin_notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("notification_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10); // Get latest 10 notifications

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute stale time
  });

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (notificationsError) {
      showToast(
        "Error fetching notifications",
        "error",
        notificationsError.message,
      );
    }
  }, [notificationsError, showToast]);

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notification_audit_channel_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification_audit",
        },
        (payload) => {
          console.log("New notification received:", payload);
          queryClient.invalidateQueries({
            queryKey: ["admin_notifications", user.id],
          });
          showToast("New Activity!", "info", "You have new admin activity.");
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, queryClient, showToast]);

  const getNotificationMessage = (notification: NotificationAudit) => {
    const { table_name, operation, new_row, old_row } = notification;
    let entityName = notification.row_id.substring(0, 8); // Fallback to truncated ID

    if (table_name === "admin_products") {
      entityName = new_row?.name || old_row?.name || entityName;
      return `Product "${entityName}" was ${operation.toLowerCase()}.`;
    } else if (table_name === "orders") {
      entityName = new_row?.id || old_row?.id || entityName;
      const customerName =
        new_row?.shipping_address?.firstName ||
        old_row?.shipping_address?.firstName ||
        "a customer";
      return `Order "${entityName.substring(0, 8)}..." for ${customerName} was ${operation.toLowerCase()}.`;
    }
    return `An item in ${table_name} was ${operation.toLowerCase()}.`;
  };

  const handleNotificationClick = async (notification: NotificationAudit) => {
    // Mark specific notification as read if it's not
    // if (!notification.is_read) {
    //   const { error } = await supabase
    //     .from("notification_audit")
    //     .update({ is_read: true })
    //     .eq("id", notification.id);

    //   if (!error) {
    //     queryClient.invalidateQueries({ queryKey: ["admin_notifications", user?.id] });
    //   }
    // }

    // Redirect based on table
    let targetPath = "";
    let searchParam = "";

    if (notification.table_name === "orders") {
      targetPath = "/admin/AdminOrders";
      searchParam = notification.row_id;
    } else if (notification.table_name === "admin_products") {
      targetPath = "/admin/AdminProducts";
      searchParam = notification.new_row?.name || notification.old_row?.name || notification.row_id;
    }

    if (targetPath) {
      router.push(`${targetPath}?search=${encodeURIComponent(searchParam)}`);
      setNotificationsOpen(false);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    const unreadNotificationIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id);

    if (unreadNotificationIds.length === 0) {
      showToast("No unread notifications", "info");
      return;
    }

    const { error } = await supabase
      .from("notification_audit")
      .update({ is_read: true })
      .in("id", unreadNotificationIds);

    if (error) {
      showToast("Error marking notifications as read", "error", error.message);
    } else {
      queryClient.invalidateQueries({
        queryKey: ["admin_notifications", user.id],
      });
      showToast("Notifications marked as read", "success");
    }
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="admin-sidebar" type="checkbox" className="drawer-toggle" />

      {/* Main content area */}
      <div className="drawer-content flex flex-col">
        {/* Top navbar with toggle button */}
        <nav className="navbar bg-base-200 border-b border-base-300">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="admin-sidebar"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-5 h-5 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>

          <div className="flex-1 px-2 mx-2 font-bold text-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="hidden sm:inline">Admin Panel</span>
            </div>
          </div>

          {/* Notification Section */}
          <div className="flex-none">
            <div
              className={`dropdown dropdown-end ${notificationsOpen ? "dropdown-open" : ""}`}
              ref={dropdownRef}
            >
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <div className="indicator">
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="badge badge-sm badge-primary indicator-item">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[100] p-2 shadow bg-base-100 rounded-box w-80 max-h-96 overflow-y-auto"
              >
                <li className="menu-title flex justify-between items-center">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      className="btn btn-xs btn-ghost text-primary"
                      onClick={markAllAsRead}
                      disabled={isLoadingNotifications}
                    >
                      Mark all as read
                    </button>
                  )}
                </li>
                {isLoadingNotifications ? (
                  <li className="text-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    <span className="text-xs opacity-70">Loading...</span>
                  </li>
                ) : notifications.length === 0 ? (
                  <li className="text-center py-4 text-muted-foreground text-sm">
                    No new notifications.
                  </li>
                ) : (
                  notifications.map((notification) => (
                      <li key={notification.id} onClick={() => handleNotificationClick(notification)}>
                        <a className={`flex flex-col items-start text-wrap ${!notification.is_read ? 'bg-base-200 font-medium border-l-4 border-primary' : ''}`}>
                        <span className="text-xs font-semibold">
                          {getNotificationMessage(notification)}
                        </span>
                        <span className="text-xs opacity-70">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </a>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </nav>

        {/* Page content placeholder — in real layout this area will be filled by children */}
        <div className="p-4 lg:p-6">{children}</div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label
          htmlFor="admin-sidebar"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        <div
          className={`bg-base-200 text-base-content flex flex-col min-h-full transition-all duration-300 border-r border-base-300
            ${collapsed ? "w-16" : "w-64"}`}
        >
          {/* Header with collapse toggle */}
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Admin</span>
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="btn btn-ghost btn-square btn-sm"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <ul className="menu menu-lg flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems
              .filter((item) => hasAccess(item.roles))
              .map((item) => {
                const isActive =
                  pathname === item.path ||
                  (item.path !== "/admin" && pathname.startsWith(item.path));

                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 rounded-md transition-colors
                        ${collapsed ? "justify-center px-2" : "px-3 py-2.5"}
                        ${
                          isActive
                            ? "bg-primary text-primary-content"
                            : "hover:bg-base-300 text-base-content/80"
                        }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
          </ul>

          {/* Footer - User info & Logout */}
          <div className="p-4 border-t border-base-300">
            {!collapsed && user && (
              <div className="mb-3 px-2 text-xs opacity-70">
                <div className="font-medium text-base-content truncate">
                  {user.email}
                </div>
                <div className="capitalize mt-0.5">
                  {role?.replace("_", " ")}
                </div>
              </div>
            )}

            <button
              onClick={signOut}
              className={`btn btn-ghost text-error w-full justify-start gap-3 hover:bg-error/10
                ${collapsed ? "justify-center px-2" : "px-3 py-2.5"}`}
              title={collapsed ? "Sign out" : undefined}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
