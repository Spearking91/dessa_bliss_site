"use client";

import React from "react";
import { ThemeChanger } from "./ThemeChanger";
import Image from "next/image";
import { CustomButton } from "./CustomButton";
import { useRouter } from "next/navigation";

const TitleBar = () => {
  const router = useRouter();
  return (
    <div className="navbar bg-transparent shadow-sm">
      <div className=" flex flex-row justify-between items-center w-full">
        <div className="navbar-start">
          <a className="btn btn-ghost text-xl">
            <Image src={"/logo2.svg"} alt={"Logo"} width={200} height={50} />
          </a>
        </div>
        <div className="navbar-center">
          <ul className="menu menu-sm menu-horizontal gap-5  rounded-box z-1  shadow">
            <li>
              <a className="text-white rounded-full text-sm" href="#">
                Home
              </a>
            </li>
            <li>
              <a className="text-white rounded-full text-sm" href="#product">
                Product
              </a>
            </li>
            <li>
              <a className="text-white rounded-full text-sm" href="">
                About
              </a>
            </li>
            <li>
              <a className="text-white rounded-full text-sm" href="">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div className="navbar-end gap-3">
          <ThemeChanger />
          <CustomButton title={"Login"} onClick={() => router.push("/auth")} />
        </div>
      </div>
    </div>
  );
};

export default TitleBar;

{
  /* <div className="drawer">
          <input id="my-drawer-1" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            
            <label
              htmlFor="my-drawer-1"
              className="btn drawer-button rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />{" "}
              </svg>
            </label>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="my-drawer-1"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-base-200 min-h-full w-80 p-4">
              
              <li>
                <a>Sidebar Item 1</a>
              </li>
              <li>
                <a>Sidebar Item 2</a>
              </li>
            </ul>
          </div>
        </div> */
}
