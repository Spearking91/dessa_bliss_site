// middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: "", ...options });
          res.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Protect everything under /admin except /admin/login and confirmation page
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    pathname !== "/admin/AdminLoginPage/pending-admin-confirmation"
  ) {
    if (!session) {
      // Not logged in → redirect to login
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Optional: check admin role here (fast path)
    // You can store role in app_metadata or user_metadata
    const isAdmin =
      session.user?.app_metadata?.role === "admin" ||
      session.user?.user_metadata?.is_admin === true;

    if (!isAdmin) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/admin/login"; // or '/admin/login?unauthorized=true'
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
