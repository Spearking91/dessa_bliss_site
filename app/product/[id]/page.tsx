"use client";
import { use, useState, useEffect, Fragment } from "react";
import {
  ShoppingCart,
  ChevronRight,
  Star,
  Check,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useCart } from "@/app/context/CartContent";
import { useToast } from "@/app/context/ToastContext";
import { supabase } from "@/utils/supabase/supabase_client";
import Loading from "@/app/loading";

interface Product {
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
}

export default function ProductDetailPage({
  params,
}: {
  // 2. Type params as a Promise
  params: Promise<{ id: string }>;
}) {
  // 3. Unwrap the params Promise using the use() hook
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleBuyNow = () => {
    if (!product) return;
    const params = new URLSearchParams();
    params.append("name", product.name);
    params.append("price", product.price.toString());
    params.append("image", product.image || "");
    params.append("quantity", quantity.toString());

    router.push(`/PaymentPage?${params.toString()}`);
  };

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      const { data: productData, error: productError } = (await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single()) as { data: Product | null; error: any };

      if (productError || !productData) {
        console.error("Error fetching product:", productError);
        setProduct(null);
      } else {
        setProduct(productData);

        // Fetch related products
        const { data: relatedData, error: relatedError } = (await supabase
          .from("products")
          .select("*")
          .eq("category", productData.category)
          .neq("id", productData.id)
          .limit(4)) as { data: Product[] | null; error: any };

        if (relatedError) {
          console.error("Error fetching related products:", relatedError);
        } else {
          setRelatedProducts(relatedData || []);
        }
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center">
        <div>
          <h2 className="text-2xl font-bold">Product not found</h2>
          <p className="text-gray-500">
            The product you are looking for does not exist.
          </p>
          <button
            className="mt-4 btn btn-primary"
            onClick={() => router.push("/HomePage")}
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product) addToCart(product, quantity);
    showToast("Item added to cart successfully", "success");
  };
  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  return (
    <div className="container px-20">
      <button
        className="btn btn-ghost mb-4 pl-0"
        onClick={() => router.push("/HomePage")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden border border-border rounded-lg">
            <img
              src={product.image || "/placeholder-image.png"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="badge badge-outline mb-2">{product.category}</span>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${product.rating && i < Math.floor(product.rating) ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            {product.reviews != null && (
              <span className="text-sm text-muted-foreground">
                ({product.reviews} reviews)
              </span>
            )}
          </div>
          <div className="mb-6">
            <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
            <div className="flex items-center mt-1 text-green-600">
              <Check className="h-4 w-4 mr-1" />
              <span className="text-sm">In Stock</span>
            </div>
          </div>
          <div className="border-t border-border py-6">
            <div className="flex items-center mb-8">
              <div className="flex items-center border border-border rounded-md mr-4">
                <button
                  onClick={decrementQuantity}
                  className="px-3 py-1 border-r border-border"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="px-3 py-1 border-l border-border"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 btn btn-primary flex items-center justify-center "
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description">
        <TabsList className="border-b mb-6 w-full flex justify-start">
          <TabsTrigger value="description" className="flex-1 max-w-[200px]">
            Description
          </TabsTrigger>
          <TabsTrigger value="specifications" className="flex-1 max-w-[200px]">
            Specifications
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1 max-w-[200px]">
            Reviews
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="py-4">
          <div className="prose prose-gray max-w-none">
            <p>
              Detailed product description is not available for this item yet.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="specifications" className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>High-quality materials</li>
                <li>Durable construction</li>
                <li>Easy to clean and maintain</li>
                <li>Modern design</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Technical Details</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium w-32">Brand:</span>
                  <span className="text-muted-foreground">RetailRift</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Category:</span>
                  <span className="text-muted-foreground">
                    {product.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="py-4">
          <div className="space-y-6">
            <p className="text-muted-foreground text-center">No reviews yet.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="group">
                <div className="aspect-square overflow-hidden rounded-lg bg-muted mb-3">
                  <img
                    src={p.image || "/placeholder-image.png"}
                    alt={p.name}
                    className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                  />
                </div>
                <h3 className="font-medium mb-1">
                  <button
                    className="btn btn-primary p-0 h-auto text-foreground hover:text-primary"
                    onClick={() => router.push(`/product/${p.id}`)}
                  >
                    {p.name}
                  </button>
                </h3>
                <p className="font-semibold">${p.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
