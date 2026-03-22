import Lottie from "lottie-react";
import LoadingIcon from "@/public/lottie/loading2.json";
const Loading = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-base-100 flex items-center justify-center">
      <Lottie animationData={LoadingIcon} />
    </div>
  );
};

export default Loading;
