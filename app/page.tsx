import { Metadata } from "next";
import HomePage from "./(pages)/HomePage/page";
export const metadata: Metadata = {
  title: "Home"
}

const Home = () => {
  return <HomePage />;
};

export default Home;
