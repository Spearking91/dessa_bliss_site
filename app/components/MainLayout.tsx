"use client";

import { usePathname } from "next/navigation";
import UserTitleBar from "./UserTitleBar";
import { FooterBar } from "./FooterBar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <UserTitleBar />}
      <main className="flex-grow">{children}</main>
      {!isAdminRoute && <FooterBar />}
    </>
  );
}