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
export async function getProducts(
  limit?: number,
  onBatchFetched?: (batch: Product[]) => void,
) {
  if (limit) {
    const response = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .limit(limit);
    if (response.data && onBatchFetched)
      onBatchFetched(response.data as Product[]);
    return response;
  }

  let allData: Product[] = [];
  let from = 0;
  const batchSize = 500;
  const seenIds = new Set<string>(); // To track seen IDs

  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false }) // Add secondary order for deterministic pagination
      .range(from, from + batchSize - 1);

    if (error) return { data: null, error };
    if (!data || data.length === 0) break;

    const newUniqueData = (data as Product[]).filter(
      (product) => !seenIds.has(product.id),
    );
    newUniqueData.forEach((product) => seenIds.add(product.id));

    if (onBatchFetched && newUniqueData.length > 0) {
      onBatchFetched(newUniqueData);
    }

    allData = [...allData, ...newUniqueData];

    if (data.length < batchSize) break;

    from += batchSize;
    // Wait 3 seconds before next batch
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  return { data: allData, error: null };
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
