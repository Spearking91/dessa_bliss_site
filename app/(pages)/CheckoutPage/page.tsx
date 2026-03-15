// "use client";
// import { useState } from "react";
// import { CreditCard, Building, Apple, LockIcon, Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useCart } from "@/app/context/CartContent";

// import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
// import { useToast } from "@/app/context/ToastContext";
// import { useAuth } from "@/app/auth/AuthContext";
// import { supabase } from "@/utils/supabase/supabase_client";
// import { usePaystackPayment } from "react-paystack";

// type AddressFormData = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
// };

// type PaymentMethod = "credit-card" | "paypal" | "apple-pay";

// const CheckoutPage = () => {
//   const router = useRouter();
//   const { cart, getCartTotal, clearCart } = useCart();
//   const { showToast } = useToast();
//   const { user } = useAuth();

//   const [addressData, setAddressData] = useState<AddressFormData>({
//     firstName: "",
//     lastName: "",
//     email: user?.email || "",
//     phone: "",
//     address: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     country: "Ghana",
//   });

//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("credit-card");
//   const [billingIsSameAsShipping, setBillingIsSameAsShipping] = useState(true);
//   const [isProcessing, setIsProcessing] = useState(false);

//   const handleAddressChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
//   ) => {
//     const { name, value } = e.target;
//     setAddressData((prev) => ({ ...prev, [name]: value }));
//   };

//   const subtotal = getCartTotal();
//   const shipping = subtotal > 100 ? 0 : 10;
//   const tax = subtotal * 0.07; // 7% tax for demo
//   const total = subtotal + shipping + tax;

//   const verifyOnServer = async (ref: string) => {
//     try {
//       const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//       if (!supabaseUrl) {
//         throw new Error("Supabase URL is not configured.");
//       }

//       const res = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ reference: ref }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.verified) {
//         throw new Error(data.error || "Payment verification failed on server.");
//       }
//       return true;
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error
//           ? error.message
//           : "An unknown verification error occurred.";
//       showToast(errorMessage, "error");
//       console.error("Verification Error:", error);
//       return false;
//     }
//   };

//   const initializePayment = usePaystackPayment({
//     publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
//     email: addressData.email, // This will be overridden
//     currency: "GHS",
//     amount: Math.round(total * 100),
//     reference: "", // This will be overridden
//   });

//   const handleFinalizeOrder = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsProcessing(true);

//     const requiredFields: (keyof AddressFormData)[] = [
//       "firstName",
//       "lastName",
//       "email",
//       "address",
//       "city",
//       "state",
//       "zipCode",
//       "country",
//       "phone",
//     ];
//     const missingFields = requiredFields.filter((field) => !addressData[field]);

//     if (missingFields.length > 0) {
//       showToast(
//         "Missing information",
//         "error",
//         `Please fill in all required fields: ${missingFields.join(", ")}`,
//       );
//       setIsProcessing(false);
//       return;
//     }

//     const reference = `dessa_${Math.random().toString(36).substring(2)}`;
//     const { error: insertError } = await supabase.from("payments").insert({
//       user_id: user?.id,
//       amount: total,
//       reference: reference,
//       status: "pending",
//       metadata: {
//         cart,
//         shipping_address: addressData,
//       },
//     });

//     if (insertError) {
//       showToast(
//         "Database error",
//         "error",
//         "Could not create payment record. Please try again.",
//       );
//       console.error("Supabase insert error:", insertError);
//       setIsProcessing(false);
//       return;
//     }

//     // const onSuccess = async (paystackResponse: { reference: string }) => {
//     //   showToast("Payment successful, verifying...", "info");
//     //   const isVerified = await verifyOnServer(paystackResponse.reference);

//     //   if (isVerified) {
//     //     showToast("Payment Verified and Order Completed!", "success");
//     //     clearCart();
//     //     // Redirect to the order confirmation page with the payment reference
//     //     router.push(`/order-confirmation?ref=${paystackResponse.reference}`);
//     //   } else {
//     //     showToast(
//     //       "Payment verification failed.",
//     //       "error",
//     //       "Please contact support with your payment reference.",
//     //     );
//     //   }
//     //   setIsProcessing(false);
//     // };

//     // const onClose = () => {
//     //   showToast("Payment window closed.", "warning");
//     //   setIsProcessing(false);
//     // };

//     // ...
//     const onSuccess = async (paystackResponse: { reference: string }) => {
//       showToast("Payment successful, verifying...", "info");
//       // 1. This function is called...
//       const isVerified = await verifyOnServer(paystackResponse.reference);

//       // 2. The redirect ONLY happens if isVerified is true.
//       if (isVerified) {
//         showToast("Payment Verified and Order Completed!", "success");
//         clearCart();
//         router.push(`/order-confirmation?ref=${paystackResponse.reference}`); // <-- The redirect
//       } else {
//         // 3. If verification fails, this block runs instead, and no redirect occurs.
//         showToast(
//           "Payment verification failed.",
//           "error",
//           "Please contact support with your payment reference.",
//         );
//       }
//       setIsProcessing(false);
//     };
//     // ...
//     const onClose = () => {
//       showToast("Payment window closed.", "warning");
//       setIsProcessing(false);
//     };

//     initializePayment({
//       onSuccess,
//       onClose,
//       reference,
//       email: addressData.email,
//       amount: Math.round(total * 100),
//     });
//   };

//   if (cart.length === 0 && !isProcessing) {
//     if (typeof window !== "undefined") {
//       router.push("/CartPage");
//     }
//     return (
//       <div className="container min-h-[70vh] py-16 text-center">
//         <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
//         <p className="mb-8">Redirecting you to your cart...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container px-20">
//       <h1 className="text-3xl font-bold mb-8">Checkout</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2">
//           <form onSubmit={handleFinalizeOrder} className="space-y-8">
//             {/* Shipping Information */}
//             <div>
//               <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
//               <div className="bg-white rounded-lg border border-gray-200 p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label htmlFor="firstName">First Name *</label>
//                     <input
//                       id="firstName"
//                       name="firstName"
//                       value={addressData.firstName}
//                       onChange={handleAddressChange}
//                       className="input w-full"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="lastName">Last Name *</label>
//                     <input
//                       id="lastName"
//                       name="lastName"
//                       value={addressData.lastName}
//                       onChange={handleAddressChange}
//                       className="input w-full"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="email">Email *</label>
//                     <input
//                       id="email"
//                       name="email"
//                       type="email"
//                       value={addressData.email}
//                       onChange={handleAddressChange}
//                       className="input w-full"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="phone">Phone *</label>
//                     <input
//                       id="phone"
//                       name="phone"
//                       type="tel"
//                       value={addressData.phone}
//                       onChange={handleAddressChange}
//                       className="input w-full"
//                       required
//                     />
//                   </div>
//                   <div className="md:col-span-2">
//                     <label htmlFor="address">Address *</label>
//                     <input
//                       id="address"
//                       name="address"
//                       value={addressData.address}
//                       onChange={handleAddressChange}
//                       className="input w-full"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="city">City *</label>
//                     <input
//                       id="city"
//                       name="city"
//                       value={addressData.city}
//                       onChange={handleAddressChange}
//                       className="input w-full"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="state">State/Province *</label>
//                     <input
//                       id="state"
//                       name="state"
//                       value={addressData.state}
//                       onChange={handleAddressChange}
//                       className="input w-full"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="zipCode">Zip/Postal Code *</label>
//                     <input
//                       id="zipCode"
//                       name="zipCode"
//                       value={addressData.zipCode}
//                       onChange={handleAddressChange}
//                       className="input w-full"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="country">Country *</label>
//                     <select
//                       id="country"
//                       name="country"
//                       value={addressData.country}
//                       onChange={handleAddressChange}
//                       className="w-full border border-gray-300 rounded-md px-3 py-2 bg-base-100"
//                       required
//                     >
//                       <option value="Ghana">Ghana</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Payment Information */}
//             <div>
//               <h2 className="text-xl font-bold mb-4">Payment Method</h2>
//               <div className="bg-white rounded-lg border border-gray-200 p-6">
//                 <RadioGroup
//                   value={paymentMethod}
//                   onValueChange={(value) =>
//                     setPaymentMethod(value as PaymentMethod)
//                   }
//                   className="space-y-4"
//                 >
//                   <div className="flex items-center space-x-2 rounded-lg border border-gray-200 p-4">
//                     <RadioGroupItem
//                       value="credit-card"
//                       id="payment-credit-card"
//                     />
//                     <label
//                       htmlFor="payment-credit-card"
//                       className="flex items-center"
//                     >
//                       <CreditCard className="mr-2 h-4 w-4" />
//                       Pay with Card / Mobile Money
//                     </label>
//                   </div>
//                 </RadioGroup>

//                 <div className="mt-6">
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       id="billing-same"
//                       checked={billingIsSameAsShipping}
//                       onChange={() =>
//                         setBillingIsSameAsShipping(!billingIsSameAsShipping)
//                       }
//                       className="rounded border-gray-300"
//                     />
//                     <label htmlFor="billing-same">
//                       Billing address is the same as shipping address
//                     </label>
//                   </div>
//                 </div>

//                 {!billingIsSameAsShipping && (
//                   <div className="mt-6 border-t border-gray-200 pt-6">
//                     <h3 className="text-lg font-semibold mb-4">
//                       Billing Address
//                     </h3>
//                     <p className="text-gray-500 mb-4">
//                       Please enter your billing address information.
//                     </p>
//                     {/* Billing address form fields would go here - simplified for demo */}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Review & Submit */}
//             <div>
//               <h2 className="text-xl font-bold mb-4">Review Order</h2>
//               <div className="bg-white rounded-lg border border-gray-200 p-6">
//                 <div className="divide-y divide-gray-200">
//                   {cart.map((item) => (
//                     <div
//                       key={item.product.id}
//                       className="py-4 flex justify-between"
//                     >
//                       <div className="flex">
//                         <img
//                           src={item.product.image || "/placeholder-image.png"}
//                           alt={item.product.name}
//                           className="h-16 w-16 object-cover rounded-md mr-4"
//                         />
//                         <div>
//                           <p className="font-medium">{item.product.name}</p>
//                           <p className="text-sm text-gray-500">
//                             Qty: {item.quantity}
//                           </p>
//                         </div>
//                       </div>
//                       <p className="font-medium">
//                         GH₵{(item.product.price * item.quantity).toFixed(2)}
//                       </p>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="my-4 w-1" />

//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Subtotal</span>
//                     <span>GH₵{subtotal.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Shipping</span>
//                     <span>
//                       {shipping === 0 ? "Free" : `GH₵${shipping.toFixed(2)}`}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Tax</span>
//                     <span>GH₵{tax.toFixed(2)}</span>
//                   </div>
//                   {/* <Separator className="my-2" /> */}
//                   <div className="flex justify-between font-bold text-base">
//                     <span>Total</span>
//                     <span>GH₵{total.toFixed(2)}</span>
//                   </div>
//                 </div>

//                 <div className="mt-6 flex flex-col space-y-4">
//                   <div className="flex items-center text-sm text-gray-500">
//                     <LockIcon className="h-4 w-4 mr-2" />
//                     Your payment information is encrypted and secure.
//                   </div>

//                   <button
//                     type="submit"
//                     className="btn btn-primary w-full"
//                     disabled={isProcessing}
//                   >
//                     {isProcessing ? (
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     ) : null}
//                     {isProcessing
//                       ? "Processing..."
//                       : `Pay GH₵${total.toFixed(2)}`}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </form>
//         </div>

//         <div>
//           <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
//             <h2 className="text-xl font-bold mb-4">Order Summary</h2>
//             <div className="space-y-4">
//               {cart.map((item) => (
//                 <div key={item.product.id} className="flex justify-between">
//                   <div className="flex">
//                     <span className="text-gray-600">{item.quantity}x</span>
//                     <span className="ml-2 truncate">{item.product.name}</span>
//                   </div>
//                   <span className="font-medium">
//                     GH₵{(item.product.price * item.quantity).toFixed(2)}
//                   </span>
//                 </div>
//               ))}

//               {/* <Separator /> */}

//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Subtotal</span>
//                   <span>GH₵{subtotal.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Shipping</span>
//                   <span>
//                     {shipping === 0 ? "Free" : `GH₵${shipping.toFixed(2)}`}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Tax</span>
//                   <span>GH₵{tax.toFixed(2)}</span>
//                 </div>
//               </div>

//               {/* <Separator /> */}

//               <div className="flex justify-between font-bold">
//                 <span>Total</span>
//                 <span>GH₵{total.toFixed(2)}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;

"use client";
import { useState, useEffect } from "react";
import {
  CreditCard,
  Lock,
  Loader2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContent";
import { useToast } from "@/app/context/ToastContext";
import { useAuth } from "@/app/auth/AuthContext";
import { supabase } from "@/utils/supabase/supabase_client";
import { usePaystackPayment } from "react-paystack";

type AddressFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

type PaymentMethod = "credit-card" | "paypal" | "apple-pay";

const CheckoutPage = () => {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [addressData, setAddressData] = useState<AddressFormData>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Ghana",
  });

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("credit-card");
  const [billingIsSameAsShipping, setBillingIsSameAsShipping] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.07;
  const total = subtotal + shipping + tax;

  const verifyOnServer = async (ref: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) throw new Error("Supabase URL is not configured.");

      const res = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref }),
      });

      const data = await res.json();
      if (!res.ok || !data.verified) {
        throw new Error(data.error || "Payment verification failed on server.");
      }
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown verification error occurred.";
      showToast(errorMessage, "error");
      console.error("Verification Error:", error);
      return false;
    }
  };

  const initializePayment = usePaystackPayment({
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    email: addressData.email,
    currency: "GHS",
    amount: Math.round(total * 100),
    reference: "",
  });

  const handleFinalizeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const requiredFields: (keyof AddressFormData)[] = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "state",
      "zipCode",
      "country",
      "phone",
    ];

    const missingFields = requiredFields.filter((field) => !addressData[field]);
    if (missingFields.length > 0) {
      showToast(
        "Missing information",
        "error",
        `Please fill in all required fields: ${missingFields.join(", ")}`,
      );
      setIsProcessing(false);
      return;
    }

    let orderId: string | null = null;
    const reference = `dessa_${Math.random().toString(36).substring(2)}`;

    try {
      // --- Step 1: Create the Order ---
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id,
          total_amount: total,
          status: "pending_payment",
          shipping_address: addressData,
          billing_address: billingIsSameAsShipping ? addressData : {},
        })
        .select()
        .single();

      if (orderError || !orderData) {
        throw orderError || new Error("Order creation failed to return data.");
      }
      orderId = orderData.id;

      // --- Step 2: Create Order Items ---
      const orderItems = cart.map((item) => ({
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: item.product.price,
      }));

      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (orderItemsError) throw orderItemsError;

      // --- Step 3: Create Payment Record ---
      const { error: paymentError } = await supabase.from("payments").insert({
        order_id: orderId,
        user_id: user?.id,
        amount: total,
        reference: reference,
        status: "pending",
      });

      if (paymentError) throw paymentError;
    } catch (error: any) {
      showToast(
        "Database error",
        "error",
        "There was an issue preparing your order. Please try again.",
      );
      console.error("Supabase order processing error:", error.message);
      if (orderId) {
        // Clean up the created order if a later step fails
        await supabase.from("orders").delete().eq("id", orderId);
      }
      setIsProcessing(false);
      return;
    }

    const onSuccess = async (paystackResponse: { reference: string }) => {
      showToast("Payment successful, verifying...", "info");
      const isVerified = await verifyOnServer(paystackResponse.reference);

      if (isVerified) {
        showToast("Payment Verified and Order Completed!", "success");
        clearCart();
        router.push(`/order-confirmation?ref=${paystackResponse.reference}`);
      } else {
        showToast(
          "Payment verification failed.",
          "error",
          "Please contact support with your payment reference.",
        );
      }
      setIsProcessing(false);
    };

    const onClose = () => {
      showToast("Payment window closed.", "warning");
      setIsProcessing(false);
    };

    initializePayment({
      onSuccess,
      onClose,
      reference,
      email: addressData.email,
      amount: Math.round(total * 100),
    });
  };

  useEffect(() => {
    if (cart.length === 0 && !isProcessing) {
      showToast(
        "Your cart is empty.",
        "info",
        "Redirecting you to the cart page.",
      );
      router.push("/CartPage");
    }
  }, [cart, isProcessing, router, showToast]);

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="mb-6 opacity-70">Redirecting you back to cart...</p>
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <button
          className="btn btn-ghost btn-circle"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl lg:text-4xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Forms */}
        <div className="lg:col-span-2 space-y-10">
          <form onSubmit={handleFinalizeOrder} className="space-y-10">
            {/* Shipping Information */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="text-primary" size={24} />
                  <h2 className="card-title text-xl">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        First Name <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      name="firstName"
                      value={addressData.firstName}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        Last Name <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      name="lastName"
                      value={addressData.lastName}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Mail size={16} /> Email{" "}
                        <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={addressData.email}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Phone size={16} /> Phone{" "}
                        <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={addressData.phone}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 form-control">
                    <label className="label">
                      <span className="label-text">
                        Address <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      name="address"
                      value={addressData.address}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        City <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      name="city"
                      value={addressData.city}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        State/Region <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      name="state"
                      value={addressData.state}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        Postal Code <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      name="zipCode"
                      value={addressData.zipCode}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        Country <span className="text-error">*</span>
                      </span>
                    </label>
                    <select
                      name="country"
                      value={addressData.country}
                      onChange={handleAddressChange}
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="Ghana">Ghana</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 678nt Method */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="text-primary" size={24} />
                  <h2 className="card-title text-xl">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  <label className="label cursor-pointer justify-start gap-4 rounded-lg border p-4 hover:bg-base-200 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="radio radio-primary"
                      checked={paymentMethod === "credit-card"}
                      onChange={() => setPaymentMethod("credit-card")}
                    />
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} />
                      <span>Pay with Card / Mobile Money (Paystack)</span>
                    </div>
                  </label>

                  {/* You can add more payment options here later */}
                </div>

                <div className="mt-6">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      checked={billingIsSameAsShipping}
                      onChange={() =>
                        setBillingIsSameAsShipping(!billingIsSameAsShipping)
                      }
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">
                      Billing address same as shipping address
                    </span>
                  </label>
                </div>

                {!billingIsSameAsShipping && (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="font-semibold mb-4">Billing Address</h3>
                    <p className="text-sm opacity-70 mb-4">
                      (Billing address form fields can be added here when
                      needed)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Review */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-6">Review Your Order</h2>

                <div className="space-y-4 divide-y divide-base-200">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="py-4 flex justify-between items-center gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="avatar">
                          <div className="w-14 h-14 rounded bg-base-200">
                            <img
                              src={
                                item.product.image || "/placeholder-image.png"
                              }
                              alt={item.product.name}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-sm opacity-70">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold whitespace-nowrap">
                        GH₵{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3 text-sm">
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
                  <div className="divider my-3"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>GH₵{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-2 text-sm opacity-70 justify-center">
                    <Lock size={16} />
                    <span>Secure payment powered by Paystack</span>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full btn-lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay GH₵${total.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right - Sticky Summary */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-6">Order Summary</h2>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="badge badge-neutral">
                        {item.quantity}x
                      </span>
                      <span className="line-clamp-1">{item.product.name}</span>
                    </div>
                    <span className="font-medium">
                      GH₵{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="divider my-4"></div>

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
                  <div className="flex justify-between font-bold text-base pt-3 border-t">
                    <span>Total</span>
                    <span>GH₵{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
