import AboutPage from "@/app/AboutPage/page";
import { CustomButton } from "@/app/components/CustomButton";
import ProductsSection from "@/app/components/ProductSection";
import Image from "next/image";
import ContactPage from "../ContactPage/page";

export default function LandingPage() {
  return (
    <div>
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage: "url('/background1.jpeg')",
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      >
        <div className="hero-overlay bg-black/70 backdrop-blur-sm">
          <div className="absolute top-0 w-full"></div>
        </div>
        <div className="hero-content text-neutral-content  flex-col lg:flex-row-reverse">
          <Image src={"/logo2.svg"} alt={"Logo"} width={500} height={50} />
          <div>
            <h1 className="text-5xl text-center font-bold">
              Welcome to Dessa Bliss Disposables
            </h1>
            <p className="py-6">
              We provide high quality services to our customers with a focus on
              reliability and customer satisfaction. Our team is dedicated to
              ensuring that every experience with us is a positive one.
            </p>
            <CustomButton onNavigate={"/auth"} title={"Get Started"} />
          </div>
        </div>
      </div>

      {/* <div className="hero min-h-screen bg-base-200 flex-col flex">
        
      </div> */}
      <div id="2">
        <ProductsSection />
      </div>

      <div id="3">
        <AboutPage />
      </div>
      <div id="4">
        <ContactPage />
      </div>
    </div>
  );
}
