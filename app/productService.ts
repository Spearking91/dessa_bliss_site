import { supabase } from "@/utils/supabase/supabase_client";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  colors: string[];
  rating: number | null;
  reviews: number | null;
  image: string | null;
  trending: boolean | null;
  created_at: string;
  stock: number;
}

/**
 * Fetches a list of products with an optional limit.
 */
export async function getProducts(limit: number = 12) {
  return await supabase.from("products").select("*").limit(limit);
}

/**
 * Fetches a single product by its ID.
 */
export async function getProductById(id: string) {
  return await supabase.from("products").select("*").eq("id", id).single();
}

/**
 * Fetches related products in the same category, excluding the current product.
 */
export async function getRelatedProducts(
  category: string,
  excludeId: string,
  limit: number = 4,
) {
  return await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(limit);
}
