import { Suspense } from "react";
import { ProductList } from "./ProductList";
import Loading from "@/app/loading";

export default function ProductPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductList />
    </Suspense>
  );
}
0;
