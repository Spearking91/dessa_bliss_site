"use client";
import { useState } from "react";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("+233");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, isAdmin, user } = useAdminAuth();
  const router = useRouter();
  const { showToast } = useToast();

  // If already authenticated and admin, redirect
  if (user && isAdmin) {
    router.replace("/admin");
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      showToast("Login failed", "error", error);
      if (
        error === "Email not confirmed" ||
        (typeof error === "object" && error === "Email not confirmed")
      ) {
        router.push(
          `/admin/AdminLoginPage/pending-admin-confirmation?email=${encodeURIComponent(email)}`,
        );
      }
    } else {
      router.replace("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h2 className="card-title text-2xl">Admin Panel</h2>
          <p>Sign in to access the administration dashboard</p>

          <form onSubmit={handleSignIn} className="w-full space-y-4 mt-4">
            <div className="form-control">
              <label className="label" htmlFor="signin-email">
                <span className="label-text">Email</span>
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="signin-password">
                <span className="label-text">Password</span>
              </label>
              <input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input input-bordered w-full"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full mt-4"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
