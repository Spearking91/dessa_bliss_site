"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Lock,
  CreditCard,
  ChevronLeft,
  Check,
  AlertCircle,
  Truck,
  Package,
  Tag,
} from "lucide-react";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    saveInfo: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const name = searchParams.get("name");
    const price = searchParams.get("price");
    const image = searchParams.get("image");
    const size = searchParams.get("size");
    const color = searchParams.get("color");
    const quantity = searchParams.get("quantity");

    if (name && price) {
      setCartItems([
        {
          id: 1,
          name,
          price: parseFloat(price),
          quantity: parseInt(quantity || "1"),
          size: size || "One Size",
          color: color || "Standard",
          image:
            image ||
            "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=200&h=250&fit=crop",
        },
      ]);
    } else {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart && parsedCart.length > 0) {
          setCartItems(parsedCart);
        }
      }
    }
  }, [searchParams]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 50 ? 0 : 12;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const formatCardNumber = (value) => {
    return (
      value
        .replace(/\s/g, "")
        .match(/.{1,4}/g)
        ?.join(" ") || value
    );
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(
      e.target.value.replace(/\D/g, "").slice(0, 16),
    );
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert("Payment successful! Thank you for your order.");
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      {/* Header */}
      <header className="bg-base-200 border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
              <ChevronLeft size={20} />
              <span className="text-sm">Back to Cart</span>
            </button>
            <h1 className="text-2xl font-bold">ARIA</h1>
            <div className="flex items-center gap-2 text-green-600">
              <Lock size={16} />
              <span className="text-sm font-medium">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-base-200 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                <Check size={16} />
              </div>
              <span className="text-sm font-medium">Cart</span>
            </div>
            <div className="flex-1 h-0.5 bg-black mx-4"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm font-medium">Information</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm text-base-content/50 font-medium">
                Complete
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-3 space-y-8">
            {/* Contact Information */}
            <div className="bg-base-200 p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                  1
                </span>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-base-content/50 font-medium mt-2">
                    Order confirmation will be sent here
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-base-200 p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                  2
                </span>
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street, Apt 4B"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Germany</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-base-200 p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                  3
                </span>
                Payment Method
              </h2>

              {/* Payment Options */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full p-4 border-2 flex items-center gap-3 transition-all ${
                    paymentMethod === "card"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "card"
                        ? "border-black"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "card" && (
                      <div className="w-3 h-3 rounded-full bg-black"></div>
                    )}
                  </div>
                  <CreditCard size={20} />
                  <span className="font-medium">Credit / Debit Card</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("paypal")}
                  className={`w-full p-4 border-2 flex items-center gap-3 transition-all ${
                    paymentMethod === "paypal"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "paypal"
                        ? "border-black"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "paypal" && (
                      <div className="w-3 h-3 rounded-full bg-black"></div>
                    )}
                  </div>
                  <span className="font-bold text-blue-600">Pay</span>
                  <span className="font-bold text-blue-800">Pal</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("apple")}
                  className={`w-full p-4 border-2 flex items-center gap-3 transition-all ${
                    paymentMethod === "apple"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "apple"
                        ? "border-black"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "apple" && (
                      <div className="w-3 h-3 rounded-full bg-black"></div>
                    )}
                  </div>
                  <span className="font-medium">Apple Pay</span>
                </button>
              </div>

              {/* Card Details */}
              {paymentMethod === "card" && (
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="saveInfo"
                      checked={formData.saveInfo}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">
                      Save payment information for next time
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-black text-white py-5 text-lg font-bold hover:bg-gray-800 transition-all transform hover:scale-[1.01] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing
                ? "Processing..."
                : `Complete Order - $${total.toFixed(2)}`}
            </button>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Lock size={16} />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-base-200 p-8 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-24 bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {item.size} / {item.color}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="font-bold">${item.price}</div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="flex-1 px-4 py-2 border border-gray-300 focus:border-black focus:outline-none text-sm transition-colors"
                  />
                  <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-gray-900">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="text-gray-600" size={20} />
                  <span className="text-gray-600">
                    Free shipping on orders over $50
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Package className="text-gray-600" size={20} />
                  <span className="text-gray-600">
                    Estimated delivery: 3-5 business days
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Tag className="text-gray-600" size={20} />
                  <span className="text-gray-600">30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,700;1,300&display=swap");

        * {
          font-family: "Crimson Pro", serif;
        }
      `}</style>
    </div>
  );
}
