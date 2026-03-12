"use client";
import { useState } from "react";
import { Trash2, ShoppingBag, PlusCircle, MinusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContent";
import Link from "next/link";
import { useAuth } from "@/app/auth/AuthContext";
import { useToast } from "@/app/context/ToastContext";

const CartPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } =
    useCart();
  const [couponCode, setCouponCode] = useState("");
  const { showToast } = useToast();

  // Simplified for demo - in a real app would validate and apply coupon code
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    // Apply coupon logic would go here
  };
  const handleCheckout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user) {
      showToast(
        "Authentication Required",
        "warning",
        "Please sign in to check out",
      );
      return;
    }
    router.push("/CheckoutPage");
  };

  if (cart.length === 0) {
    return (
      <div className="container min-h-[70vh] py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="mb-8">
          Looks like you haven't added any products to your cart yet.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => router.push("/HomePage")}
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.07; // 7% tax for demo
  const total = subtotal + shipping + tax;

  return (
    <div className="container px-20">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="py-4 px-6 text-left">Product</th>
                  <th className="py-4 px-6 text-center">Quantity</th>
                  <th className="py-4 px-6 text-right">Price</th>
                  <th className="py-4 px-6 text-right">Total</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <tr key={item.product.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-16 w-16 object-cover rounded-md mr-4"
                        />
                        <div>
                          <Link
                            href={`/product/${item.product.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {item.product.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MinusCircle className="h-4 w-4" />
                        </button>
                        <span className="mx-3">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stockCount}
                          className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PlusCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      GH₵{item.product.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium">
                      GH₵{(item.product.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 rounded-full hover:bg-gray-200 text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              className="btn btn-outline"
              onClick={() => router.push("/")}
            >
              Continue Shopping
            </button>
            <button
              onClick={clearCart}
              className="text-red-500 hover:bg-red-50 btn btn-outline"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="mb-6">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <button type="submit" className="btn btn-outline">
                  Apply
                </button>
              </form>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>GH₵{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>
                  {shipping === 0 ? "Free" : `GH₵${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span>GH₵{tax.toFixed(2)}</span>
              </div>

              <div className="my-3" />

              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>GH₵{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="w-full mt-6 btn btn-primary"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
          </div>

          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Our customer service team is here to help you with any questions
              about your order.
            </p>
            <div className="text-sm space-y-2">
              <p>
                <span className="font-medium">Email:</span>{" "}
                <a
                  href="mailto:support@retailrift.com"
                  className="text-primary hover:underline"
                >
                  support@retailrift.com
                </a>
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                <a
                  href="tel:+18001234567"
                  className="text-primary hover:underline"
                >
                  1-800-123-4567
                </a>
              </p>
              <p>
                <span className="font-medium">Hours:</span>{" "}
                <span>Mon-Fri, 9am-5pm</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
