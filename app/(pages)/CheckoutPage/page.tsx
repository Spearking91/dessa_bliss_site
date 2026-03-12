"use client";
import { useState } from "react";
import { CreditCard, Building, Apple, LockIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContent";

import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
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
  const tax = subtotal * 0.07; // 7% tax for demo
  const total = subtotal + shipping + tax;

  const verifyOnServer = async (ref: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("Supabase URL is not configured.");
      }

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
    email: addressData.email, // This will be overridden
    currency: "GHS",
    amount: Math.round(total * 100),
    reference: "", // This will be overridden
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

    const reference = `dessa_${Math.random().toString(36).substring(2)}`;
    const { error: insertError } = await supabase.from("payments").insert({
      user_id: user?.id,
      amount: total,
      reference: reference,
      status: "pending",
      metadata: {
        cart,
        shipping_address: addressData,
      },
    });

    if (insertError) {
      showToast(
        "Database error",
        "error",
        "Could not create payment record. Please try again.",
      );
      console.error("Supabase insert error:", insertError);
      setIsProcessing(false);
      return;
    }

    // const onSuccess = async (paystackResponse: { reference: string }) => {
    //   showToast("Payment successful, verifying...", "info");
    //   const isVerified = await verifyOnServer(paystackResponse.reference);

    //   if (isVerified) {
    //     showToast("Payment Verified and Order Completed!", "success");
    //     clearCart();
    //     // Redirect to the order confirmation page with the payment reference
    //     router.push(`/order-confirmation?ref=${paystackResponse.reference}`);
    //   } else {
    //     showToast(
    //       "Payment verification failed.",
    //       "error",
    //       "Please contact support with your payment reference.",
    //     );
    //   }
    //   setIsProcessing(false);
    // };

    // const onClose = () => {
    //   showToast("Payment window closed.", "warning");
    //   setIsProcessing(false);
    // };

    // ...
    const onSuccess = async (paystackResponse: { reference: string }) => {
      showToast("Payment successful, verifying...", "info");
      // 1. This function is called...
      const isVerified = await verifyOnServer(paystackResponse.reference);

      // 2. The redirect ONLY happens if isVerified is true.
      if (isVerified) {
        showToast("Payment Verified and Order Completed!", "success");
        clearCart();
        router.push(`/order-confirmation?ref=${paystackResponse.reference}`); // <-- The redirect
      } else {
        // 3. If verification fails, this block runs instead, and no redirect occurs.
        showToast(
          "Payment verification failed.",
          "error",
          "Please contact support with your payment reference.",
        );
      }
      setIsProcessing(false);
    };
    // ...
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

  if (cart.length === 0 && !isProcessing) {
    if (typeof window !== "undefined") {
      router.push("/CartPage");
    }
    return (
      <div className="container min-h-[70vh] py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="mb-8">Redirecting you to your cart...</p>
      </div>
    );
  }

  return (
    <div className="container px-20">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleFinalizeOrder} className="space-y-8">
            {/* Shipping Information */}
            <div>
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      id="firstName"
                      name="firstName"
                      value={addressData.firstName}
                      onChange={handleAddressChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      id="lastName"
                      name="lastName"
                      value={addressData.lastName}
                      onChange={handleAddressChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email">Email *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={addressData.email}
                      onChange={handleAddressChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone">Phone *</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={addressData.phone}
                      onChange={handleAddressChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address">Address *</label>
                    <input
                      id="address"
                      name="address"
                      value={addressData.address}
                      onChange={handleAddressChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="city">City *</label>
                    <input
                      id="city"
                      name="city"
                      value={addressData.city}
                      onChange={handleAddressChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state">State/Province *</label>
                    <input
                      id="state"
                      name="state"
                      value={addressData.state}
                      onChange={handleAddressChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode">Zip/Postal Code *</label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      value={addressData.zipCode}
                      onChange={handleAddressChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="country">Country *</label>
                    <select
                      id="country"
                      name="country"
                      value={addressData.country}
                      onChange={handleAddressChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-base-100"
                      required
                    >
                      <option value="Ghana">Ghana</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as PaymentMethod)
                  }
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 rounded-lg border border-gray-200 p-4">
                    <RadioGroupItem
                      value="credit-card"
                      id="payment-credit-card"
                    />
                    <label
                      htmlFor="payment-credit-card"
                      className="flex items-center"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay with Card / Mobile Money
                    </label>
                  </div>
                </RadioGroup>

                <div className="mt-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="billing-same"
                      checked={billingIsSameAsShipping}
                      onChange={() =>
                        setBillingIsSameAsShipping(!billingIsSameAsShipping)
                      }
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="billing-same">
                      Billing address is the same as shipping address
                    </label>
                  </div>
                </div>

                {!billingIsSameAsShipping && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Billing Address
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Please enter your billing address information.
                    </p>
                    {/* Billing address form fields would go here - simplified for demo */}
                  </div>
                )}
              </div>
            </div>

            {/* Review & Submit */}
            <div>
              <h2 className="text-xl font-bold mb-4">Review Order</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="py-4 flex justify-between"
                    >
                      <div className="flex">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-16 w-16 object-cover rounded-md mr-4"
                        />
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        GH₵{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="my-4 w-1" />

                <div className="space-y-2 text-sm">
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
                  {/* <Separator className="my-2" /> */}
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>GH₵{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col space-y-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <LockIcon className="h-4 w-4 mr-2" />
                    Your payment information is encrypted and secure.
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isProcessing
                      ? "Processing..."
                      : `Pay GH₵${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <div className="flex">
                    <span className="text-gray-600">{item.quantity}x</span>
                    <span className="ml-2 truncate">{item.product.name}</span>
                  </div>
                  <span className="font-medium">
                    GH₵{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* <Separator /> */}

              <div className="space-y-2 text-sm">
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
              </div>

              {/* <Separator /> */}

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>GH₵{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
