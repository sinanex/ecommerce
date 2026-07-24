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
  if (typeof window === "undefined" || !window.fbq) return;

  const eventKey = `ViewContent_${product._id}`;
  if (firedEvents.has(eventKey)) return;

  try {
    window.fbq("track", "ViewContent", {
      content_ids: [product._id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "INR",
    });
    firedEvents.add(eventKey);
    logEvent("ViewContent", {
      content_ids: [product._id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "INR",
    });
  } catch (error) {
    // Graceful error handling - never crash the application
  }
};

export const trackAddToCart = (product: AddToCartProduct) => {
  if (typeof window === "undefined" || !window.fbq) return;

  // Prevent multiple rapid clicks from firing duplicate AddToCart within a 1-second interval
  const windowBucket = Math.floor(Date.now() / 1000);
  const eventKey = `AddToCart_${product._id}_${windowBucket}`;
  if (firedEvents.has(eventKey)) return;

  try {
    window.fbq("track", "AddToCart", {
      content_ids: [product._id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "INR",
    });
    firedEvents.add(eventKey);
    logEvent("AddToCart", {
      content_ids: [product._id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "INR",
    });
  } catch (error) {
    // Graceful error handling
  }
};

export const trackInitiateCheckout = (params: InitiateCheckoutParams) => {
  if (typeof window === "undefined" || !window.fbq) return;

  const eventKey = "InitiateCheckout";
  if (firedEvents.has(eventKey)) return;

  try {
    window.fbq("track", "InitiateCheckout", {
      value: params.value,
      currency: params.currency || "INR",
      content_type: "product",
      contents: params.contents,
      num_items: params.num_items,
    });
    firedEvents.add(eventKey);
    logEvent("InitiateCheckout", {
      value: params.value,
      currency: params.currency || "INR",
      content_type: "product",
      contents: params.contents,
      num_items: params.num_items,
    });
  } catch (error) {
    // Graceful error handling
  }
};

export const trackPurchase = (params: PurchaseParams) => {
  if (typeof window === "undefined" || !window.fbq) return;

  if (hasPurchaseBeenFired(params.transaction_id)) return;

  try {
    window.fbq("track", "Purchase", {
      transaction_id: params.transaction_id,
      value: params.value,
      currency: params.currency || "INR",
      content_type: "product",
      contents: params.contents,
      num_items: params.num_items,
    });
    markPurchaseAsFired(params.transaction_id);
    logEvent("Purchase", {
      transaction_id: params.transaction_id,
      value: params.value,
      currency: params.currency || "INR",
      content_type: "product",
      contents: params.contents,
      num_items: params.num_items,
    });
  } catch (error) {
    // Graceful error handling
  }
};
