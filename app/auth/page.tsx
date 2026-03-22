"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabase_client";
import { useAuth } from "./AuthContext";
import { useToast } from "../context/ToastContext";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+233");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!authLoading && session) {
      router.push("/HomePage");
    }
  }, [session, authLoading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        showToast(error.message, "warning");
        if (error.message === "Email not confirmed") {
          router.push(
            `/auth/pending-confirmation?email=${encodeURIComponent(email)}`,
          );
        }
      } else {
        showToast("Sign in successful", "success");
      }
    } catch {
      showToast("An unexpected error occurred during sign-in.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
          data: {
            email: email,
            phone: phone,
            role: "user",
          },
        },
      });
      if (error) {
        showToast(error.message, "error");
      } else if (data.session) {
        // auto-signed-in
      } else {
        router.push(
          `/auth/pending-confirmation?email=${encodeURIComponent(email)}`,
        );
      }
    } catch {
      showToast("An unexpected error occurred during sign-up.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4">
      <div
        className="card w-full max-w-md bg-base-100/70 backdrop-blur-xl shadow-2xl border border-base-300/50 rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="mb-5">
            <Image
              src="/logo2.svg"
              alt="Logo"
              width={140}
              height={140}
              className="mx-auto"
              priority
            />
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold mb-2">
            {activeTab === "signin" ? "Welcome back" : "Get started"}
          </h2>

          <p className="text-base-content/60 text-sm">
            {activeTab === "signin"
              ? "Sign in to continue shopping"
              : "Create your account in seconds"}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-8 pb-2">
          <div className="tabs tabs-bordered w-full">
            <button
              className={`tab tab-bordered flex-1 text-lg font-medium ${
                activeTab === "signin" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("signin")}
            >
              Sign In
            </button>
            <button
              className={`tab tab-bordered flex-1 text-lg font-medium ${
                activeTab === "signup" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 pb-10 pt-6">
          {activeTab === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-6">
              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email address</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="input input-bordered input-lg w-full focus:input-primary transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="input input-bordered input-lg w-full pr-12 focus:input-primary transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 opacity-70" />
                    ) : (
                      <Eye className="h-5 w-5 opacity-70" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full gap-2 shadow-md"
                disabled={loading}
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email address</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="input input-bordered input-lg w-full focus:input-primary transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Phone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Phone number</span>
                </label>
                <input
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  className="input input-bordered input-lg w-full focus:input-primary transition-all"
                  value={phone}
                  maxLength={13}
                  onChange={(e) => {
                    const prefix = "+233";
                    if (e.target.value.length < prefix.length) {
                      setPhone(prefix);
                    } else {
                      setPhone(e.target.value);
                    }
                  }}
                  required
                  autoComplete="tel"
                />
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Create password
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="input input-bordered input-lg w-full pr-12 focus:input-primary transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 opacity-70" />
                    ) : (
                      <Eye className="h-5 w-5 opacity-70" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full gap-2 shadow-md"
                disabled={loading}
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          {/* Switch prompt */}
          <div className="text-center mt-6 text-sm text-base-content/70">
            {activeTab === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  className="link link-primary font-medium"
                  onClick={() => setActiveTab("signup")}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="link link-primary font-medium"
                  onClick={() => setActiveTab("signin")}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
