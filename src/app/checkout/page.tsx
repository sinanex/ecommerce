"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, ShieldCheck, Truck, CreditCard, MapPin, CheckCircle2, QrCode } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config';
import { useCart } from '@/context/CartContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { trackInitiateCheckout } from '@/lib/facebookPixel';

function CheckoutContent() {
  const { showSnackbar } = useSnackbar();
  const location = { pathname: usePathname(), search: useSearchParams() ? "?" + useSearchParams().toString() : "" };
  const navigate = useRouter();
  const { clearCart, removeFromCart } = useCart();

  const [checkoutState, setCheckoutState] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const state = localStorage.getItem('checkoutState');
    if (state) setCheckoutState(JSON.parse(state));

    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error fetching settings:', err))
      .finally(() => setIsLoaded(true));
  }, []);
  const { cartItems, summary, address } = checkoutState || {
    cartItems: [],
    summary: { subtotal: 0, shippingCost: 0, total: 0 },
    address: null
  };

  useEffect(() => {
    if (isLoaded && cartItems && cartItems.length > 0) {
      const contents = cartItems.map((item: any) => ({
        id: item.product?._id || item.product,
        quantity: item.quantity
      }));
      const num_items = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
      trackInitiateCheckout({
        value: summary.total,
        currency: "INR",
        num_items,
        contents
      });
    }
  }, [isLoaded, cartItems, summary]);

  const [paymentMethod, setPaymentMethod] = useState('online');
  const [showMockRazorpay, setShowMockRazorpay] = useState(false);

  // Compute dynamic shipping and total
  const totalQuantity = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
  const baseShippingCharge = settings?.codDeliveryAmount || 50;
  const calculatedCodCharge = totalQuantity > 0 ? Math.ceil(totalQuantity / 2) * baseShippingCharge : 0;

  const isCod = paymentMethod === 'cod';
  const shippingCharge = isCod ? calculatedCodCharge : 0;
  const dynamicTotal = summary.subtotal + shippingCharge;
  const payableAmount = isCod ? shippingCharge : dynamicTotal;

  // Redirect if no data (e.g., direct URL access)
  React.useEffect(() => {
    if (isLoaded && (!cartItems || cartItems.length === 0 || !address)) {
      navigate.push('/cart');
    }
  }, [cartItems, address, navigate, isLoaded]);

  const [isProcessing, setIsProcessing] = useState(false);

  const placeOrder = async (paymentDetails?: any) => {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    try {
      const orderData = {
        items: cartItems.map((item: any) => ({
          product: item.product._id,
          name: item.product.name,
          price: item.product.discount_price || item.product.price,
          image: item.product.images?.[0],
          size: item.size,
          quantity: item.quantity
        })),
        shippingAddress: address,
        paymentMethod: isCod ? 'cod' : 'online',
        totalAmount: dynamicTotal,
        shippingCharge: shippingCharge,
        subtotal: summary.subtotal,
        razorpayPaymentId: paymentDetails?.razorpayPaymentId,
        razorpayOrderId: paymentDetails?.razorpayOrderId,
        razorpaySignature: paymentDetails?.razorpaySignature,
        advancePaid: isCod ? shippingCharge : dynamicTotal
      };

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const orderData = await response.json();
        localStorage.setItem('lastOrder', JSON.stringify(orderData));

        if (checkoutState?.isBuyNow && checkoutState?.buyNowItemId) {
          await removeFromCart(checkoutState.buyNowItemId);
        } else {
          clearCart();
        }

        localStorage.removeItem('checkoutState');
        showSnackbar("Success", "Order placed successfully!", "success");
        navigate.push('/success');
      } else {
        showSnackbar("Error", "Failed to place order", "error");
        setIsProcessing(false);
      }
    } catch (err) {
      showSnackbar("Error", "Connection error", "error");
      setIsProcessing(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    setIsProcessing(true);

    const res = await loadRazorpay();
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

    // If no real Razorpay key exists, or script failed to load, open our mock demo
    if (!res || !key) {
      setShowMockRazorpay(true);
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      // Create order on backend
      const orderRes = await fetch(`${API_BASE_URL}/api/razorpay/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: payableAmount })
      });

      if (!orderRes.ok) {
        showSnackbar("Error", "Failed to initialize payment", "error");
        setIsProcessing(false);
        return;
      }

      const orderData = await orderRes.json();

      let rpMethod = undefined;
      if (paymentMethod === 'upi') rpMethod = 'upi';
      if (paymentMethod === 'cards') rpMethod = 'card';
      if (paymentMethod === 'wallets') rpMethod = 'wallet';
      if (paymentMethod === 'netbanking') rpMethod = 'netbanking';

      // Real Razorpay Integration
      const options = {
        key: key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "KITBAY",
        description: isCod ? "Advance Payment for COD" : "Order Payment",
        image: "/logo.png",
        order_id: orderData.id,
        handler: function (response: any) {
          placeOrder({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature
          });
        },
        prefill: {
          name: address.name,
          contact: address.phone,
          method: rpMethod
        },
        theme: { color: "#000000" }, // Black theme as requested
        modal: {
          ondismiss: function () {
            showSnackbar("Cancelled", "Payment cancelled", "error");
            setIsProcessing(false);
          }
        }
      };
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        showSnackbar("Error", "Payment failed", "error");
        setIsProcessing(false);
      });
      paymentObject.open();
    } catch (error) {
      showSnackbar("Error", "Something went wrong", "error");
      setIsProcessing(false);
    }
  };

  if (!isLoaded || !address) return null;

  return (
    <div className="min-h-screen bg-brand-surface text-brand-on-surface pt-24 pb-32">
      <>
        <title>Secure Checkout | KITBAY</title>
      </>

      <main className="max-w-[1280px] mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-[10px] font-sans text-brand-on-surface-variant mb-4 uppercase tracking-widest max-w-3xl mx-auto">
          <Link className="hover:text-brand-primary transition-colors" href="/">Home</Link>
          <ChevronRight size={14} />
          <Link className="hover:text-brand-primary transition-colors" href="/cart">Cart</Link>
          <ChevronRight size={14} />
          <span className="text-brand-on-surface font-black">Checkout</span>
        </nav>

        <div className="max-w-3xl mx-auto flex items-center justify-between pb-4 mb-4">
          <h1 className="font-h text-2xl md:text-3xl font-bold text-brand-on-surface leading-[1.3] uppercase">Secure Checkout</h1>
          <span className="font-sans text-[10px] text-brand-on-surface-variant uppercase tracking-[0.2em] font-bold bg-brand-surface-low px-4 py-2 rounded-full">
            {cartItems.reduce((acc: any, item: any) => acc + item.quantity, 0)} ITEMS
          </span>
        </div>

        <div className="max-w-3xl mx-auto space-y-2 sm:space-y-4 pb-28 -mx-6 sm:mx-auto">
          {/* Step 1: Delivery Address */}
          <section className="bg-white p-4 md:p-6 sm:rounded-2xl sm:border border-brand-surface-normal sm:shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-sans text-brand-on-surface-variant text-sm font-bold">Deliver to:</h2>
              <button onClick={() => navigate.push('/cart?changeAddress=true')} className="text-brand-primary font-bold text-[11px] border border-brand-surface-normal rounded px-3 py-1.5 hover:bg-brand-surface-low transition-colors">
                Change
              </button>
            </div>

            <div className="flex flex-col">
              <h3 className="font-bold text-brand-on-surface text-[15px] mb-1">{address.name}</h3>
              <p className="font-sans text-sm text-brand-on-surface-variant leading-relaxed">
                {address.address}, {address.locality}, {address.city}, {address.state} - <span className="font-bold text-brand-on-surface">{address.pincode}</span>
              </p>
              <p className="font-sans text-sm text-brand-on-surface mt-2">
                {address.phone} {address.alternatePhone && `, ${address.alternatePhone}`}
              </p>
            </div>
          </section>

          {/* Step 2: Order Items */}
          <section className="bg-white p-4 md:p-6 sm:rounded-2xl sm:border border-brand-surface-normal sm:shadow-sm">
            <div className="space-y-6">
              {cartItems.map((item: any, idx: number) => (
                <div key={item._id} className={cn("flex gap-4", idx !== 0 && "pt-6 border-t border-brand-surface-normal")}>
                  <div className="w-20 h-24 bg-brand-surface-low rounded-md overflow-hidden flex-shrink-0 border border-brand-surface-normal/50">
                    <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h5 className="font-sans text-brand-on-surface text-[13px] line-clamp-2 leading-snug">{item.product?.name}</h5>

                    <div className="mt-2 flex items-center gap-2">
                      {item.product?.discount_price && item.product.discount_price < item.product.price && (
                        <span className="text-[11px] text-green-600 font-bold bg-green-50 px-1 py-0.5 rounded">
                          ↓{Math.round(((item.product.price - item.product.discount_price) / item.product.price) * 100)}%
                        </span>
                      )}
                      {item.product?.discount_price && item.product.discount_price < item.product.price && (
                        <span className="text-[11px] text-brand-on-surface-variant line-through">₹{(item.product.price * item.quantity).toFixed(0)}</span>
                      )}
                      <span className="font-bold text-brand-on-surface text-base">₹{((item.product?.discount_price || item.product?.price || 0) * item.quantity).toFixed(0)}</span>
                      {item.quantity > 1 && (
                        <span className="text-[11px] text-brand-on-surface-variant ml-1">(₹{(item.product?.discount_price || item.product?.price || 0).toFixed(0)} each)</span>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-surface-low border border-brand-surface-normal rounded text-[11px] font-bold text-brand-on-surface">
                        Qty: {item.quantity} • {item.size}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-brand-surface-normal space-y-2">
              <div className="flex justify-between text-sm text-brand-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-bold text-brand-on-surface">₹{summary.subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-brand-on-surface-variant">
                <span>Shipping</span>
                <span className="font-bold text-brand-on-surface">
                  {shippingCharge === 0 ? <span className="text-green-600">Free</span> : `₹${shippingCharge.toFixed(0)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-brand-surface-normal border-dashed text-brand-on-surface">
                <span>Total Amount</span>
                <span>₹{dynamicTotal.toFixed(0)}</span>
              </div>
            </div>
          </section>

          {/* Step 3: Payment Method */}
          <section className="bg-white py-4 md:p-6 sm:rounded-2xl sm:border border-brand-surface-normal sm:shadow-sm">

            <h2 className="font-sans text-brand-on-surface-variant text-sm font-bold mb-4 px-4 md:px-0">Payment Methods</h2>

            <div className="border-y sm:border border-brand-surface-normal sm:rounded-xl overflow-hidden bg-white">
              {[
                { id: 'cod', amount: calculatedCodCharge, title: `COD Partial Payment (Pay ₹${summary.subtotal.toFixed(0)} on delivery)` },
                { id: 'upi', amount: summary.subtotal, title: 'Pay via UPI' },
                { id: 'cards', amount: summary.subtotal, title: 'Pay via Debit/Credit cards' },
                { id: 'wallets', amount: summary.subtotal, title: 'Pay via Wallets' },
                { id: 'netbanking', amount: summary.subtotal, title: 'Pay via NetBanking' },
              ].map((method, index) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    "py-4 px-1 sm:px-2 cursor-pointer transition-all flex items-center justify-between relative bg-white hover:bg-brand-surface-low",
                    index !== 0 && "border-t border-brand-surface-normal"
                  )}
                >
                  <div className="flex items-center gap-3 z-10">
                    <div className={cn("w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0", paymentMethod === method.id ? "border-brand-primary" : "border-brand-on-surface-variant/40")}>
                      {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                    </div>
                    <div>
                      <div className="font-bold text-[15px] text-brand-on-surface leading-none">₹{method.amount.toFixed(2)}</div>
                      <div className="font-sans text-[11px] text-brand-on-surface-variant mt-1">{method.title}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center z-10">
                    {method.id === 'cod' && <Truck size={28} className="opacity-50" />}
                    {method.id === 'upi' && <img src="/upi-removebg-preview.png" alt="UPI" className="h-10 w-auto object-contain" />}
                    {method.id === 'cards' && <img src="/card.pngg-removebg-preview.png" alt="Cards" className="h-10 w-auto object-contain" />}
                    {method.id === 'wallets' && <img src="/wallet-removebg-preview.png" alt="Wallets" className="h-10 w-auto object-contain translate-x-3" />}
                    {method.id === 'netbanking' && <img src="/netbanking-removebg-preview.png" alt="NetBanking" className="h-10 w-auto object-contain" />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Secure Badges */}
          <div className="flex items-center justify-center gap-3 py-4 text-brand-on-surface-variant opacity-40">
            <ShieldCheck size={14} />
            <span className="font-sans text-[8px] uppercase tracking-widest font-bold">Secure SSL Checkout</span>
          </div>

          <button
            disabled={isProcessing}
            onClick={handlePayNow}
            className="w-full mt-6 bg-black text-white py-4 rounded-2xl font-sans font-bold text-sm uppercase tracking-[0.2em] hover:bg-black/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-black/20 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShieldCheck size={20} />
            )}
            {isProcessing ? 'Processing...' : `Pay ₹${payableAmount.toFixed(0)}`}
          </button>
        </div>
      </main>

      {/* Mock Razorpay Modal for Demo */}
      <AnimatePresence>
        {showMockRazorpay && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80"
              onClick={() => {
                setShowMockRazorpay(false);
                setIsProcessing(false);
                showSnackbar("Cancelled", "Payment cancelled", "error");
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-[#3399cc] p-6 text-white text-center">
                <h3 className="text-xl font-bold mb-1">Razorpay Checkout</h3>
                <p className="opacity-80 text-sm">Test Mode</p>
              </div>
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-[#3399cc]/10 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="text-[#3399cc]" size={32} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount to pay</p>
                  <p className="text-3xl font-bold">₹{payableAmount.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => {
                    setShowMockRazorpay(false);
                    // Simulate success
                    placeOrder({ razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substr(2, 9) });
                  }}
                  className="w-full bg-[#3399cc] text-white py-4 rounded-lg font-bold hover:bg-[#2880b0] transition-colors"
                >
                  Success Payment
                </button>
                <button
                  onClick={() => {
                    setShowMockRazorpay(false);
                    setIsProcessing(false);
                    showSnackbar("Cancelled", "Payment cancelled", "error");
                  }}
                  className="w-full text-gray-500 text-sm font-semibold hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Checkout() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </React.Suspense>
  );
}
