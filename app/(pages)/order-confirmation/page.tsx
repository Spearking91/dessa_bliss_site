"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabase_client";
import { useToast } from "@/app/context/ToastContext";
import { Loader2, Download, Home } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Define the type for the payment data
type PaymentData = {
  id: string;
  created_at: string;
  amount: number;
  reference: string;
  status: string;
  metadata: {
    cart: {
      product: {
        id: string;
        name: string;
        price: number;
        images: string[];
      };
      quantity: number;
    }[];
    shipping_address: {
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
  };
};

// Helper functions to recalculate totals on this page
const getCartSubtotal = (cart: PaymentData["metadata"]["cart"]) => {
  if (!cart) return 0;
  return cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
};

const getShipping = (subtotal: number) => {
  return subtotal > 100 ? 0 : 10;
};

const OrderConfirmationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) {
      setError("No payment reference found.");
      setLoading(false);
      showToast("No payment reference provided.", "error");
      router.push("/");
      return;
    }

    const fetchPayment = async () => {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from("payments")
        .select("*")
        .eq("reference", ref)
        .single();

      if (dbError || !data) {
        setError("Could not find your order details. Please contact support.");
        setLoading(false);
        showToast("Failed to fetch order details.", "error", dbError?.message);
        return;
      }

      if (data.status !== "success") {
        setError(
          "This payment was not successful. If you believe this is an error, please contact support.",
        );
        setLoading(false);
        showToast("Payment not successful.", "warning");
        return;
      }

      setPayment(data as PaymentData);
      setLoading(false);
    };

    fetchPayment();
  }, [searchParams, router, showToast]);

  const handleDownloadPdf = async () => {
    const input = receiptRef.current;
    if (!input) {
      showToast(
        "Could not generate PDF.",
        "error",
        "Receipt element not found.",
      );
      return;
    }

    showToast("Generating PDF...", "info");
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`receipt-${payment?.reference}.pdf`);
      showToast("Receipt downloaded.", "success");
    } catch (e) {
      showToast(
        "Failed to download PDF.",
        "error",
        e instanceof Error ? e.message : "Unknown error",
      );
    }
  };

  if (loading) {
    return (
      <div className="container min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Fetching your order details...</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="container min-h-[70vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-error mb-4">Order Not Found</h1>
        <p className="mb-8">{error}</p>
        <button className="btn btn-primary" onClick={() => router.push("/")}>
          <Home className="mr-2 h-4 w-4" /> Go to Homepage
        </button>
      </div>
    );
  }

  const { metadata, amount, created_at, reference } = payment;
  const { shipping_address, cart } = metadata;
  const subtotal = getCartSubtotal(cart);
  const shipping = getShipping(subtotal);
  const tax = subtotal * 0.07;

  return (
    <div className="bg-base-200 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-base-content">
            Thank You for Your Order!
          </h1>
          <p className="mt-2 text-lg text-base-content/80">
            Your receipt is below. A confirmation has been sent to your email.
          </p>
        </div>

        <div ref={receiptRef} className="bg-base-100 shadow-lg rounded-lg p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary">Dessa Bliss</h2>
              <p className="text-base-content/70">Order Receipt</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Order #{reference}</p>
              <p className="text-sm text-base-content/70">
                Date: {new Date(created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-base-content mb-2">
                Billed To:
              </h3>
              <p className="text-base-content/80">
                {shipping_address.firstName} {shipping_address.lastName}
                <br />
                {shipping_address.address}
                <br />
                {shipping_address.city}, {shipping_address.state}{" "}
                {shipping_address.zipCode}
                <br />
                {shipping_address.country}
                <br />
                {shipping_address.email}
              </p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-base-content mb-2">
                Payment Details:
              </h3>
              <p className="text-base-content/80">
                Payment Method: Card/Momo
                <br />
                Status: <span className="font-bold text-success">Paid</span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-base-300">
                  <th className="py-2 font-semibold">Item</th>
                  <th className="py-2 font-semibold text-center">Quantity</th>
                  <th className="py-2 font-semibold text-right">Price</th>
                  <th className="py-2 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr
                    key={item.product.id}
                    className="border-b border-base-200"
                  >
                    <td className="py-4">{item.product.name}</td>
                    <td className="py-4 text-center">{item.quantity}</td>
                    <td className="py-4 text-right">
                      GH₵{item.product.price.toFixed(2)}
                    </td>
                    <td className="py-4 text-right">
                      GH₵{(item.product.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-8">
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-base-content/80">
                <span>Subtotal</span>
                <span>GH₵{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base-content/80">
                <span>Shipping</span>
                <span>GH₵{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base-content/80">
                <span>Tax (7%)</span>
                <span>GH₵{tax.toFixed(2)}</span>
              </div>
              <div className="divider my-2"></div>
              <div className="flex justify-between font-bold text-xl">
                <span>Total Paid</span>
                <span>GH₵{amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button className="btn btn-primary" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => router.push("/HomePage")}
          >
            <Home className="mr-2 h-4 w-4" /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
