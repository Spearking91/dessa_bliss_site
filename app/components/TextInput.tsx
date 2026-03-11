"use client";

import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";

interface props {
  placeholder: string;
  title: string;
  Icon: any;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
`  `;

export default function TextInput({
  Icon,
  value,
  onChange,
  title,
  placeholder,
}: props) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="w-full m-1">
      <p style={{ fontWeight: "bold" }} children={title} />
      <div className="flex items-center w-full p-2 border border-solid rounded-xl gap-2">
        <Icon className="text-gray-300" />
        <input
          className="w-full outline-none bg-transparent"
          type={
            title === "Password" ? (isVisible ? "text" : "password") : "text"
          }
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {title === "Password" && (
          <button
            className="btn-circle"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? <EyeClosed /> : <Eye />}
          </button>
        )}
      </div>
    </div>
  );
}
