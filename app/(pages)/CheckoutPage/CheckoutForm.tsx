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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContent";
import { useToast } from "@/app/context/ToastContext";
import { useAuth } from "@/app/auth/AuthContext";
import { supabase } from "@/utils/supabase/supabase_client";
import { usePaystackPayment } from "react-paystack";
import Image from "next/image";

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

const CheckoutForm = () => {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [addressData, setAddressData] = useState<AddressFormData>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "+233",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Ghana",
  });

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("credit-card");
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">(
    "pickup",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [reference, setReference] = useState(
    () => `dessa_${Math.random().toString(36).substring(2)}`,
  );

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = getCartTotal();
  const shipping = deliveryMode === "pickup" ? 0 : subtotal > 200 ? 0 : 20; // Default delivery fee of GH₵20 if under GH₵200
  const tax = subtotal * 0.0195;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (user === null) router.replace("/auth");
  }, []);

  const verifyOnServer = async (ref: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) throw new Error("Supabase URL is not configured.");

      // Using fetch directly to avoid CORS issues with x-client-info header
      // that supabase.functions.invoke adds automatically
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${supabaseUrl}/functions/v1/verify-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({ reference: ref }),
        },
      );

      if (!response.ok) {
        throw new Error(`Verification request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.verified) {
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
    reference: reference, // Use the state reference so Paystack uses OUR code
  });

  const handleFinalizeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Check if user is authenticated before proceeding
    if (!user?.id) {
      showToast(
        "Login Required",
        "error",
        "Please sign in to complete your purchase and track your order journey.",
      );
      setIsProcessing(false);
      return;
    }

    let requiredFields: (keyof AddressFormData)[] = [
      "firstName",
      "lastName",
      "email",
      "country",
      "phone",
    ];

    // if (deliveryMode === "delivery") {
    //   requiredFields = [...requiredFields, "address", "city", "state"];
    // }

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

    try {
      // --- Step 1: Create the Order ---
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id,
          total_amount: total,
          status: "pending",
          delivery_mode: deliveryMode,
          shipping_address:
            deliveryMode === "pickup"
              ? { ...addressData, address: "STORE PICKUP" }
              : addressData,
          billing_address: addressData,
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
        metadata: {
          cart,
          delivery_mode: deliveryMode,
          address_details: addressData,
        },
      });

      if (paymentError) throw paymentError;
    } catch (error) {
      showToast(
        "Database error",
        "error",
        "There was an issue preparing your order. Please try again.",
      );
      console.error(
        "Supabase order processing error:",
        (error as Error).message,
      );
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
        router.push(
          `/order-confirmation?ref=${encodeURIComponent(paystackResponse.reference)}`,
        );
        return;
      }

      showToast(
        "Payment verification failed.",
        "error",
        "Please contact support with your payment reference.",
      );
      setIsProcessing(false);
    };

    const onClose = () => {
      showToast("Payment window closed.", "warning");
      setIsProcessing(false);
      // Generate a new reference for the next attempt so we don't duplicate
      setReference(`dessa_${Math.random().toString(36).substring(2)}`);
    };

    initializePayment({ onSuccess, onClose });
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
                  <h2 className="card-title text-xl">
                    {deliveryMode === "delivery"
                      ? "Shipping Information"
                      : "Contact Information"}
                  </h2>
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
                      maxLength={13}
                      value={addressData.phone}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  {deliveryMode === "delivery" && (
                    <>
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
                    </>
                  )}

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

            {/* Delivery Method Selection */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="text-primary" size={24} />
                  <h2 className="card-title text-xl">Delivery Method</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <label
                    className={`label cursor-pointer justify-start gap-4 rounded-lg border p-4 hover:bg-base-200 transition-all ${deliveryMode === "delivery" ? "border-primary bg-primary/5" : ""}`}
                  >
                    <input
                      type="radio"
                      name="deliveryMode"
                      className="radio radio-primary"
                      checked={deliveryMode === "delivery"}
                      onChange={() => setDeliveryMode("delivery")}
                    />
                    <div className="flex flex-col">
                      <span className="font-bold">Home Delivery</span>
                      <span className="text-xs opacity-70">
                        Doorstep delivery (GH₵20 fee may apply)
                      </span>
                    </div>
                  </label> */}

                  <label
                    className={`label cursor-pointer justify-start gap-4 rounded-lg border p-4 hover:bg-base-200 transition-all ${deliveryMode === "pickup" ? "border-primary bg-primary/5" : ""}`}
                  >
                    <input
                      type="radio"
                      name="deliveryMode"
                      className="radio radio-primary"
                      checked={deliveryMode === "pickup"}
                      onChange={() => setDeliveryMode("pickup")}
                    />
                    <div className="flex flex-col">
                      <span className="font-bold">Self Pickup</span>
                      <span className="text-xs opacity-70">
                        Collect from our office (Free)
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Payment Method */}
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
                            <Image
                              src={
                                item.product.images[0] ||
                                "/placeholder-image.png"
                              }
                              alt={item.product.name}
                              className="object-cover"
                              width={56}
                              height={56}
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
                  {/* <div className="flex justify-between">
                    <span className="opacity-70">Delivery</span>
                    <span className={shipping === 0 ? "text-success" : ""}>
                      {shipping === 0 ? "Free" : `GH₵${shipping.toFixed(2)}`}
                    </span>
                  </div> */}
                  <div className="flex justify-between">
                    <span className="opacity-70">Tax (1.95%)</span>
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
                  {/* <div className="flex justify-between">
                    <span className="opacity-70">Delivery</span>
                    <span className={shipping === 0 ? "text-success" : ""}>
                      {shipping === 0 ? "Free" : `GH₵${shipping.toFixed(2)}`}
                    </span>
                  </div> */}
                  <div className="flex justify-between">
                    <span className="opacity-70">Tax (1.95%)</span>
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

export default CheckoutForm;
