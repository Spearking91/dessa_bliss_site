"use client";
import Lottie from "lottie-react";
import LoadingIcon from "@/public/lottie/loading3.json";
import { useState, useEffect } from "react";

const Loading = () => {
  const [long, setLong] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLong(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-base-100 flex flex-col items-center justify-center">
      <Lottie animationData={LoadingIcon} style={{ width: 200, height: 200 }} />
      {long && (
        <p className="font-bold">
          If the page takes too long, please refresh the page.
        </p>
      )}
    </div>
  );
};

export default Loading;
