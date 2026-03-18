"use client";

import dynamic from "next/dynamic";

const CheckoutForm = dynamic(() => import("./CheckoutForm"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[70vh] flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  ),
});

export default function CheckoutPage() {
  return <CheckoutForm />;
}
