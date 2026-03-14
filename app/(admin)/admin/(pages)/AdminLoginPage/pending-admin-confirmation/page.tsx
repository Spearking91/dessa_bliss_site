"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/supabase_client";
import { Mail, RefreshCw, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

function PendingAdminConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { user: session, isLoading:authLoading } = useAdminAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!authLoading && session) {
      // User has confirmed their email and is now logged in
      router.push("/admin");
    }
  }, [session, authLoading, router]);

  const handleResendConfirmation = async () => {
    if (!email) {
      setErrorMessage(
        "Email not found. Please go back and try signing up again.",
      );
      return;
    }
    setResendLoading(true);
    setResendMessage("");
    setErrorMessage("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    setResendLoading(false);
    if (error) {
      setErrorMessage(`Error: ${error.message}`);
      
    } else {
      setResendMessage("A new confirmation link has been sent to your email.");
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">Checking authentication status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md shadow-sm bg-base-100 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h2 className="card-title text-2xl font-semibold justify-center">
          Confirm your email
        </h2>
        <p className="mt-2 text-base-content/80">
          We've sent a confirmation link to{" "}
          <strong className="text-primary">{email || "your email"}</strong>.
        </p>
        <p className="mt-1 text-base-content/80">
          Please check your inbox and click the link to complete your
          registration.
        </p>
        <div className="mt-6">
          <button
            onClick={handleResendConfirmation}
            className="btn btn-secondary rounded-lg w-full"
            disabled={resendLoading || !email}
          >
            {resendLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Resend confirmation link
          </button>
        </div>
        {resendMessage && (
          <p className="mt-4 text-sm text-success">{resendMessage}</p>
        )}
        {errorMessage && (
          <p className="mt-4 text-sm text-error">{errorMessage}</p>
        )}
        <div className="mt-6 text-sm">
          <button
            onClick={() => router.push("/admin/login")}
            className="link link-hover"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PendingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <PendingAdminConfirmationContent />
    </Suspense>
  );
}
