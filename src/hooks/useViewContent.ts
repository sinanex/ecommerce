import { useEffect } from "react";
import { trackViewContent, ViewContentProduct } from "@/lib/facebookPixel";

export const useViewContent = (product: ViewContentProduct | null) => {
  useEffect(() => {
    if (product && product._id) {
      trackViewContent(product);
    }
  }, [product]);
};
