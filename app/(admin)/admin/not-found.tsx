"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const NotFound = () => {
  const path = usePathname();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      path,
    );
  }, [path]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
          <p className="text-gray-600">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link href="/admin">
          <button className={"btn btn-primary"}>Return to Home</button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
