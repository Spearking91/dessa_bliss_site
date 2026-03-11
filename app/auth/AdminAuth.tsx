"use client";
// import Video from "next-video"; // Not used
// import Login from "./Login"; // Not used in current JSX
// import Signup from "./Signup"; // Not used in current JSX
// import bat from "../../videos/batman.mp4"; // Not used
// import LoginForm from "./Login"; // Not used in current JSX
import Image from "next/image";
import Link from "next/link"; // Not used
import { useState, useEffect } from "react";
import { Loader2, Shield } from "lucide-react";
import { TabsTrigger, Tabs, TabsContent, TabsList } from "../components/tabs";
import { supabase } from "@/utils/supabase/supabase_client";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";


export default function AdminAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // const [isLogin, setIsLogin] = useState(true); // Not used
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();

  // return (
  //   <div className="flex min-h-screen bg-base-200 flex-row">
  //     <div
  //       className="hidden md:flex flex-1 hero bg-blue"
  //       style={{
  //         backgroundImage: "url(/background1.jpeg)",
  //       }}
  //     ></div>
  //     <div className="bg-base-100 flex-1 flex-col flex rounded-xl overflow-hidden ">
  //       {isLogin ? <LoginForm /> : <Signup />}
  //       <div className="flex flex-row gap-1 items-center justify-center">
  //         <p className="text-sm" children={"Don't have an account?"} />
  //         <button
  //           className="text-sm text-accent"
  //           onClick={() => setIsLogin(!isLogin)}
  //           children={isLogin ? "Sign Up" : "Login"}
  //         />
  //       </div>
  //     </div>
  //   </div>
  // );

  useEffect(() => {
    if (!authLoading && session) {
      // User is logged in, redirect to homepage
      router.push("/Homepage");
    }
  }, [session, authLoading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      alert(error.message);
    } else {
      setLoading(false);
      router.push("/Homepage");
    }
  };
  // TODO: Implement actual sign-up logic for admin users, similar to handleSignIn
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md shadow-sm bg-base-100 p-5">
        <div className=" text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h2 className="card title text-2xl font-semibold ">Admin Panel</h2>
          <h4>Sign in to access the administration dashboard</h4>
        </div>
        <div className="card-content">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="signin-email" className={"font-semibold"}>
                    Email
                  </label>
                  <input
                    className="input w-full rounded-lg"
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="signin-password" className={"font-semibold"}>
                    Password
                  </label>
                  <input
                    className="input w-full rounded-lg"
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary rounded-lg w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Sign In
                </button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="signup-email" className="font-semibold">
                    Email
                  </label>
                  <input
                    className="input w-full rounded-lg"
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="signup-password" className={"font-semibold"}>
                    Password
                  </label>
                  <input
                    className="input w-full rounded-lg"
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary rounded-lg w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Create Account
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  The first account created automatically becomes Super Admin.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
