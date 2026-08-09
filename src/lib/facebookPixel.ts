declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

// In-memory registry to handle event deduplication in a single page session context.
const firedEvents = new Set<string>();

const logEvent = (eventName: string, params?: Record<string, any>) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Meta Pixel] ${eventName} fired`, params);
  }
};

const hasPurchaseBeenFired = (transactionId: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const fired = localStorage.getItem(`fb_purchase_${transactionId}`);
    return fired === "true";
  } catch (e) {
    return false;
  }
};

const markPurchaseAsFired = (transactionId: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`fb_purchase_${transactionId}`, "true");
  } catch (e) {
    // Ignore Storage errors silently
  }
};

export interface ViewContentProduct {
  _id: string;
  name: string;
  price: number;
}

export interface AddToCartProduct {
  _id: string;
  name: string;
  price: number;
}

export interface CheckoutItem {
  id: string;
  quantity: number;
}

export interface InitiateCheckoutParams {
  value: number;
  currency?: string;
  num_items: number;
  contents: CheckoutItem[];
}

export interface PurchaseParams {
  transaction_id: string;
  value: number;
  currency?: string;
  num_items: number;
  contents: CheckoutItem[];
}

export const trackViewContent = (product: ViewContentProduct) => {
  // Meta Pixel tracking is disabled
};

export const trackAddToCart = (product: AddToCartProduct) => {
  // Meta Pixel tracking is disabled
};

export const trackInitiateCheckout = (params: InitiateCheckoutParams) => {
  // Meta Pixel tracking is disabled
};

export const trackPurchase = (params: PurchaseParams) => {
  // Meta Pixel tracking is disabled
};
