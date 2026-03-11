"use client";

import { CustomButton } from "@/app/components/CustomButton";
import TextInput from "@/app/components/TextInput";
import { supabase } from "@/utils/supabase/supabase_client";
import { createClient } from "@supabase/supabase-js";
import { Lock, Mail, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

export default function Signup() {
  const [Name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Agree, setAgree] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const _signUp = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const { data: LoginData, error: LoginError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (LoginData.user) {
      console.log(LoginData);
      setIsLoading(false);
      router.push("/HomePage");
    }
    if (LoginError) {
      console.log(LoginError);
    }
  };

  return (
    <div className="  flex items-center justify-center flex-col p-5 gap-1 text-base-content">
      <Image
        src={"/logo2.svg"}
        width={150}
        height={150}
        objectFit="cover"
        alt={"Logo"}
      />
      <h2
        className="text-base-content"
        style={{ fontWeight: "bold", fontSize: 20 }}
        children={"Register your account"}
      />
      <p
        className="text-sm"
        style={{ textAlign: "center", fontWeight: "400" }}
        children={
          "Join our community and explore the wonderful items we have offer"
        }
      />
      {/* <CustomButton title={"Login with Google"} full color="secondary" /> */}
      <div className="flex-row flex items-center gap-2 w-full text-base-content">
        <div style={{ borderWidth: 1, height: 0.5, width: "45%" }} />
        <p>Or</p>
        <div style={{ borderWidth: 1, height: 0.5, width: "45%" }} />
      </div>

      <TextInput
        Icon={Mail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        title={"Email"}
        placeholder={"Enter your email address"}
      />
      <TextInput
        Icon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        title={"Password"}
        placeholder={"Enter your password"}
      />
      <div className="w-full py-1 flex justify-between ">
        <div className="flex flex-row gap-1">
          <input
            defaultChecked
            className="checkbox"
            type="checkbox"
            name="Agree"
            id="Agree"
          />
          <label className="text-sm label" htmlFor="Agree">
            {" "}
            I agree with all terms and conditions
          </label>
        </div>
      </div>
      <CustomButton
        onClick={_signUp}
        full={true}
        Loading={isLoading}
        title={"Register"}
      />
    </div>
  );
}
