"use client";
import { useState } from "react";
import {
  CreditCard,
  Building,
  Apple,
  LockIcon,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContent";
import Toast from "@/app/components/toast";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";

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

  const [addressData, setAddressData] = useState<AddressFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("credit-card");
  const [billingIsSameAsShipping, setBillingIsSameAsShipping] = useState(true);

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLinputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "state",
      "zipCode",
      "country",
    ];
    const missingFields = requiredFields.filter(
      (field) => !addressData[field as keyof AddressFormData],
    );

    if (missingFields.length > 0) {
      <Toast
        variant="destructive"
        title="Missing information"
        description={`Please fill in all required fields: ${missingFields.join(", ")}`}
      />;
      return;
    }

    // In a real app, this would send the order to a backend/payment gateway
    // For demo purposes, just show success and clear cart
    setTimeout(() => {
      clearCart();
      router.push("/order-confirmation", {
        state: {
          orderNumber: `ORD-${Math.floor(Math.random() * 1000000)}`,
          orderedProducts: [...cart],
        },
      });
    }, 1500);

    <Toast
      title="Processing order..."
      description="Your order is being processed. Please wait."
    />;
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.07; // 7% tax for demo
  const total = subtotal + shipping + tax;

  if (cart.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="container px-20">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
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
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="state">State/Province *</label>
                      <input
                        id="state"
                        name="state"
                        value={addressData.state}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode">ZIP / Postal Code *</label>
                      <input
                        id="zipCode"
                        name="zipCode"
                        value={addressData.zipCode}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="country">Country *</label>
                    <select
                      id="country"
                      name="country"
                      value={addressData.country}
                      onChange={handleAddressChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
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
                      Credit / Debit Card
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 rounded-lg border border-gray-200 p-4">
                    <RadioGroupItem value="paypal" id="payment-paypal" />
                    <label
                      htmlFor="payment-paypal"
                      className="flex items-center"
                    >
                      <Building className="mr-2 h-4 w-4" />
                      PayPal
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 rounded-lg border border-gray-200 p-4">
                    <RadioGroupItem value="apple-pay" id="payment-apple-pay" />
                    <label
                      htmlFor="payment-apple-pay"
                      className="flex items-center"
                    >
                      <Apple className="mr-2 h-4 w-4" />
                      Apple Pay
                    </label>
                  </div>
                </RadioGroup>

                {paymentMethod === "credit-card" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="card-number">Card Number</label>
                      <input
                        id="card-number"
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry">Expiry Date</label>
                        <input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <label htmlFor="cvc">CVC</label>
                        <input id="cvc" placeholder="CVC" />
                      </div>
                    </div>
                  </div>
                )}

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
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="my-4 w-1" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {/* <Separator className="my-2" /> */}
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col space-y-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <LockIcon className="h-4 w-4 mr-2" />
                    Your payment information is encrypted and secure.
                  </div>

                  <button type="submit" className="btn btn-primary w-full">
                    Place Order <ChevronsRight className="ml-2 h-4 w-4" />
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
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* <Separator /> */}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              {/* <Separator /> */}

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
