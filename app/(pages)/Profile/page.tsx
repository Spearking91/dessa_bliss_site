"use client";
import { useAuth } from "@/app/auth/AuthContext";
import { supabase } from "@/utils/supabase/supabase_client";
import { useRouter } from "next/navigation";
import React from "react";

const page = () => {
  const { session, user } = useAuth();
  const router = useRouter();
  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("SignOut failed:", error.message);
    } else {
      console.log("SignOut successful");
      router.replace("/auth");
    }
  };
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-base-200 text-base-content">
      <h1 className="text-2xl font-bold  mb-4">Profile Page</h1>
      <p className="mb-4">
        Welcome to your profile! Here you can manage your account settings and
        view your activity.
      </p>
      <p className="mb-4">Email: {user?.email}</p>
      <button className="btn btn-primary" onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
};
// TODO: Implement actual sign-up logic for admin users, similar to handleSignIn
export default page;
