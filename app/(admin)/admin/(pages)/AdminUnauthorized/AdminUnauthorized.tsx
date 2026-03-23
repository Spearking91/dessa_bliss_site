"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const AdminUnauthorized = () => {
  const path = usePathname();

  useEffect(() => {
    console.error(
      "403 Forbidden: User attempted to access unauthorized path:",
      path,
    );
  }, [path]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">403</h1>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Unauthorized</h2>
          <p className="text-gray-600">
            You do not have the right qualifications to access this page
          </p>
        </div>
        <Link href="/admin/login">
          <button className={"btn btn-primary"}>Return to Login</button>
        </Link>
      </div>
    </div>
  );
};

export default AdminUnauthorized;
