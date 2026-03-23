"use client";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
      <ShieldAlert className="h-16 w-16 text-error mb-4" />
      <h1 className="text-4xl font-bold mb-2">Access Denied</h1>
      <p className="text-lg text-muted-foreground mb-8">
        You do not have the necessary permissions to access this page.
      </p>
      <Link href="/admin" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
