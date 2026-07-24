import { useEffect } from "react";
import { trackPurchase, PurchaseParams } from "@/lib/facebookPixel";

export const usePurchase = (params: PurchaseParams | null) => {
  useEffect(() => {
    if (params && params.transaction_id) {
      trackPurchase(params);
    }
  }, [params]);
};
