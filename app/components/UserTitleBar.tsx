// "use client";
// import { useState } from "react";
// import { Search, Heart, ShoppingBag, User } from "lucide-react";
// import { ThemeChanger } from "./ThemeChanger";
// import { useRouter, usePathname } from "next/navigation";
// import Image from "next/image";
// import { useCart } from "../context/CartContent";
// import Link from "next/link";
// import { CustomButton } from "./CustomButton";
// import { useAuth } from "../auth/AuthContext";
// import Avatar from "./Avatar";
// import { supabase } from "@/utils/supabase/supabase_client";
// import { useToast } from "../context/ToastContext";

// const UserTitleBar = () => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const { getCartItemCount } = useCart();
//   const [searchQuery, setSearchQuery] = useState("");
//   const { showToast } = useToast();

//   const cartItemCount = getCartItemCount();
//   const { user } = useAuth();
//   const signOut = async (): Promise<void> => {
//     const { error } = await supabase.auth.signOut();
//     if (error) {
//       showToast("SignOut failed", "error", error.message);
//     } else {
//       showToast(
//         "Sign out successful",
//         "success",
//         "Please sign in to check out",
//       );
//     }
//   };

//   // Define paths to show the primary navigation (Home, Products, etc.)
//   const homeNavPaths = ["/LandingPage"];
//   const showHomeNav = homeNavPaths.includes(pathname);

//   const hideBar = ["/auth", "/auth/pending-confirmation"].includes(pathname);

//   // Define paths where the search bar should be hidden
//   const hideSearchBarOnPaths = ["/Profile", "/CartPage", "/LandingPage"];
//   const showSearchBar = !hideSearchBarOnPaths.includes(pathname);

//   if (hideBar) {
//     return null;
//   }

//   return (
//     <header className="border-b border-gray-800 sticky top-0 bg-base-100/95 backdrop-blur-xl z-50">
//       <div className="max-w-[1800px] mx-auto px-6 py-6">
//         <div className="flex items-center justify-between gap-8">
//           <div className="flex items-center gap-12">
//             <Image src={"/logo2.svg"} alt={"Logo"} width={150} height={50} />
//             {/* <h1 className="text-3xl text-base-content font-bold tracking-tighter">
//                 DESSA BLISS
//               </h1> */}
//             {showHomeNav ? (
//               <nav className="hidden lg:flex gap-8">
//                 <Link
//                   href="#1"
//                   className="text-sm font-medium text-base-content hover:text-primary transition-colors"
//                 >
//                   Home
//                 </Link>
//                 <Link
//                   href="#2"
//                   className="text-sm font-medium text-base-content hover:text-primary transition-colors"
//                 >
//                   Products
//                 </Link>
//                 <Link
//                   href="#3"
//                   className="text-sm font-medium text-base-content hover:text-primary transition-colors"
//                 >
//                   Contact
//                 </Link>
//                 <Link
//                   href="#4"
//                   className="text-sm font-medium text-base-content hover:text-primary transition-colors"
//                 >
//                   About
//                 </Link>
//               </nav>
//             ) : (
//               <nav className="hidden lg:flex gap-8">
//                 <Link
//                   href="/"
//                   className="text-sm font-medium text-base-content hover:text-primary transition-colors"
//                 >
//                   New
//                 </Link>
//                 <Link
//                   href="#2"
//                   className="text-sm font-medium text-base-content hover:text-primary transition-colors"
//                 >
//                   Category
//                 </Link>
//                 <Link
//                   href="#3"
//                   className="text-sm font-medium text-base-content hover:text-primary transition-colors"
//                 >
//                   Trending
//                 </Link>
//                 <Link
//                   href="#4"
//                   className="text-sm font-medium text-base-content hover:text-primary transition-colors"
//                 >
//                   About
//                 </Link>
//               </nav>
//             )}
//           </div>

//           {/* Search Bar */}
//           {showSearchBar && (
//             <div className="hidden md:flex flex-1 max-w-xl">
//               <div className="relative w-full">
//                 <Search
//                   className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
//                   size={20}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Search products..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="w-full bg-neutral/50 text-neutral-content pl-12 rounded-full pr-4 py-3 focus:outline-none focus:border-[#00FF94] transition-colors"
//                 />
//               </div>
//             </div>
//           )}

//           {showHomeNav ? (
//             <div className="flex items-center gap-4">
//               <ThemeChanger isIcon={false} />
//               <CustomButton title={"Login"} onNavigate="/auth" />
//             </div>
//           ) : (
//             <div className="flex items-center gap-4">
//               <ThemeChanger isIcon={true} />
//               <button className="p-2 hover:bg-accent transition-colors rounded-lg">
//                 <Heart size={22} className="text-accent-content" />
//               </button>
//               <button
//                 className="relative p-2 hover:bg-accent transition-colors rounded-lg"
//                 onClick={() => router.push("/CartPage")}
//               >
//                 <ShoppingBag size={22} className="text-accent-content" />
//                 {cartItemCount > 0 && (
//                   <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-content text-xs font-bold rounded-full flex items-center justify-center">
//                     {cartItemCount}
//                   </span>
//                 )}
//               </button>

//               {user ? (
//                 <div className="dropdown dropdown-end">
//                   <button
//                     className="p-2 hover:bg-accent transition-colors rounded-lg"
//                     // onClick={() => {
//                     //   router.push("/Profile");
//                     // }}
//                   >
//                     <User size={22} className="text-accent-content" />
//                   </button>
//                   <ul
//                     tabIndex={0}
//                     className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-[1] items-center"
//                   >
//                     <li>
//                       <div className="flex flex-col">
//                         <Avatar />
//                         <p className="ml-3 text-sm font-medium">{user.email}</p>
//                       </div>
//                     </li>
//                     <li>
//                       <button
//                         className="bg-primary text-primary-content"
//                         onClick={signOut}
//                       >
//                         Sign out
//                       </button>
//                     </li>
//                   </ul>
//                 </div>
//               ) : (
//                 <CustomButton title={"Login"} onNavigate="/auth" />
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default UserTitleBar;

"use client";
import { useState } from "react";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
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
  const { user } = useAuth();

  const cartItemCount = getCartItemCount();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast("Sign out failed", "error", error.message);
    } else {
      showToast("Signed out successfully", "success", "Come back soon! 👋");
      setMobileMenuOpen(false);
    }
  };

  // ─── Conditional rendering logic (unchanged) ──────────────────────────────
  const homeNavPaths = ["/LandingPage"];
  const showHomeNav = homeNavPaths.includes(pathname);
  const hideBar = ["/auth", "/auth/pending-confirmation", "/Loading"].includes(
    pathname,
  );
  const hideSearchBarOnPaths = ["/Profile", "/CartPage", "/LandingPage"];
  const showSearchBar = !hideSearchBarOnPaths.includes(pathname);

  if (hideBar) return null;

  // ─── Navigation items ─────────────────────────────────────────────────────
  const navItems = showHomeNav
    ? [
        { label: "Home", href: "#1" },
        { label: "Products", href: "#2" },
        { label: "Contact", href: "#3" },
        { label: "About", href: "#4" },
      ]
    : [
        { label: "New", href: "/" },
        { label: "Category", href: "#2" },
        { label: "Trending", href: "#3" },
        { label: "About", href: "#4" },
      ];

  return (
    <div className="navbar bg-base-100/90 backdrop-blur-lg border-b border-base-300 sticky top-0 z-50 px-4 md:px-6 lg:px-8">
      <div className="navbar-start">
        {/* Mobile menu button */}
        <button
          className="btn btn-ghost lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo2.svg"
            alt="Dessa Bliss"
            width={140}
            height={44}
            priority
          />
        </Link>
      </div>

      {/* Center - Desktop nav + Search */}
      <div className="navbar-center hidden lg:flex items-center gap-10">
        {/* Navigation links */}
        <ul className="menu menu-horizontal px-1 gap-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="text-base-content/90 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Search bar - desktop */}
        {showSearchBar && (
          <div className="form-control w-80">
            <label className="input input-bordered flex items-center gap-3 rounded-full bg-base-200/70">
              <Search size={18} className="text-base-content/60" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="grow bg-transparent focus:outline-none"
              />
            </label>
          </div>
        )}
      </div>

      {/* Right side - actions */}
      <div className="navbar-end gap-2 md:gap-4">
        <ThemeChanger isIcon={true} />

        {!showHomeNav && (
          <>
            <button className="btn btn-ghost btn-circle">
              <Heart size={22} className="text-base-content/80" />
            </button>

            <button
              className="btn btn-ghost btn-circle relative"
              onClick={() => router.push("/CartPage")}
            >
              <ShoppingBag size={22} className="text-base-content/80" />
              {cartItemCount > 0 && (
                <span className="badge badge-secondary badge-sm absolute -top-1 -right-1">
                  {cartItemCount}
                </span>
              )}
            </button>
          </>
        )}

        {/* User / Login */}
        {user ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <Avatar />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu menu-sm mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-64"
            >
              <li className="p-3 border-b border-base-200">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <Avatar />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-base-content/60">Signed in</p>
                  </div>
                </div>
              </li>
              <li>
                <Link href="/Profile" className="justify-between">
                  Profile
                </Link>
              </li>
              <li>
                <button className="text-error" onClick={signOut}>
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <CustomButton title="Login" onNavigate="/auth" />
        )}
      </div>

      {/* ─── Mobile menu ─────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-base-100 border-b border-base-300 shadow-xl py-4 px-6">
          <ul className="menu menu-vertical gap-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-lg py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {showSearchBar && (
            <div className="mt-6">
              <label className="input input-bordered flex items-center gap-3 rounded-full bg-base-200/70">
                <Search size={18} className="text-base-content/60" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="grow bg-transparent focus:outline-none"
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserTitleBar;
