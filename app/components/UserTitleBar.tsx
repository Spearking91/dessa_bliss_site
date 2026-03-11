"use client";
import { useState } from "react";
import { Search, Heart, ShoppingBag, User } from "lucide-react";
import { ThemeChanger } from "./ThemeChanger";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useCart } from "../context/CartContent";
import Link from "next/link";
import { CustomButton } from "./CustomButton";
import { useAuth } from "../auth/AuthContext";
import Avatar from "./Avatar";
import { supabase } from "@/utils/supabase/supabase_client";
import { useToast } from "../context/ToastContext";

const UserTitleBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { getCartItemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  const cartItemCount = getCartItemCount();
  const { user } = useAuth();
  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast("SignOut failed", "error", error.message);
    } else {
      showToast(
        "Sign out successful",
        "success",
        "Please sign in to check out",
      );
    }
  };

  // Define paths to show the primary navigation (Home, Products, etc.)
  const homeNavPaths = ["/LandingPage"];
  const showHomeNav = homeNavPaths.includes(pathname);

  const hideBar = ["/auth"].includes(pathname);

  // Define paths where the search bar should be hidden
  const hideSearchBarOnPaths = ["/Profile", "/CartPage", "/LandingPage"];
  const showSearchBar = !hideSearchBarOnPaths.includes(pathname);

  if (hideBar) {
    return null;
  }

  return (
    <header className="border-b border-gray-800 sticky top-0 bg-base-100/95 backdrop-blur-xl z-50">
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-12">
            <Image src={"/logo2.svg"} alt={"Logo"} width={150} height={50} />
            {/* <h1 className="text-3xl text-base-content font-bold tracking-tighter">
                DESSA BLISS
              </h1> */}
            {showHomeNav ? (
              <nav className="hidden lg:flex gap-8">
                <Link
                  href="#1"
                  className="text-sm font-medium text-base-content hover:text-primary transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="#2"
                  className="text-sm font-medium text-base-content hover:text-primary transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="#3"
                  className="text-sm font-medium text-base-content hover:text-primary transition-colors"
                >
                  Contact
                </Link>
                <Link
                  href="#4"
                  className="text-sm font-medium text-base-content hover:text-primary transition-colors"
                >
                  About
                </Link>
              </nav>
            ) : (
              <nav className="hidden lg:flex gap-8">
                <Link
                  href="/"
                  className="text-sm font-medium text-base-content hover:text-primary transition-colors"
                >
                  New
                </Link>
                <Link
                  href="#2"
                  className="text-sm font-medium text-base-content hover:text-primary transition-colors"
                >
                  Category
                </Link>
                <Link
                  href="#3"
                  className="text-sm font-medium text-base-content hover:text-primary transition-colors"
                >
                  Trending
                </Link>
                <Link
                  href="#4"
                  className="text-sm font-medium text-base-content hover:text-primary transition-colors"
                >
                  About
                </Link>
              </nav>
            )}
          </div>

          {/* Search Bar */}
          {showSearchBar && (
            <div className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral/50 text-neutral-content pl-12 rounded-full pr-4 py-3 focus:outline-none focus:border-[#00FF94] transition-colors"
                />
              </div>
            </div>
          )}

          {showHomeNav ? (
            <div className="flex items-center gap-4">
              <ThemeChanger isIcon={false} />
              <CustomButton title={"Login"} onNavigate="/auth" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ThemeChanger isIcon={true} />
              <button className="p-2 hover:bg-accent transition-colors rounded-lg">
                <Heart size={22} className="text-accent-content" />
              </button>
              <button
                className="relative p-2 hover:bg-accent transition-colors rounded-lg"
                onClick={() => router.push("/CartPage")}
              >
                <ShoppingBag size={22} className="text-accent-content" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-content text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="dropdown dropdown-end">
                  <button
                    className="p-2 hover:bg-accent transition-colors rounded-lg"
                    // onClick={() => {
                    //   router.push("/Profile");
                    // }}
                  >
                    <User size={22} className="text-accent-content" />
                  </button>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-[1] items-center"
                  >
                    <li>
                      <div className="flex flex-col">
                        <Avatar />
                        <p className="ml-3 text-sm font-medium">{user.email}</p>
                      </div>
                    </li>
                    <li>
                      <button
                        className="bg-primary text-primary-content"
                        onClick={signOut}
                      >
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <CustomButton title={"Login"} onNavigate="/auth" />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default UserTitleBar;
