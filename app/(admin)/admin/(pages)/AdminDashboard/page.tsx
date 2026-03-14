"use client";
import { useState, useEffect } from "react";

import {
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import { supabase } from "@/utils/supabase/supabase_client";

// Keep static chart data (would require aggregation queries for real data)
const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5800 },
  { month: "Mar", revenue: 4900 },
  { month: "Apr", revenue: 7200 },
  { month: "May", revenue: 6100 },
  { month: "Jun", revenue: 8400 },
  { month: "Jul", revenue: 7800 },
  { month: "Aug", revenue: 9200 },
  { month: "Sep", revenue: 8600 },
  { month: "Oct", revenue: 10400 },
  { month: "Nov", revenue: 11200 },
  { month: "Dec", revenue: 13500 },
];

const ordersChartData = [
  { month: "Jan", orders: 42 },
  { month: "Feb", orders: 58 },
  { month: "Mar", orders: 49 },
  { month: "Apr", orders: 72 },
  { month: "May", orders: 61 },
  { month: "Jun", orders: 84 },
  { month: "Jul", orders: 78 },
  { month: "Aug", orders: 92 },
  { month: "Sep", orders: 86 },
  { month: "Oct", orders: 104 },
  { month: "Nov", orders: 112 },
  { month: "Dec", orders: 135 },
];

const categoryColors = ["#570df8", "#ef4444", "#37cdbe", "#94a3b8"];

const MetricCard = ({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
}) => {
  const iconColors = {
    default: "text-primary bg-primary/10",
    success: "text-green-600 bg-green-100",
    warning: "text-yellow-600 bg-yellow-100",
    danger: "text-red-600 bg-red-100",
  };
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${iconColors[variant]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { role, user } = useAdminAuth();
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    lowStock: 0,
  });
  const [categoryDist, setCategoryDist] = useState<
    { name: string; value: number; fill: string }[]
  >([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const [usersRes, productsRes, ordersRes, lowStockRes] = await Promise.all(
        [
          supabase.from("users").select("id", { count: "exact", head: true }),
          supabase.from("products").select("id, category", { count: "exact" }),
          supabase
            .from("orders")
            .select("id, status, total", { count: "exact" }),
          supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .lte("stock", 5)
            .eq("status", "active"),
        ],
      );

      const orders = ordersRes.data || [];
      const revenue = orders.reduce(
        (sum: number, o: any) => sum + Number(o.total || 0),
        0,
      );
      const pending = orders.filter((o: any) => o.status === "pending").length;
      const completed = orders.filter(
        (o: any) => o.status === "delivered",
      ).length;
      const cancelled = orders.filter(
        (o: any) => o.status === "cancelled",
      ).length;

      // Category distribution from products
      const products = productsRes.data || [];
      const catMap: Record<string, number> = {};
      products.forEach((p: any) => {
        catMap[p.category || "Other"] =
          (catMap[p.category || "Other"] || 0) + 1;
      });
      const dist = Object.entries(catMap).map(([name, value], i) => ({
        name,
        value,
        fill: categoryColors[i % categoryColors.length],
      }));

      setMetrics({
        totalUsers: usersRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRevenue: revenue,
        pendingOrders: pending,
        completedOrders: completed,
        cancelledOrders: cancelled,
        lowStock: lowStockRes.count || 0,
      });
      setCategoryDist(dist);
    };
    fetchMetrics();
  }, []);

  const m = metrics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email} ·{" "}
          <span className="capitalize">{role?.replace("_", " ")}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={m.totalUsers.toLocaleString()}
          icon={Users}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${m.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          variant="success"
        />
        <MetricCard
          title="Total Orders"
          value={m.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          description={`${m.pendingOrders} pending`}
        />
        <MetricCard
          title="Low Stock Items"
          value={m.lowStock}
          icon={AlertTriangle}
          description={`${m.totalProducts} total products`}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5" /> Revenue Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    color: "#000",
                  }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#570df8"
                  strokeWidth={2}
                  dot={{ fill: "#570df8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2 text-foreground">
              <ShoppingCart className="h-5 w-5" /> Orders Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    color: "#000",
                  }}
                />
                <Bar dataKey="orders" fill="#570df8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2 text-foreground">
              <Package className="h-5 w-5" /> Product Categories
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: { name: any; percent: any }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  fontSize={11}
                >
                  {categoryDist.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    color: "#000",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-foreground">Order Status</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-foreground">Pending</span>
              </div>
              <span className="font-semibold text-foreground">
                {m.pendingOrders}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-foreground">Completed</span>
              </div>
              <span className="font-semibold text-foreground">
                {m.completedOrders}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-foreground">Cancelled</span>
              </div>
              <span className="font-semibold text-foreground">
                {m.cancelledOrders}
              </span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-foreground">Quick Stats</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="font-semibold text-foreground">
                {m.totalUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Products
              </span>
              <span className="font-semibold text-foreground">
                {m.totalProducts}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Orders
              </span>
              <span className="font-semibold text-foreground">
                {m.totalOrders}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Low Stock Items
              </span>
              <span className="font-semibold text-foreground">
                {m.lowStock}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Revenue
              </span>
              <span className="font-semibold text-foreground">
                ${m.totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
