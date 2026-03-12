import React from "react";
interface ToastVariant {
  title: string;
  description?: string;
  variant?: "default" | "error" | "success" | "warning" | "info";
}

const variantClasses: Record<NonNullable<ToastVariant["variant"]>, string> = {
  default: "", // DaisyUI's default alert has no extra class
  error: "alert-error",
  success: "alert-success",
  warning: "alert-warning",
  info: "alert-info",
};

const Toast = ({ title, description, variant = "default" }: ToastVariant) => {
  return (
    <div className="toast toast-top toast-end z-[100]">
      <div className={`alert ${variantClasses[variant]} flex flex-col`}>
        <span className="font-bold text-md">{title}</span>
        {description && <span>{description}</span>}
      </div>
    </div>
  );
};

export default Toast;
