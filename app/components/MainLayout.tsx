"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import UserTitleBar from "./UserTitleBar";
import { FooterBar } from "./FooterBar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && (
        <Suspense fallback={<div className="h-16" />}>
          <UserTitleBar />
        </Suspense>
      )}
      <main className="flex-grow">{children}</main>
      {!isAdminRoute && <FooterBar />}
    </>
  );
}
