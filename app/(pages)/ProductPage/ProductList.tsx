"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useProducts } from "@/app/context/ProductContext";
import { colorOptions } from "@/app/data/products";
import {
  TrendingUp,
  SlidersHorizontal,
  Grid3x3,
  List,
  Star,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "@/app/loading";

export const ProductList = () => {
  const { products, isLoading, error, refreshProducts, isRetrying } =
    useProducts();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const searchQuery = searchParams.get("search") || "";
  const isTrending = searchParams.get("trending") === "true";

  const itemsPerPage = 12;
  const router = useRouter();

  const categories = useMemo(() => {
    if (!products) return [{ id: "All", name: "All" }];
    const categoryMap = new Map<string, { id: string; name: string }>();
    products.forEach((p) => {
      if (p.category && !categoryMap.has(p.category.id)) {
        categoryMap.set(p.category.id, {
          id: p.category.id,
          name: p.category.name,
        });
      }
    });
    return [{ id: "All", name: "All" }, ...Array.from(categoryMap.values())];
  }, [products]);

  useEffect(() => {
    const categoryFromQuery = searchParams.get("category");
    setSelectedCategory(categoryFromQuery || "All");
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let temp = products ? [...products] : [];

    if (isTrending) {
      temp = temp.filter((p) => p.trending);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      temp = temp.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }

    if (selectedCategory !== "All") {
      temp = temp.filter((p) => p.category?.id === selectedCategory);
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
        temp.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "popular":
        temp.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
        break;
    }

    return temp;
  }, [
    products,
    selectedCategory,
    priceRange,
    selectedColors,
    sortBy,
    searchQuery,
    isTrending,
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

  const handleRetry = async () => {
    await refreshProducts(true);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
        <AlertTriangle className="w-16 h-16 text-error mb-4" />
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
        <p className="text-base-content/70 mb-6">{error}</p>
        <button
          onClick={handleRetry}
          className="btn btn-primary gap-2"
          disabled={isRetrying}
        >
          {isRetrying ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isRetrying ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero */}

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category filter pills */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              className={`btn btn-sm rounded-full snap-start whitespace-nowrap ${
                selectedCategory === cat.id ? "btn-primary" : "btn-outline"
              }`}
            >
              {cat.name}
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
        <input type="checkbox" id="filter-drawer" className="drawer-open" />
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
                <figure className="relative h-64">
                  {product.trending && (
                    <div className="badge badge-secondary absolute top-3 left-3 z-10 gap-1">
                      <TrendingUp size={12} /> Trending
                    </div>
                  )}
                  <Image
                    src={product.images[0] || "/placeholder-image.png"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </figure>
                <div className="card-body p-4">
                  <div className="flex justify-between items-start">
                    <div className="badge badge-outline badge-sm">
                      {product.category?.name}
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
                    <div className="text-xl font-bold">GH₵{product.price}</div>
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
                <figure className="relative w-48 flex-shrink-0">
                  {product.trending && (
                    <div className="badge badge-secondary absolute top-3 left-3 z-10 gap-1">
                      <TrendingUp size={12} /> Trending
                    </div>
                  )}
                  <Image
                    src={product.images[0] || "/placeholder-image.png"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </figure>
                <div className="card-body">
                  <div className="flex justify-between">
                    <div className="badge badge-outline">
                      {product.category?.name}
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
                    <div className="text-2xl font-bold">GH₵{product.price}</div>
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
            {/* <button
              className="btn btn-outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button> */}

            <div className="join">
              <button
                className="join-item btn btn-primary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                «
              </button>
              <button className="join-item btn">Page {currentPage}</button>
              <button
                className="join-item btn btn-primary"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                »
              </button>
            </div>

            {/* <button
              className="btn btn-outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button> */}
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
};
