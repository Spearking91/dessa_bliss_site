"use client";

import { Palette } from "lucide-react";
import React, { useEffect, useState } from "react";

const themes = [
  "default",
  "retro",
  "cyberpunk",
  "valentine",
  "aqua",
  "cupcake",
  "caramellatte",
  "abyss"
];

interface props {
  isIcon?: boolean;
}

export const ThemeChanger = ({ isIcon = false }: props) => {
  const [currentTheme, setCurrentTheme] = useState("default");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentTheme(val);
    localStorage.setItem("theme", val);
    document.documentElement.setAttribute("data-theme", val);
  };

  return (
    <div className="dropdown">
      {isIcon ? (
        <button className="p-2 hover:bg-accent transition-colors rounded-lg">
          <Palette size={22} className="text-accent-content" />
        </button>
      ) : (
        <div
          tabIndex={0}
          role="button"
          className="btn rounded-full bg-neutral text-primary-content"
        >
          Theme
          <svg
            width="12px"
            height="12px"
            className="inline-block h-2 w-2 fill-current opacity-60"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
          >
            <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
          </svg>
        </div>
      )}
      <ul
        tabIndex={-1}
        className="dropdown-content bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl"
      >
        {themes.map((theme) => (
          <li key={theme}>
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start text-base-content"
              aria-label={theme.charAt(0).toUpperCase() + theme.slice(1)}
              value={theme}
              checked={currentTheme === theme}
              onChange={handleThemeChange}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
