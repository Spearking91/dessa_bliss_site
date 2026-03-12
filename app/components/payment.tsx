"use client";
import { usePaystackPayment } from "react-paystack";
import { useToast } from "@/app/context/ToastContext";

const PaystackButton = ({
  amount,
  email,
}: {
  amount: number;
  email: string;
}) => {
  const { showToast } = useToast();
  const config = {
    reference: new Date().getTime().toString(),
    email: email,
    amount: amount * 100, // Paystack uses kobo/cents (e.g., 1000 = 10.00)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: any) => {
    // 1. Transaction was successful in the popup
    // 2. Now, send the reference to your Supabase Function to verify!
    showToast("Payment successful, verifying...", "info");
    verifyTransaction(reference.reference);
  };

  const onClose = () => {
    showToast("Payment window closed.", "warning");
  };

  const verifyTransaction = async (ref: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error(
          "Supabase URL is not configured in environment variables.",
        );
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref }),
      });

      const data = await res.json();

      if (!res.ok || !data.verified) {
        throw new Error(data.error || "Payment verification failed.");
      }

      showToast("Payment Verified and Completed!", "success");
      // You can add further logic here, like redirecting to an order confirmation page.
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown verification error occurred.";
      showToast(errorMessage, "error");
      console.error("Verification Error:", error);
    }
  };

  return (
    <button
      onClick={() => initializePayment(onSuccess, onClose)}
      className="bg-green-500 text-white px-4 py-2 rounded"
    >
      Pay Now
    </button>
  );
};

export default PaystackButton;
