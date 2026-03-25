"use client";

import { useProducts } from "@/app/context/ProductContext";
import Loading from "@/app/loading";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

const CategoryList = () => {
  const { products, isLoading, error, refreshProducts, isRetrying } =
    useProducts();

  // Group products by category to extract unique categories with a representative image and count
  const categories = useMemo(() => {
    const categoryMap = new Map<
      string,
      { id: string; name: string; image: string; count: number }
    >();

    products.forEach((product) => {
      if (!product.category || !product.category.id) return;

      if (!categoryMap.has(product.category.id)) {
        categoryMap.set(product.category.id, {
          id: product.category.id,
          name: product.category.name,
          image: product.category.image || product.images?.[0] || "",
          count: 0,
        });
      }
      // Safe to get and update
      const cat = categoryMap.get(product.category.id)!;
      cat.count += 1;
    });

    return Array.from(categoryMap.values());
  }, [products]);

  const handleRetry = async () => {
    await refreshProducts(true);
  };

  if (isLoading && products.length === 0) {
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
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-muted py-12">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Shop by Category
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Browse our curated collections to find exactly what you're looking
            for.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container py-12">
        <div className="grid grid-cols-1 relative sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/ProductPage?category=${encodeURIComponent(category.id)}`}
              className="group relative overflow-hidden rounded-xl aspect-[16/9] block"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 capitalize">
                  {category.name}
                </h2>
                <p className="text-white/80 text-sm">
                  {category.count}{" "}
                  {category.count === 1 ? "product" : "products"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CategoryList;
