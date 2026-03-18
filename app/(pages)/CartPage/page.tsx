// "use client";
// import { useState } from "react";
// import { Trash2, ShoppingBag, PlusCircle, MinusCircle } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useCart } from "@/app/context/CartContent";
// import Link from "next/link";
// import { useAuth } from "@/app/auth/AuthContext";
// import { useToast } from "@/app/context/ToastContext";

// const CartPage = () => {
//   const router = useRouter();
//   const { user } = useAuth();
//   const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } =
//     useCart();
//   const [couponCode, setCouponCode] = useState("");
//   const { showToast } = useToast();

//   // Simplified for demo - in a real app would validate and apply coupon code
//   const handleApplyCoupon = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Apply coupon logic would go here
//   };
//   const handleCheckout = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     if (!user) {
//       showToast(
//         "Authentication Required",
//         "warning",
//         "Please sign in to check out",
//       );
//       return;
//     }
//     router.push("/CheckoutPage");
//   };

//   if (cart.length === 0) {
//     return (
//       <div className="container min-h-[70vh] py-16 text-center">
//         <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
//         <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
//         <p className="mb-8">
//           Looks like you haven't added any products to your cart yet.
//         </p>
//         <button
//           className="btn btn-primary"
//           onClick={() => router.push("/HomePage")}
//         >
//           Start Shopping
//         </button>
//       </div>
//     );
//   }

//   const subtotal = getCartTotal();
//   const shipping = subtotal > 100 ? 0 : 10;
//   const tax = subtotal * 0.07; // 7% tax for demo
//   const total = subtotal + shipping + tax;

//   return (
//     <div className="container px-20">
//       <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//             <table className="w-full">
//               <thead className="bg-gray-50 text-gray-600 text-sm">
//                 <tr>
//                   <th className="py-4 px-6 text-left">Product</th>
//                   <th className="py-4 px-6 text-center">Quantity</th>
//                   <th className="py-4 px-6 text-right">Price</th>
//                   <th className="py-4 px-6 text-right">Total</th>
//                   <th className="py-4 px-6 text-center">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {cart.map((item) => (
//                   <tr key={item.product.id} className="hover:bg-gray-50">
//                     <td className="py-4 px-6">
//                       <div className="flex items-center">
//                         <Image
//                           // src={item.product.images[0]}
//                           src={item.product.image || "/logo2.png"}
//                           alt={item.product.name}
//                           className="h-16 w-16 object-cover rounded-md mr-4"
//                         />
//                         <div>
//                           <Link
//                             href={`/product/${item.product.id}`}
//                             className="font-medium hover:text-primary"
//                           >
//                             {item.product.name}
//                           </Link>
//                           <p className="text-sm text-gray-500">
//                             {item.product.category}
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="flex items-center justify-center">
//                         <button
//                           onClick={() =>
//                             updateQuantity(item.product.id, item.quantity - 1)
//                           }
//                           disabled={item.quantity <= 1}
//                           className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           <MinusCircle className="h-4 w-4" />
//                         </button>
//                         <span className="mx-3">{item.quantity}</span>
//                         <button
//                           onClick={() =>
//                             updateQuantity(item.product.id, item.quantity + 1)
//                           }
//                           disabled={item.quantity >= item.product.stock}
//                           className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           <PlusCircle className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6 text-right">
//                       GH₵{item.product.price.toFixed(2)}
//                     </td>
//                     <td className="py-4 px-6 text-right font-medium">
//                       GH₵{(item.product.price * item.quantity).toFixed(2)}
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="flex justify-center">
//                         <button
//                           onClick={() => removeFromCart(item.product.id)}
//                           className="p-1 rounded-full hover:bg-gray-200 text-red-500"
//                         >
//                           <Trash2 className="h-5 w-5" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex justify-between items-center mt-6">
//             <button
//               className="btn btn-outline"
//               onClick={() => router.push("/")}
//             >
//               Continue Shopping
//             </button>
//             <button
//               onClick={clearCart}
//               className="text-red-500 hover:bg-red-50 btn btn-outline"
//             >
//               Clear Cart
//             </button>
//           </div>
//         </div>

//         <div>
//           <div className="bg-white rounded-lg border border-gray-200 p-6">
//             <h2 className="text-xl font-bold mb-4">Order Summary</h2>

//             <div className="mb-6">
//               <form onSubmit={handleApplyCoupon} className="flex gap-2">
//                 <input
//                   type="text"
//                   value={couponCode}
//                   onChange={(e) => setCouponCode(e.target.value)}
//                   placeholder="Coupon code"
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//                 />
//                 <button type="submit" className="btn btn-outline">
//                   Apply
//                 </button>
//               </form>
//             </div>

//             <div className="space-y-3 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Subtotal</span>
//                 <span>GH₵{subtotal.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Shipping</span>
//                 <span>
//                   {shipping === 0 ? "Free" : `GH₵${shipping.toFixed(2)}`}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Tax</span>
//                 <span>GH₵{tax.toFixed(2)}</span>
//               </div>

//               <div className="my-3" />

//               <div className="flex justify-between font-bold text-base">
//                 <span>Total</span>
//                 <span>GH₵{total.toFixed(2)}</span>
//               </div>
//             </div>

//             <button
//               className="w-full mt-6 btn btn-primary"
//               onClick={handleCheckout}
//             >
//               Proceed to Checkout
//             </button>
//           </div>

//           <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
//             <h3 className="font-semibold mb-2">Need Help?</h3>
//             <p className="text-sm text-gray-600 mb-4">
//               Our customer service team is here to help you with any questions
//               about your order.
//             </p>
//             <div className="text-sm space-y-2">
//               <p>
//                 <span className="font-medium">Email:</span>{" "}
//                 <a
//                   href="mailto:support@retailrift.com"
//                   className="text-primary hover:underline"
//                 >
//                   support@retailrift.com
//                 </a>
//               </p>
//               <p>
//                 <span className="font-medium">Phone:</span>{" "}
//                 <a
//                   href="tel:+18001234567"
//                   className="text-primary hover:underline"
//                 >
//                   1-800-123-4567
//                 </a>
//               </p>
//               <p>
//                 <span className="font-medium">Hours:</span>{" "}
//                 <span>Mon-Fri, 9am-5pm</span>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartPage;

"use client";
import { useState } from "react";
import {
  Trash2,
  ShoppingBag,
  PlusCircle,
  MinusCircle,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContent";
import Link from "next/link";
import { useAuth } from "@/app/auth/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import Image from "next/image";

const CartPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } =
    useCart();
  const [couponCode, setCouponCode] = useState("");
  const { showToast } = useToast();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    // Coupon logic remains unchanged (currently placeholder)
    showToast("Coupon", "info", "Coupon feature coming soon");
  };

  const handleCheckout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user) {
      showToast(
        "Authentication Required",
        "warning",
        "Please sign in to checkout",
      );
      return;
    }
    router.push("/CheckoutPage");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="bg-base-200 rounded-full p-8 mb-6">
          <ShoppingBag className="h-16 w-16 text-base-content/40" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-base-content/70 mb-8 max-w-md">
          Looks like you have not added anything yet. Let us find something you
          will love!
        </p>
        <button
          className="btn btn-primary btn-lg gap-2"
          onClick={() => router.push("/HomePage")}
        >
          <ArrowLeft size={18} />
          Start Shopping
        </button>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.07;
  const total = subtotal + shipping + tax;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl">
      <h1 className="text-3xl lg:text-4xl font-bold mb-8 lg:mb-10">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table table-auto w-full">
                  <thead>
                    <tr className="bg-base-200/50">
                      <th className="py-4 px-4 lg:px-6 text-left">Product</th>
                      <th className="py-4 px-4 text-center hidden sm:table-cell">
                        Quantity
                      </th>
                      <th className="py-4 px-4 text-right hidden md:table-cell">
                        Price
                      </th>
                      <th className="py-4 px-4 text-right">Total</th>
                      <th className="py-4 px-4 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200">
                    {cart.map((item) => (
                      <tr
                        key={item.product.id}
                        className="hover:bg-base-200/30 transition-colors"
                      >
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="avatar">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-base-200">
                                <Image
                                  src={item.product.image || "/logo2.png"}
                                  alt={item.product.name}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <div>
                              <Link
                                href={`/product/${item.product.id}`}
                                className="font-medium hover:text-primary transition-colors line-clamp-2"
                              >
                                {item.product.name}
                              </Link>
                              <div className="text-xs opacity-70 mt-1">
                                {item.product.category}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center hidden sm:table-cell">
                          <div className="join">
                            <button
                              className="btn btn-sm join-item"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              <MinusCircle size={16} />
                            </button>
                            <button className="btn btn-sm join-item no-animation pointer-events-none min-w-[3rem]">
                              {item.quantity}
                            </button>
                            <button
                              className="btn btn-sm join-item"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                )
                              }
                              disabled={
                                item.quantity >= (item.product.stock ?? 999)
                              }
                            >
                              <PlusCircle size={16} />
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right font-medium hidden md:table-cell">
                          GH₵{item.product.price.toFixed(2)}
                        </td>

                        <td className="py-4 px-4 text-right font-semibold">
                          GH₵{(item.product.price * item.quantity).toFixed(2)}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <button
              className="btn btn-outline gap-2"
              onClick={() => router.push("/")}
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </button>
            <button
              className="btn btn-outline text-error hover:bg-error/10"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl">Order Summary</h2>

              <div className="my-4">
                <form onSubmit={handleApplyCoupon} className="join w-full">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="input input-bordered join-item flex-1"
                  />
                  <button type="submit" className="btn join-item">
                    Apply
                  </button>
                </form>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-70">Subtotal</span>
                  <span>GH₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Shipping</span>
                  <span className={shipping === 0 ? "text-success" : ""}>
                    {shipping === 0 ? "Free" : `GH₵${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Tax (7%)</span>
                  <span>GH₵{tax.toFixed(2)}</span>
                </div>

                <div className="divider my-4"></div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>GH₵{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary w-full mt-6"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>

          {/* Help Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="font-semibold text-lg">Need Help?</h3>
              <p className="text-sm opacity-70 mt-1 mb-4">
                Our support team is ready to assist you with any questions.
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Email: </span>
                  <a
                    href="mailto:support@retailrift.com"
                    className="link link-primary"
                  >
                    support@retailrift.com
                  </a>
                </div>
                <div>
                  <span className="font-medium">Phone: </span>
                  <a href="tel:+18001234567" className="link link-primary">
                    1-800-123-4567
                  </a>
                </div>
                <div>
                  <span className="font-medium">Hours: </span>
                  <span>Mon–Fri, 9am–5pm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
