"use client";
// import Video from "next-video"; // Not used
// import Login from "./Login"; // Not used in current JSX
// import Signup from "./Signup"; // Not used in current JSX
// import bat from "../../videos/batman.mp4"; // Not used
// import LoginForm from "./Login"; // Not used in current JSX
import Image from "next/image";
// import Link from "next/link"; // Not used
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react"; // Shield is not used
import { TabsTrigger, Tabs, TabsContent, TabsList } from "../components/tabs";
import { supabase } from "@/utils/supabase/supabase_client";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useToast } from "../context/ToastContext";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+233");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const { showToast } = useToast();

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
        // Redirect handled by useEffect
      }
    } catch (error) {
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
        // Auto-confirmed, user is logged in.
        // Redirect handled by useEffect
      } else {
        // Email confirmation needed.
        router.push(
          `/auth/pending-confirmation?email=${encodeURIComponent(email)}`,
        );
      }
    } catch (error) {
      showToast("An unexpected error occurred during sign-up.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md shadow-sm bg-base-100 p-5">
        <div className=" text-center">
          <div className="flex items-center justify-center">
            <Image src={"/logo2.svg"} alt={""} width={200} height={200} />
          </div>
          <h2 className="card title text-2xl font-semibold ">Login Page</h2>
          <h4>Sign in to access the wonderful products we have to offer </h4>
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
                  <label htmlFor="signup-phone" className="font-semibold">
                    Phone
                  </label>
                  <input
                    className="input w-full rounded-lg"
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    maxLength={13}
                    onChange={(e) => {
                      const prefix = "+233";
                      // Prevent user from deleting the prefix
                      if (e.target.value.length < prefix.length) {
                        setPhone(prefix);
                      } else {
                        setPhone(e.target.value);
                      }
                    }}
                    placeholder="+233-23-456-7890"
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
                {/* <p className="text-xs text-muted-foreground text-center">
                  The first account created automatically becomes Super Admin.
                </p> */}
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
