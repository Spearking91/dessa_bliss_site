"use client";
import { use, useState, useEffect } from "react";
import {
  ShoppingCart,
  Star,
  Check,
  ChevronLeft,
  Heart,
  Truck,
  ShieldCheck,
} from "lucide-react";
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
          await getRelatedProducts(productData.category, productData.id, 6);

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
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
          <p className="text-base-content/70 mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            className="btn btn-primary btn-lg"
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

  const cartTotal = product.price * quantity;

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100">
      {/* Hero Banner */}
      <div className="relative h-[60vh] lg:h-[75vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/60 to-transparent z-10" />
        <Image
          src={product.images?.[0] || "/placeholder-image.png"}
          alt={product.name}
          fill
          className="object-cover brightness-90"
          priority
        />
        <div className="absolute inset-0 z-20 flex items-end pb-12 px-4 sm:px-8 lg:px-16">
          <div className="max-w-5xl w-full">
            <div className="badge badge-outline badge-lg mb-4">
              {product.category}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-base-content">
              {product.name}
            </h1>
            <div className="flex items-center gap-5 text-lg">
              <div className="rating rating-md">
                {Array.from({ length: 5 }, (_, i) => (
                  <input
                    key={i}
                    type="radio"
                    name="rating"
                    className="mask mask-star-2 bg-amber-400"
                    defaultChecked={
                      !!product.rating && i < Math.floor(product.rating)
                    }
                    readOnly
                  />
                ))}
              </div>
              {product.reviews != null && (
                <span className="opacity-80">({product.reviews} reviews)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-16 lg:-mt-24 z-30 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-32 max-w-7xl mx-auto">
        <div className="card bg-base-100 shadow-2xl rounded-3xl overflow-hidden">
          <div className="card-body p-6 lg:p-12">
            {/* Price & Stock */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
              <div>
                <div className="text-5xl lg:text-6xl font-black text-primary mb-2">
                  GH₵{product.price.toFixed(2)}
                </div>
                {product.discount_price && (
                  <div className="text-2xl opacity-60 line-through">
                    GH₵{product.discount_price.toFixed(2)}
                  </div>
                )}
              </div>

              <div
                className={`badge badge-lg gap-2 px-5 py-4 text-base font-semibold ${
                  product.stock_quantity > 0 ? "badge-success" : "badge-error"
                }`}
              >
                {product.stock_quantity > 0 ? <Check size={18} /> : null}
                {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
                  <span className="ml-1">
                    (Only {product.stock_quantity} left)
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Quantity</span>
                </label>
                <div className="join w-full">
                  <button
                    className="btn join-item btn-lg"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <div className="btn btn-lg join-item pointer-events-none min-w-[6rem] text-xl font-bold">
                    {quantity}
                  </div>
                  <button
                    className="btn join-item btn-lg"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock_quantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-primary btn-lg col-span-2 gap-3"
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart size={20} />
                Add to Cart • GH₵{cartTotal.toFixed(2)}
              </button>
            </div>

            {/* Features / Trust */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="flex items-start gap-4">
                <Truck className="text-success shrink-0 mt-1" size={28} />
                <div>
                  <h4 className="font-semibold mb-1">Fast Delivery</h4>
                  <p className="text-sm opacity-70">
                    Free on orders over GH₵200
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-success shrink-0 mt-1" size={28} />
                <div>
                  <h4 className="font-semibold mb-1">Secure Payment</h4>
                  <p className="text-sm opacity-70">Protected by Paystack</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Heart className="text-error shrink-0 mt-1" size={28} />
                <div>
                  <h4 className="font-semibold mb-1">Wishlist</h4>
                  <p className="text-sm opacity-70">Save for later</p>
                </div>
              </div>
            </div>

            {/* Accordion Sections */}
            <div className="join join-vertical w-full">
              <div className="collapse collapse-arrow join-item border border-base-300">
                <input type="radio" name="accordion" defaultChecked />
                <div className="collapse-title text-xl font-medium">
                  Description
                </div>
                <div className="collapse-content">
                  <div className="prose max-w-none pt-4">
                    <p>
                      {product.description ||
                        "No detailed description available."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="collapse collapse-arrow join-item border border-base-300 border-t-0">
                <input type="radio" name="accordion" />
                <div className="collapse-title text-xl font-medium">
                  Specifications
                </div>
                <div className="collapse-content">
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between py-2 border-b border-base-200">
                      <span className="font-medium">Category</span>
                      <span>{product.category}</span>
                    </div>
                    {product.tags?.length > 0 && (
                      <div className="py-2">
                        <span className="font-medium block mb-2">Tags</span>
                        <div className="flex flex-wrap gap-2">
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
              </div>

              <div className="collapse collapse-arrow join-item border border-base-300 border-t-0 rounded-b-2xl">
                <input type="radio" name="accordion" />
                <div className="collapse-title text-xl font-medium">
                  Reviews
                </div>
                <div className="collapse-content">
                  <div className="text-center py-12 opacity-70">
                    <p className="text-xl">No customer reviews yet</p>
                    <p className="mt-3">Be the first to review this product!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products - Horizontal Scroll */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <h2 className="text-2xl lg:text-3xl font-bold mb-8 text-center lg:text-left">
              You May Also Like
            </h2>

            <div className="carousel carousel-center w-full space-x-6 lg:space-x-8 p-4 -mx-4">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="carousel-item w-72 lg:w-80"
                  onClick={() => router.push(`/product/${p.id}`)}
                >
                  <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full">
                    <figure className="relative aspect-square overflow-hidden">
                      <Image
                        src={p.images?.[0] || "/placeholder-image.png"}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </figure>
                    <div className="card-body p-5">
                      <h3 className="card-title text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                      <div className="text-xl font-bold text-primary mt-1">
                        GH₵{p.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating mobile action button */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <div className="dropdown dropdown-top dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-primary btn-circle btn-lg shadow-2xl"
          >
            <ShoppingCart size={28} />
          </label>
          <div
            tabIndex={0}
            className="dropdown-content menu p-4 shadow-2xl bg-base-100 rounded-box w-80 mb-4"
          >
            <div className="space-y-4">
              <div className="text-xl font-bold">{product.name}</div>
              <div className="text-2xl font-black text-primary">
                GH₵{cartTotal.toFixed(2)}
              </div>

              <div className="join w-full">
                <button
                  className="btn join-item"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <div className="btn join-item pointer-events-none min-w-[4rem]">
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
                className="btn btn-primary w-full"
                disabled={product.stock_quantity === 0}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
