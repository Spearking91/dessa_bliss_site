"use client";
import React, { useState, useEffect } from "react";
import { allProducts, colorOptions } from "@/app/data/products";
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

type Product = (typeof allProducts)[0];

interface DetailedProduct extends Omit<
  Product,
  "image" | "colors" | "reviews"
> {
  subtitle: string;
  originalPrice: number;
  discount: number;
  inStock: boolean;
  stockCount: number;
  sku: string;
  images: string[];
  description: string;
  features: string[];
  specs: Record<string, string>;
  colors: { name: string; hex: string; available: boolean }[];
  sizes: string[];
  reviews: {
    id: number;
    username: string;
    rating: number;
    date: string;
    comment: string;
  }[];
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [product, setProduct] = useState<DetailedProduct | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleBuyNow = () => {
    if (!product) return;
    const params = new URLSearchParams();
    params.append("name", product.name);
    params.append("price", product.price.toString());
    params.append("image", product.images[0]);
    params.append("size", selectedSize);
    if (selectedColor) params.append("color", selectedColor);
    params.append("quantity", quantity.toString());

    router.push(`/PaymentPage?${params.toString()}`);
  };

  useEffect(() => {
    if (id) {
      const foundProduct = allProducts.find((p) => p.id.toString() === id);
      if (foundProduct) {
        // The product data from `allProducts` is simple. We augment it here
        // to match the detailed structure this component expects.
        const detailedProduct: DetailedProduct = {
          ...foundProduct,
          subtitle: "Premium Quality Item",
          originalPrice: Math.round(foundProduct.price * 1.25),
          discount: 20,
          inStock: true,
          stockCount: Math.floor(Math.random() * 50) + 10,
          sku: `DB-${foundProduct.category.slice(0, 3).toUpperCase()}-${
            foundProduct.id
          }`,
          images: [
            foundProduct.image,
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=1000&fit=crop",
          ],
          description: `Discover the exceptional quality of the ${foundProduct.name}. Crafted with the finest materials and designed for modern life, this ${foundProduct.category.toLowerCase()} item is a must-have.`,
          features: [
            "Premium materials",
            "Modern, minimalist design",
            "Durable and long-lasting",
            "Versatile for any occasion",
          ],
          specs: {
            Category: foundProduct.category,
            Weight: "300g",
            Materials: "Varies by product",
          },
          colors: foundProduct.colors.map((colorName) => {
            const colorInfo = colorOptions.find((c) => c.value === colorName);
            return {
              name: colorInfo
                ? colorInfo.name
                : colorName.charAt(0).toUpperCase() + colorName.slice(1),
              hex: colorInfo ? colorInfo.hex : "#CCCCCC",
              available: true,
            };
          }),
          sizes: ["S", "M", "L", "XL"],
          reviews: [
            {
              id: 1,
              username: "Sarah M.",
              rating: 5,
              date: "Jan 15, 2026",
              comment:
                "Best headphones I've ever owned. The sound quality is incredible!",
            },
            {
              id: 2,
              username: "Alex K.",
              rating: 4,
              date: "Jan 10, 2026",
              comment: "Worth every penny. ANC works perfectly on flights.",
            },
          ],
        };
        setProduct(detailedProduct);
        if (detailedProduct.colors.length > 0) {
          setSelectedColor(detailedProduct.colors[0].name);
        }
      }
    }
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F0F0F] via-[#1a1a1a] to-[#0F0F0F] text-white flex items-center justify-center">
        Loading product...
      </div>
    );
  }

  const handlePrevImage = () =>
    setActiveImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  const handleNextImage = () =>
    setActiveImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1,
    );
  const handleAddToCart = () => {
    if (product) addToCart(product, quantity);
    showToast("Item added to cart successfully", "success");
  };
  const incrementQuantity = () => {
    if (quantity < product.stockCount) setQuantity((prev) => prev + 1);
  };
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

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
          <div className="relative aspect-square overflow-hidden border border-border rounded-lg">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-background rounded-full shadow-md"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-background rounded-full shadow-md"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-16 h-16 flex-shrink-0 border-2 rounded ${activeImage === index ? "border-primary" : "border-transparent"}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="bagde badge-outline mb-2">{product.category}</span>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.reviews.length} reviews
            </span>
          </div>
          <div className="mb-6">
            <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
            <div className="flex items-center mt-1 text-green-600">
              <Check className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {product.stockCount > 0
                  ? `In Stock (${product.stockCount} available)`
                  : "Out of Stock"}
              </span>
            </div>
          </div>
          <div className="border-t border-border py-6">
            <div className="mb-6">
              <h2 className="font-medium mb-2">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <span className={"badge badge-secondary"} key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
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
                  disabled={quantity >= product.stockCount}
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stockCount === 0}
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
            Reviews ({product.reviews.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="py-4">
          <div className="prose prose-gray max-w-none">
            <p>{product.description}</p>
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
            {product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{review.username}</p>
                      <div className="flex items-center gap-2 my-1">
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">
                No reviews yet. Be the first to write a review!
              </p>
            )}
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
                    src={p.image}
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
