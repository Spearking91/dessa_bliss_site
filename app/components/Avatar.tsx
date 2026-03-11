import React from "react";
import { useAuth } from "../auth/AuthContext";

const Avatar = () => {
  const { user } = useAuth();
  return (
    <div className="avatar">
      <div className="ring-secondary ring-offset-base-100 w-18 rounded-full ring-2 ring-offset-2 justify-center items-center flex bg-secondary text-secondary-content">
        <h1 className="font-black text-xl">
          {user?.email?.charAt(0).toUpperCase()}
        </h1>
      </div>
    </div>
  );
};

export default Avatar;
