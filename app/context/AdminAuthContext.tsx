"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase/supabase_client";
import { AdminRole, ROLE_HIERARCHY } from "../(admin)/admin/config";

interface AdminAuthContextType {
  user: User | null;
  role: AdminRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  session: Session | null;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  // signUp: (
  //   email: string,
  //   password: string,
  //   phone: string,
  // ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AdminRole) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const fetchRole = useCallback(async (userId: string) => {
    const { data } = await supabase.rpc("get_admin_role", { _user_id: userId });
    setRole(data as AdminRole | null);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchRole(session.user.id);
      } else {
        setRole(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  // const signUp = async (email: string, password: string, phone: string) => {
  //   const { error } = await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       emailRedirectTo: `${window.location.origin}/admin`,
  //       data: {
  //         email: email,
  //         phone: phone,
  //         // role: "admin",
  //       },
  //     },
  //   });
  //   if (error) return { error: error.message };
  //   return { error: null };
  // };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  const hasRole = (requiredRole: AdminRole) => {
    if (!role) return false;
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole];
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        role,
        isAdmin: !!role,
        isLoading,
        signIn,
        // signUp,
        signOut,
        hasRole,
        session,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
