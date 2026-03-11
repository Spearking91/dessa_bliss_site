"use client";

import { base } from "next-video/dist/utils/logger.js";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  title: string;
  onClick?: any;
  onNavigate?: string;
  full?: boolean;
  Loading?: boolean;
  color?:
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "info"
    | "success"
    | "warning"
    | "error";
}

// 1. Create a lookup table with full class strings
const colorMap = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  neutral: "btn-neutral",
  info: "btn-info",
  success: "btn-success",
  warning: "btn-warning",
  error: "btn-error",
  base: "btn-base",
};

export const CustomButton = ({
  title,
  color = "primary",
  onClick,
  onNavigate,
  full = false,
  Loading,
}: Props) => {
  const colorClass = colorMap[color];
  const router = useRouter();
  return (
    <button
      className={`btn ${colorClass} rounded-full ${
        full && " w-full"
      } border-base`}
      onClick={
        onClick || (onNavigate ? () => router.push(onNavigate) : undefined)
      }
    >
      {Loading ? (
        <span className="loading loading-spinner loading-md" />
      ) : (
        title
      )}
    </button>
  );
};
