"use client";
import { use, useState, useEffect } from "react";
import { ShoppingCart, Star, Check, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContent";
import Loading from "@/app/loading";
import {
  getProductById,
  getRelatedProducts,
  Product,
} from "@/app/services/productService";
import Image from "next/image";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      const { data: productData, error: productError } =
        await getProductById(id);

      if (productError || !productData) {
        console.error("Error fetching product:", productError);
        setProduct(null);
      } else {
        setProduct(productData);

        const { data: relatedData, error: relatedError } =
          await getRelatedProducts(productData.category, productData.id, 4);

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

  if (loading) return <Loading />;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-3">Product Not Found</h2>
          <p className="text-base-content/70 mb-6">
            Sorry, we couldn't find that product.
          </p>
          <button
            className="btn btn-outline"
            onClick={() => router.push("/HomePage")}
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product) addToCart(product, quantity);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button
          className="btn btn-ghost mb-8 pl-0 gap-2"
          onClick={() => router.back()}
        >
          <ChevronLeft size={18} />
          Back
        </button>

        {/* Main content */}
        <div className="space-y-10">
          {/* Image */}
          <div className="rounded-xl overflow-hidden border border-base-200 shadow-sm">
            <div className="relative aspect-square">
              <Image
                src={product.images?.[0] || "/placeholder-image.png"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="badge badge-outline mb-2">{product.category.name}</div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="rating rating-sm">
                {Array.from({ length: 5 }, (_, i) => (
                  <input
                    key={i}
                    type="radio"
                    name="rating"
                    className="mask mask-star bg-amber-400"
                    defaultChecked={
                      !!product.rating && i < Math.floor(product.rating)
                    }
                    readOnly
                  />
                ))}
              </div>
              {product.reviews != null && (
                <span className="text-sm opacity-70">({product.reviews})</span>
              )}
            </div>

            <div className="text-4xl font-bold text-primary">
              GH₵{product.price.toFixed(2)}
              {product.discount_price && (
                <span className="text-xl opacity-60 line-through ml-3">
                  GH₵{product.discount_price.toFixed(2)}
                </span>
              )}
            </div>

            <div
              className={`text-lg ${product.stock_quantity > 0 ? "text-success" : "text-error"}`}
            >
              {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
              {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
                <span className="ml-2 text-sm opacity-70">
                  (Only {product.stock_quantity} left)
                </span>
              )}
            </div>

            {/* Quantity + Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="join w-full sm:w-48">
                <button
                  className="btn join-item"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <div className="btn join-item pointer-events-none w-16 text-lg">
                  {quantity}
                </div>
                <button
                  className="btn join-item"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-primary flex-1 gap-2"
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="pt-8 border-t">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-base-content/80 leading-relaxed">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Specs */}
          {(product.tags?.length > 0 || product.category) && (
            <div className="pt-8 border-t">
              <h2 className="text-xl font-bold mb-4">Details</h2>
              <div className="space-y-3 text-base-content/80">
                <div>
                  <span className="font-medium">Category:</span>{" "}
                  {product.category.name}
                </div>
                {product.tags?.length > 0 && (
                  <div>
                    <span className="font-medium">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.tags.map((tag) => (
                        <div key={tag} className="badge badge-neutral">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="card bg-base-100 shadow hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/product/${p.id}`)}
                >
                  <figure className="relative aspect-square">
                    <Image
                      src={p.images?.[0] || "/placeholder-image.png"}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  </figure>
                  <div className="card-body p-4">
                    <h3 className="font-medium line-clamp-2">{p.name}</h3>
                    <div className="text-lg font-bold text-primary mt-1">
                      GH₵{p.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
