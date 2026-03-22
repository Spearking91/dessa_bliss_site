"use client";

import Lottie from "lottie-react";
import dynamic from "next/dynamic";
import LoadingLogo from "@/public/lottie/loading2.json"

const CheckoutForm = dynamic(() => import("./CheckoutForm"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Lottie animationData={LoadingLogo}>
    </div>
  ),
});

export default function CheckoutPage() {
  return <CheckoutForm />;
}
