// "use client";
// import React, { useState, useMemo, useEffect } from "react";
// import {
//   Search,
//   SlidersHorizontal,
//   Grid3x3,
//   List,
//   ShoppingBag,
//   Heart,
//   Star,
//   TrendingUp,
//   User,
// } from "lucide-react";
// import { FooterBar } from "@/app/components/FooterBar";
// import { ThemeChanger } from "@/app/components/ThemeChanger";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { allProducts, colorOptions } from "@/app/data/products";
// import UserTitleBar from "@/app/components/UserTitleBar";
// import { supabase } from "@/utils/supabase/supabase_client";

// // Module-level cache for products. This will persist across navigations within the app.
// let productCache: any[] | null = null;

// export default function HomePage() {
//   const [view, setView] = useState("grid");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [sortBy, setSortBy] = useState("featured");
//   const [priceRange, setPriceRange] = useState([0, 500]);
//   const [selectedColors, setSelectedColors] = useState<string[]>([]);
//   const [showFilters, setShowFilters] = useState(false);
//   const [products, setProducts] = useState<any[]>([]);
//   const itemsPerPage = 12;
//   const router = useRouter();

//   const categories = ["All", ...new Set(allProducts.map((p) => p.category))];

//   // Filter and sort products+/.
//   useEffect(() => {
//     // Fetch initial data if cache is empty
//     if (!productCache) {
//       supabase
//         .from("products")
//         .select("*")
//         .limit(12)
//         .then(({ data, error }) => {
//           if (error) {
//             console.error("Error fetching initial products:", error.message);
//           } else if (data) {
//             productCache = data;
//             setProducts(data);
//           }
//         });
//     } else {
//       // Load from cache
//       setProducts(productCache);
//     }

//     // Define the handler for database changes
//     const handleDbChanges = (payload: any) => {
//       console.log("Change received!", payload);

//       // Use a callback with setProducts to ensure we have the latest state
//       const updateStateAndCache = (updateFn: (current: any[]) => any[]) => {
//         setProducts((currentProducts) => {
//           const updated = updateFn(currentProducts);
//           productCache = updated; // Update module-level cache
//           return updated;
//         });
//       };

//       if (payload.eventType === "INSERT") {
//         updateStateAndCache((currentProducts) => {
//           // Avoid adding duplicates
//           if (currentProducts.some((p) => p.id === payload.new.id)) {
//             return currentProducts;
//           }
//           return [payload.new, ...currentProducts];
//         });
//       } else if (payload.eventType === "UPDATE") {
//         updateStateAndCache((currentProducts) =>
//           currentProducts.map((p) =>
//             p.id === payload.new.id ? payload.new : p,
//           ),
//         );
//       } else if (payload.eventType === "DELETE") {
//         updateStateAndCache((currentProducts) =>
//           currentProducts.filter((p) => p.id !== payload.old.id),
//         );
//       }
//     };

//     // Set up Supabase real-time subscription
//     const channel = supabase
//       .channel("products-homepage")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "products" },
//         handleDbChanges,
//       )
//       .subscribe((status, err) => {
//         if (status === "SUBSCRIBED") {
//           console.log("Subscribed to products channel!");
//         }
//         if (status === "CHANNEL_ERROR") {
//           console.error("Realtime channel error:", err);
//         }
//       });

//     // Cleanup subscription on component unmount
//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, []);

//   const filteredProducts = useMemo(() => {
//     let tempProducts = products ? [...products] : [];

//     // Search filter
//     if (searchQuery) {
//       tempProducts = tempProducts.filter(
//         (p) =>
//           p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           p.category.toLowerCase().includes(searchQuery.toLowerCase()),
//       );
//     }

//     // Category filter
//     if (selectedCategory !== "All") {
//       tempProducts = tempProducts.filter(
//         (p) => p.category === selectedCategory,
//       );
//     }

//     // Price range filter
//     tempProducts = tempProducts.filter(
//       (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
//     );

//     // Color filter
//     if (selectedColors.length > 0) {
//       tempProducts = tempProducts.filter((p) =>
//         p.colors.some((color: any) => selectedColors.includes(color)),
//       );
//     }

//     // Sort
//     switch (sortBy) {
//       case "price-low":
//         tempProducts.sort((a, b) => a.price - b.price);
//         break;
//       case "price-high":
//         tempProducts.sort((a, b) => b.price - a.price);
//         break;
//       case "rating":
//         tempProducts.sort((a, b) => b.rating - a.rating);
//         break;
//       case "popular":
//         tempProducts.sort((a, b) => b.reviews - a.reviews);
//         break;
//       default:
//         // featured - keep original order
//         break;
//     }

//     return tempProducts;
//   }, [
//     products,
//     searchQuery,
//     selectedCategory,
//     priceRange,
//     selectedColors,
//     sortBy,
//   ]);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
//   const paginatedProducts = filteredProducts.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage,
//   );

//   // Reset page to 1 when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [filteredProducts.length]);

//   const toggleColor = (color: string) => {
//     setSelectedColors((prev) =>
//       prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
//     );
//   };

//   return (
//     <div className="min-h-screen bg-base-100 text-white">
//       {/* <UserTitleBar
//         searchQuery={searchQuery}
//         setSearchQuery={(e: any) => setSearchQuery(e.target.value)}
//       /> */}
//       {/* Hero Banner */}
//       <section className="relative h-[60vh] overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-[#00FF94] via-[#00D4AA] to-[#0099FF] opacity-20"></div>
//         <div
//           className="absolute inset-0"
//           style={{
//             backgroundImage: "url(/background1.jpeg)",
//             // backgroundSize: "contain",
//             // backgroundPosition: "center",
//             opacity: 0.5,
//           }}
//         ></div>
//         <div className="relative max-w-[1800px] mx-auto px-6 h-full flex items-center">
//           <div className="max-w-2xl">
//             <div className="inline-block mb-4">
//               <span className="text-xs font-bold tracking-widest text-primary bg-accent/10 px-4 py-2 rounded-full border border-[#00FF94]/30">
//                 NEW SEASON 2026
//               </span>
//             </div>
//             <h2 className="text-7xl text-base-content font-black mb-6 leading-none">
//               Discover
//               <br />
//               <span className="text-primary">Tomorrow</span>
//             </h2>
//             <p className="text-xl text-base-content/50 mb-8 leading-relaxed">
//               Come set your all your disposables and diaper needs
//             </p>
//             <button className="bg-accent text-accent-content rounded-full px-10 py-4 font-bold text-lg hover:bg-accent-content hover:text-accent transition-all transform hover:scale-105 flex items-center gap-3 group">
//               Explore Collection
//               <TrendingUp
//                 className="group-hover:translate-x-1 transition-transform"
//                 size={20}
//               />
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Filters & Products */}
//       <section className="max-w-[1800px] mx-auto px-6 py-12">
//         {/* Category Pills */}
//         <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide">
//           {categories.map((category) => (
//             <button
//               key={category}
//               onClick={() => {
//                 setSelectedCategory(category);
//                 setCurrentPage(1);
//               }}
//               className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${
//                 selectedCategory === category
//                   ? "bg-accent text-accent-content"
//                   : "bg-neutral/50 text-neutral-content hover:bg-neutral/30 hover:text-neutral-content transition-colors"
//               }`}
//             >
//               {category}
//             </button>
//           ))}
//         </div>

//         {/* Toolbar */}
//         <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-gray-800">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center gap-2 px-4 py-2 bg-neutral/50 text-neutral-content hover:bg-neutral/30 hover:text-neutral-content transition-colors rounded-full"
//             >
//               <SlidersHorizontal size={18} />
//               <span className="font-medium">Filters</span>
//               {(selectedColors.length > 0 ||
//                 priceRange[0] > 0 ||
//                 priceRange[1] < 500) && (
//                 <span className="w-2 h-2 bg-accent rounded-full"></span>
//               )}
//             </button>

//             <div className="text-sm text-gray-500">
//               {filteredProducts.length} products
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="bg-neutral/50 text-neutral-content hover:bg-neutral/30 hover:text-neutral-content transition-colors rounded-full px-4 py-2 focus:outline-none focus:border-[#00FF94] transition-colors"
//             >
//               <option value="featured">Featured</option>
//               <option value="price-low">Price: Low to High</option>
//               <option value="price-high">Price: High to Low</option>
//               <option value="rating">Highest Rated</option>
//               <option value="popular">Most Popular</option>
//             </select>

//             <div className="flex gap-2 border border-accent-content rounded-lg overflow-hidden">
//               <button
//                 onClick={() => setView("grid")}
//                 className={`p-2 ${view === "grid" ? "bg-neutral" : "hover:bg-neutral"} transition-colors`}
//               >
//                 <Grid3x3 size={20} />
//               </button>
//               <button
//                 onClick={() => setView("list")}
//                 className={`p-2 ${view === "list" ? "bg-neutral" : "hover:bg-neutral"} transition-colors`}
//               >
//                 <List size={20} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Advanced Filters Panel */}
//         {showFilters && (
//           <div className="bg-white/5 border border-gray-800 rounded-2xl p-8 mb-8">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-xl font-bold">Advanced Filters</h3>
//               <button
//                 onClick={() => {
//                   setSelectedColors([]);
//                   setPriceRange([0, 500]);
//                 }}
//                 className="text-sm text-gray-400 hover:text-white transition-colors"
//               >
//                 Clear All
//               </button>
//             </div>

//             <div className="grid md:grid-cols-2 gap-8">
//               {/* Price Range */}
//               <div>
//                 <h4 className="font-medium mb-4">Price Range</h4>
//                 <div className="space-y-4">
//                   <input
//                     type="range"
//                     min="0"
//                     max="500"
//                     value={priceRange[1]}
//                     onChange={(e) =>
//                       setPriceRange([priceRange[0], parseInt(e.target.value)])
//                     }
//                     className="w-full accent-[#00FF94]"
//                   />
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-400">${priceRange[0]}</span>
//                     <span className="font-bold text-primary">
//                       ${priceRange[1]}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Colors */}
//               <div>
//                 <h4 className="font-medium mb-4">Colors</h4>
//                 <div className="flex flex-wrap gap-3">
//                   {colorOptions.map((color) => (
//                     <button
//                       key={color.value}
//                       onClick={() => toggleColor(color.value)}
//                       className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
//                         selectedColors.includes(color.value)
//                           ? "border-[#00FF94] bg-accent/10"
//                           : "border-gray-700 hover:border-gray-600"
//                       }`}
//                     >
//                       <div
//                         className="w-5 h-5 rounded-full border-2 border-gray-600"
//                         style={{ backgroundColor: color.hex }}
//                       ></div>
//                       <span className="text-sm">{color.name}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Products Grid/List */}
//         <div
//           className={
//             view === "grid"
//               ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 px-20"
//               : "space-y-6"
//           }
//         >
//           {paginatedProducts.map((product, index) => (
//             <div
//               key={product.id}
//               className={`group cursor-pointer ${view === "list" ? "flex gap-6 bg-white/5 p-6 rounded-xl border border-gray-800" : ""}`}
//               style={{ animationDelay: `${index * 50}ms` }}
//             >
//               <div
//                 className={`relative rounded-xl overflow-hidden bg-white/5 ${view === "grid" ? "aspect-[3/4] mb-4" : "w-48 h-64 flex-shrink-0"}`}
//               >
//                 {product.trending && (
//                   <div className="absolute top-3 left-3 bg-accent text-accent-content text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1">
//                     <TrendingUp size={12} />
//                     TRENDING
//                   </div>
//                 )}
//                 <img
//                   src={product.image}
//                   alt={product.name}
//                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
//                   <div className="absolute bottom-4 left-4 right-4 flex gap-2">
//                     <button
//                       onClick={() => router.push(`/product/${product.id}`)}
//                       className="flex-1 bg-accent text-accent-content py-2 text-sm font-bold hover:bg-accent-content hover:text-accent transition-colors"
//                     >
//                       View Details
//                     </button>
//                     <button className="w-10 h-10 bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
//                       <Heart size={18} />
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div
//                 className={
//                   view === "list" ? "flex-1 flex flex-col justify-between" : ""
//                 }
//               >
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs text-primary font-bold tracking-wider uppercase">
//                       {product.category}
//                     </span>
//                     <div className="flex items-center gap-1">
//                       <Star
//                         size={14}
//                         className="fill-[#FFD700] text-[#FFD700]"
//                       />
//                       <span className="text-sm text-base-content/80 font-medium">
//                         {product.rating}
//                       </span>
//                       <span className="text-xs text-base-content/70">
//                         ({product.reviews})
//                       </span>
//                     </div>
//                   </div>
//                   <h3
//                     className={`font-bold mb-2 text-base-content ${view === "list" ? "text-xl" : "text-lg"}`}
//                   >
//                     {product.name}
//                   </h3>
//                   {view === "list" && (
//                     <p className="text-base-content/70 text-sm mb-4">
//                       Premium quality product crafted with attention to detail
//                       and modern design principles.
//                     </p>
//                   )}
//                 </div>

//                 <div className="text-1xl font-medium text-base-content/50">
//                   In Stock
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div className="text-2xl font-bold text-base-content/80">
//                     ${product.price}
//                   </div>
//                   <div className="flex gap-1">
//                     {product.colors
//                       .slice(0, 3)
//                       .map((color: string, i: number) => (
//                         <div
//                           key={i}
//                           className="w-5 h-5 rounded-full border-2 border-gray-700"
//                           style={{
//                             backgroundColor:
//                               color === "black"
//                                 ? "#000000"
//                                 : color === "white"
//                                   ? "#FFFFFF"
//                                   : color === "gray"
//                                     ? "#9CA3AF"
//                                     : color === "navy"
//                                       ? "#1E3A8A"
//                                       : color === "brown"
//                                         ? "#92400E"
//                                         : color === "beige"
//                                           ? "#D4C5B9"
//                                           : color === "blue"
//                                             ? "#3B82F6"
//                                             : color === "red"
//                                               ? "#EF4444"
//                                               : color === "purple"
//                                                 ? "#A855F7"
//                                                 : color === "silver"
//                                                   ? "#C0C0C0"
//                                                   : color === "gold"
//                                                     ? "#FFD700"
//                                                     : color === "wood"
//                                                       ? "#8B4513"
//                                                       : "#CCCCCC",
//                           }}
//                         ></div>
//                       ))}
//                     {product.colors.length > 3 && (
//                       <div className="w-5 h-5 rounded-full bg-white/10 border-2 border-gray-700 flex items-center justify-center text-[10px]">
//                         +{product.colors.length - 3}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-center gap-2 mt-12">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className="px-4 py-2 text-base-content bg-base-300 hover:bg-base-content/40 disabled:opacity-30 disabled:cursor-not-allowed border border-accent transition-colors rounded-lg"
//             >
//               Previous
//             </button>

//             {[...Array(totalPages)].map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setCurrentPage(i + 1)}
//                 className={`w-10 h-10 rounded-lg font-medium transition-colors ${
//                   currentPage === i + 1
//                     ? "bg-accent text-accent-content"
//                     : "bg-base-300 hover:bg-base-content/40 border border-accent"
//                 }`}
//               >
//                 {i + 1}
//               </button>
//             ))}

//             <button
//               onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className="px-4 py-2 bg-base-300 hover:bg-base-content/40 border border-accent disabled:opacity-30 disabled:cursor-not-allowed  transition-colors rounded-lg"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </section>

//       {/* Footer */}

//       {/* <FooterBar /> */}
//       {/* <footer className="border-t border-gray-800 mt-20">
//         <div className="max-w-[1800px] mx-auto px-6 py-12">
//           <div className="grid md:grid-cols-4 gap-8 mb-12">
//             <div>
//               <h3 className="text-2xl font-black mb-4">DESSA BLISS</h3>
//               <p className="text-gray-400 text-sm">
//                 Premium products for the modern lifestyle.
//               </p>
//             </div>
//             <div>
//               <h4 className="font-bold mb-4 text-primary">Shop</h4>
//               <ul className="space-y-2 text-sm text-gray-400">
//                 <li>
//                   <a href="#" className="hover:text-white transition-colors">
//                     New Arrivals
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white transition-colors">
//                     Trending
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white transition-colors">
//                     Sale
//                   </a>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-bold mb-4 text-primary">Company</h4>
//               <ul className="space-y-2 text-sm text-gray-400">
//                 <li>
//                   <a href="#" className="hover:text-white transition-colors">
//                     About
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white transition-colors">
//                     Contact
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white transition-colors">
//                     Careers
//                   </a>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-bold mb-4 text-primary">Support</h4>
//               <ul className="space-y-2 text-sm text-gray-400">
//                 <li>
//                   <a href="#" className="hover:text-white transition-colors">
//                     Help Center
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white transition-colors">
//                     Shipping
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white transition-colors">
//                     Returns
//                   </a>
//                 </li>
//               </ul>
//             </div>
//           </div>
//           <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
//             <p>&copy; 2026 DESSA BLISS. All rights reserved.</p>
//           </div>
//         </div>
//       </footer> */}

//       <style jsx>{`
//         @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;900&display=swap");

//         * {
//           font-family: "Outfit", sans-serif;
//         }

//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>
//     </div>
//   );
// }

"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  Heart,
  Star,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { allProducts, colorOptions } from "@/app/data/products";
import { supabase } from "@/utils/supabase/supabase_client";
import Loading from "@/app/loading";

// Module-level cache
let productCache: any[] | null = null;

export default function HomePage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 12;
  const router = useRouter();

  const categories = ["All", ...new Set(allProducts.map((p) => p.category))];

  // ────────────────────────────────────────────────
  //  Real-time products + cache
  // ────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    const fetchInitialProducts = async () => {
      if (productCache) {
        setProducts(productCache);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .limit(12)
          .abortSignal(controller.signal);

        if (error) throw error;

        if (data) {
          productCache = data;
          setProducts(data);
        }
      } catch (error: any) {
        // Don't log error if it's an abort error, which is expected during
        // development with React's Strict Mode. Supabase might not give it
        // the standard 'AbortError' name, so we check the message as well.
        if (
          error.name !== "AbortError" &&
          !error.message?.includes("aborted")
        ) {
          console.error("Error fetching products:", error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialProducts();

    const channel = supabase
      .channel("products-homepage")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          setProducts((current) => {
            let updated = [...current];
            if (payload.eventType === "INSERT") {
              if (!current.some((p) => p.id === payload.new.id)) {
                updated = [payload.new, ...current];
              }
            } else if (payload.eventType === "UPDATE") {
              updated = current.map((p) =>
                p.id === payload.new.id ? payload.new : p,
              );
            } else if (payload.eventType === "DELETE") {
              updated = current.filter((p) => p.id !== payload.old.id);
            }
            productCache = updated;
            return updated;
          });
        },
      )
      .subscribe();

    return () => {
      controller.abort();
      supabase.removeChannel(channel);
    };
  }, []);

  // ────────────────────────────────────────────────
  //  Filtering + Sorting (memoized)
  // ────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let temp = products ? [...products] : [];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      temp = temp.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    if (selectedCategory !== "All") {
      temp = temp.filter((p) => p.category === selectedCategory);
    }

    temp = temp.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    if (selectedColors.length > 0) {
      temp = temp.filter((p) =>
        p.colors.some((c: string) => selectedColors.includes(c)),
      );
    }

    switch (sortBy) {
      case "price-low":
        temp.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        temp.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        temp.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        temp.sort((a, b) => b.reviews - a.reviews);
        break;
      // featured → original order
    }

    return temp;
  }, [
    products,
    searchQuery,
    selectedCategory,
    priceRange,
    selectedColors,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts.length]);

  const toggleColor = (color: string) =>
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );

  const resetFilters = () => {
    setSelectedColors([]);
    setPriceRange([0, 500]);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero */}
      <div className="hero min-h-[55vh] relative overflow-hidden">
        <div className="hero-overlay bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{ backgroundImage: "url(/background1.jpeg)" }}
        />
        <div className="hero-content w-full justify-start text-center lg:text-left max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="badge badge-outline badge-lg mb-6 font-bold tracking-wider">
              NEW SEASON 2026
            </div>
            <h1 className="mb-5 text-5xl lg:text-7xl font-black leading-tight">
              Discover
              <br />
              <span className="text-primary">Tomorrow</span>
            </h1>
            <p className="mb-8 text-lg opacity-80">
              Premium disposables & diaper essentials for modern parenting
            </p>
            <button className="btn btn-primary btn-lg gap-3 group">
              Explore Collection
              <TrendingUp className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category filter pills */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`btn btn-sm rounded-full snap-start whitespace-nowrap ${
                selectedCategory === cat ? "btn-primary" : "btn-outline"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              className="btn btn-outline gap-2"
              onClick={() => document.getElementById("filter-drawer")?.click()}
            >
              <SlidersHorizontal size={18} />
              Filters
              {(selectedColors.length > 0 ||
                priceRange[0] > 0 ||
                priceRange[1] < 500) && (
                <div className="badge badge-secondary badge-xs" />
              )}
            </button>

            <div className="text-sm opacity-70">
              {filteredProducts.length} products
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select select-bordered select-sm w-44"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>

            <div className="join">
              <button
                className={`btn join-item ${view === "grid" ? "btn-active" : ""}`}
                onClick={() => setView("grid")}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                className={`btn join-item ${view === "list" ? "btn-active" : ""}`}
                onClick={() => setView("list")}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── FILTER DRAWER ──────────────────────────────────────── */}
        <input type="checkbox" id="filter-drawer" className="drawer-toggle" />
        <div className="drawer-side z-30">
          <label htmlFor="filter-drawer" className="drawer-overlay"></label>
          <div className="p-6 w-80 bg-base-100 text-base-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
                Clear
              </button>
            </div>

            {/* Price */}
            <div className="mb-8">
              <h3 className="font-semibold mb-3">Price Range</h3>
              <input
                type="range"
                min={0}
                max={500}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="range range-primary range-sm"
              />
              <div className="flex justify-between text-sm mt-2">
                <span>${priceRange[0]}</span>
                <span className="font-bold text-primary">${priceRange[1]}</span>
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="font-semibold mb-3">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => toggleColor(color.value)}
                    className={`badge badge-lg gap-2 border ${
                      selectedColors.includes(color.value)
                        ? "badge-primary border-primary"
                        : "badge-outline"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        {view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all group"
                onClick={() => router.push(`/product/${product.id}`)}
              >
                <figure className="relative">
                  {product.trending && (
                    <div className="badge badge-secondary absolute top-3 left-3 z-10 gap-1">
                      <TrendingUp size={12} /> Trending
                    </div>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </figure>
                <div className="card-body p-4">
                  <div className="flex justify-between items-start">
                    <div className="badge badge-outline badge-sm">
                      {product.category}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star size={14} className="fill-warning text-warning" />
                      {product.rating}
                    </div>
                  </div>
                  <h2 className="card-title text-base font-semibold line-clamp-2">
                    {product.name}
                  </h2>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xl font-bold">${product.price}</div>
                    <div className="flex -space-x-1">
                      {product.colors
                        .slice(0, 4)
                        .map((c: string, i: number) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border-2 border-base-100 shadow"
                            style={{
                              backgroundColor: c.startsWith("#") ? c : `#${c}`,
                            }}
                          />
                        ))}
                      {product.colors.length > 4 && (
                        <div className="badge badge-neutral badge-xs">
                          +{product.colors.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="card card-side bg-base-100 shadow-xl hover:shadow-2xl group"
                onClick={() => router.push(`/product/${product.id}`)}
              >
                <figure className="relative w-48">
                  {product.trending && (
                    <div className="badge badge-secondary absolute top-3 left-3 z-10 gap-1">
                      <TrendingUp size={12} /> Trending
                    </div>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover h-full group-hover:scale-105 transition-transform"
                  />
                </figure>
                <div className="card-body">
                  <div className="flex justify-between">
                    <div className="badge badge-outline">
                      {product.category}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-warning text-warning" />
                      {product.rating} ({product.reviews})
                    </div>
                  </div>
                  <h2 className="card-title">{product.name}</h2>
                  <p className="text-sm opacity-70 line-clamp-2">
                    Premium quality disposable & diaper solution
                  </p>
                  <div className="card-actions justify-between items-center mt-3">
                    <div className="text-2xl font-bold">${product.price}</div>
                    <div className="flex gap-1.5">
                      {product.colors
                        .slice(0, 5)
                        .map((c: string, i: number) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full border-2 border-base-100 shadow-sm"
                            style={{
                              backgroundColor: c.startsWith("#") ? c : `#${c}`,
                            }}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2 flex-wrap">
            <button
              className="btn btn-outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn ${currentPage === i + 1 ? "btn-primary" : "btn-outline"}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="btn btn-outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </main>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
