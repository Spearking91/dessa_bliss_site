import { withNextVideo } from "next-video/process";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "envtrhoejcgwywoarjej.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/admin/login",
        destination: "/admin/AdminLoginPage",
      },
      {
        source: "/admin/unauthorized",
        destination: "/admin/AdminUnauthorized",
      },
      {
        source: "/admin",
        destination: "/admin/AdminDashboard",
      },
      {
        source: "/admin/products",
        destination: "/admin/AdminProducts",
      },
      {
        source: "/admin/orders",
        destination: "/admin/AdminOrders",
      },
      {
        source: "/admin/users",
        destination: "/admin/AdminUsers",
      },
      {
        source: "/admin/settings",
        destination: "/admin/AdminSettings",
      },
    ];
  },
};

export default withNextVideo(nextConfig);
