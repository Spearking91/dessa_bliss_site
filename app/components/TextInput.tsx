"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface props {
  placeholder: string;
  title: string;
  Icon: any;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TextInput({
  Icon,
  value,
  onChange,
  title,
  placeholder,
}: props) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-bold">{title}</span>
      </label>
      <label className="input input-bordered flex items-center gap-2">
        <Icon className="text-gray-400" />
        <input
          type={
            title === "Password" ? (isVisible ? "text" : "password") : "text"
          }
          className="grow bg-transparent"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {title === "Password" && (
          <button
            type="button"
            className="btn btn-ghost btn-circle btn-sm"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? <EyeOff /> : <Eye />}
          </button>
        )}
      </label>
    </div>
  );
}
