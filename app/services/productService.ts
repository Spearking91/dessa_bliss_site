import { supabase } from "@/utils/supabase/supabase_client";

export interface Product {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
    image: string;
    created_at: string;
  };
  description: string;
  price: number;
  discount_price: number | null;
  colors: string[];
  tags: string[];
  rating: number | null;
  reviews: number | null;
  images: string[];
  trending: boolean | null;
  created_at: string;
  stock_quantity: number;
}

// ... other code

// export async function getProducts(limit?: number) {
// The important part is `select('*, categories(*)')`

/**
 * Fetches a list of products with an optional limit.
 */
export async function getProducts(limit?: number) {
  let query = supabase.from("products").select("*, category:categories(*)");

  if (limit) {
    query = query.limit(limit);
  } else {
    query = query.range(0, 4999);
  }

  const { data, error } = await query;

  return { data, error };

  // return await supabase.from("products").select("*").limit(limit);
}

/**
 * Fetches a single product by its ID.
 */
export async function getProductById(id: string) {
  return await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();
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
    .select("*, category:categories(*)")
    .eq("category_id", category)
    .neq("id", excludeId)
    .limit(limit);
}
