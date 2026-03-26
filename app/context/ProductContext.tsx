// c:\Users\Alter\Desktop\Everything\work\Github\dessa_bliss_site\app\context\ProductContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { supabase } from "@/utils/supabase/supabase_client";
import { getProducts, Product } from "@/app/services/productService";

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: (isRetry?: boolean) => Promise<void>;
  isRetrying: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Module-level cache to persist across navigations
let productCache: Product[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const isMounted = useRef(true);

  const fetchProductsData = useCallback(async (isRetry = false) => {
    if (isRetry) setIsRetrying(true);
    else setIsLoading(true);

    setError(null);

    try {
      /**
       * Fetches a list of products with an optional limit.
       */
      const fetchAllProducts = async (limit?: number) => {
        if (limit) {
          return await supabase
            .from("products")
            .select("*, category:categories(*)")
            .limit(limit);
        }

        let allData: any[] = [];
        let from = 0;
        const batchSize = 500;
        const seenIds = new Set<string>(); // To track seen IDs

        while (true) {
          const { data, error } = await supabase
            .from("products")
            .select("*, category:categories(*)")
            .range(from, from + batchSize - 1)
            .order("created_at", { ascending: false })
            .order("id", { ascending: false }); // Add secondary order for deterministic pagination

          if (error) return { data: null, error };
          if (!data || data.length === 0) break;

          const newUniqueData = (data as Product[]).filter(
            (product) => !seenIds.has(product.id)
          );
          newUniqueData.forEach((product) => seenIds.add(product.id));
          allData = [...allData, ...newUniqueData];
          if (data.length < batchSize) break;

          from += batchSize;
          // Wait 3 seconds before next batch as requested
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        return { data: allData, error: null };
      };

      const { data, error: supabaseError } = await fetchAllProducts();

      if (!isMounted.current) return;
      if (supabaseError) throw supabaseError;

      if (data) {
        productCache = data;
        lastFetchTime = Date.now();
        setProducts(data);
      }
    } catch (err: unknown) {
      if (isMounted.current) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Fetch error:", message);
        setError(
          isRetry
            ? "Failed to retry. Please try again."
            : "Failed to load products.",
        );
      }
    } finally {
      if (isMounted.current) {
        setIsRetrying(false);
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    // Check cache freshness
    const now = Date.now();
    if (productCache && now - lastFetchTime < CACHE_TTL_MS) {
      setProducts(productCache);
      setIsLoading(false);
    } else {
      fetchProductsData();
    }

    // Realtime subscription
    const channel = supabase
      .channel("products-global")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          setProducts((current) => {
            let updated = [...current];
            if (payload.eventType === "INSERT") {
              const newItem = payload.new as Product;
              if (!current.some((p) => p.id === newItem.id)) {
                updated = [newItem, ...current];
              }
            } else if (payload.eventType === "UPDATE") {
              const updatedItem = payload.new as Product;
              updated = current.map((p) =>
                p.id === updatedItem.id ? updatedItem : p,
              );
            } else if (payload.eventType === "DELETE") {
              updated = current.filter((p) => p.id !== payload.old.id);
            }
            // Update cache and timestamp
            productCache = updated;
            lastFetchTime = Date.now();
            return updated;
          });
        },
      )
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchProductsData]);

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        error,
        refreshProducts: fetchProductsData,
        isRetrying,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
