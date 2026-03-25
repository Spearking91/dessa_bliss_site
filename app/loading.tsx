"use client";
import Lottie from "lottie-react";
import LoadingIcon from "@/public/lottie/loading2.json";
import { useState } from "react";
const Loading = () => {
  const [long, setLong] = useState(false);
  setTimeout(() => {
    setLong(true);
  }, 10000);
  return (
    <div className="fixed inset-0 z-[100] bg-base-100 flex flex-col items-center justify-center">
      <Lottie animationData={LoadingIcon} />
      {long && (
        <p className="font-bold">
          If the page takes too long, please refresh the page.
        </p>
      )}
    </div>
  );
};

export default Loading;
