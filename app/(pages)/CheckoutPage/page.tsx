"use client";
import dynamic from "next/dynamic";
import Loading from "@/app/loading";

const CheckoutForm = dynamic(() => import("./CheckoutForm"), {
  ssr: false,
  loading: () => (
    <Loading />
  ),
});

export default function CheckoutPage() {
  return <CheckoutForm />;
}
