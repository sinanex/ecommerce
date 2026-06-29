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

  const [paymentMethod, setPaymentMethod] = useState('online');
  const [showMockRazorpay, setShowMockRazorpay] = useState(false);

  // Compute dynamic shipping and total
  const codAmount = settings?.codDeliveryAmount || 100;
  const dynamicShippingCost = paymentMethod === 'online' ? 0 : codAmount;
  const dynamicTotal = summary.subtotal + dynamicShippingCost;
  const payableAmount = paymentMethod === 'cod' ? codAmount : dynamicTotal;

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
        paymentMethod: paymentMethod,
        totalAmount: dynamicTotal,
        shippingCharge: dynamicShippingCost,
        subtotal: summary.subtotal,
        razorpayPaymentId: paymentDetails?.razorpayPaymentId,
        razorpayOrderId: paymentDetails?.razorpayOrderId,
        razorpaySignature: paymentDetails?.razorpaySignature,
        advancePaid: paymentMethod === 'cod' ? (settings?.codDeliveryAmount || 60) : summary.total
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

      // Real Razorpay Integration
      const options = {
        key: key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "6YARD",
        description: paymentMethod === 'cod' ? "Advance Payment for COD" : "Order Payment",
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
          contact: address.phone
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
        <title>Secure Checkout | 6YARD</title>
      </>

      <main className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate.back()} className="p-2 hover:bg-brand-surface-normal rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-h text-[32px] font-bold text-brand-on-surface uppercase italic">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">

            {/* Step 1: Delivery Address (Confirmed) */}
            <section className="bg-white p-8 rounded-3xl border border-brand-surface-normal shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-h text-2xl font-bold flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                    <CheckCircle2 size={16} />
                  </span>
                  Shipping Address
                </h2>
                <button onClick={() => navigate.push('/cart?changeAddress=true')} className="text-brand-primary font-bold text-xs uppercase tracking-widest hover:underline">
                  Change
                </button>
              </div>

              <div className="bg-brand-surface-low rounded-2xl p-6 border border-brand-surface-normal flex gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-on-surface-variant shadow-sm flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-brand-on-surface text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">{address.addressType}</span>
                    <h3 className="font-bold text-brand-on-surface">{address.name}</h3>
                  </div>
                  <p className="font-sans text-sm text-brand-on-surface-variant leading-relaxed">
                    {address.address}, {address.locality}<br />
                    {address.city}, {address.state} - <span className="font-bold">{address.pincode}</span>
                  </p>
                  <p className="font-sans text-sm font-bold text-brand-on-surface mt-2">{address.phone}</p>
                </div>
              </div>
            </section>

            {/* Step 2: Payment Method */}
            <section className="bg-white p-8 rounded-3xl border border-brand-surface-normal shadow-sm">
              <h2 className="font-h text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm">2</span>
                Payment Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'online', name: 'Online Payment', icon: QrCode, subtitle: 'Pay via UPI, QR Code, Cards, Netbanking' },
                  { id: 'cod', name: 'Cash on Delivery', icon: Truck, subtitle: `Requires ₹${settings?.codDeliveryAmount || 60} Advance` },
                ].map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      "p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4",
                      paymentMethod === method.id ? "border-brand-primary bg-brand-primary/5" : "border-brand-surface-normal hover:border-brand-primary/30"
                    )}
                  >
                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5", paymentMethod === method.id ? "border-brand-primary" : "border-brand-surface-dim")}>
                      {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                    </div>
                    <div>
                      <span className="font-sans font-bold text-brand-on-surface block mb-1 flex items-center gap-2">
                        {method.id === 'online' && <QrCode size={16} className="text-brand-primary" />}
                        {method.name}
                      </span>
                      <span className="font-sans text-xs text-brand-on-surface-variant">{method.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {paymentMethod === 'cod' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 bg-brand-surface-low border border-brand-surface-normal p-5 rounded-2xl flex items-start gap-3"
                  >
                    <ShieldCheck className="text-brand-primary shrink-0" size={20} />
                    <div>
                      <p className="font-sans text-sm text-brand-on-surface-variant leading-relaxed">
                        To confirm your COD order and prevent fake orders, an advance payment of <strong className="text-brand-on-surface">₹{settings?.codDeliveryAmount || 60}</strong> is required.
                        The remaining amount will be collected at the time of delivery.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
            <section className="bg-white p-8 rounded-3xl border border-brand-surface-normal shadow-lg shadow-brand-primary/5">
              <h4 className="font-h font-bold text-xl text-brand-on-surface mb-8">Order Summary</h4>

              <div className="space-y-6 mb-8">
                {cartItems.map((item: any) => (
                  <div key={item._id} className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-brand-surface-low rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <h5 className="font-h font-bold text-brand-on-surface text-sm line-clamp-1">{item.product?.name}</h5>
                      <p className="font-sans text-[10px] text-brand-on-surface-variant mt-1 uppercase tracking-widest font-bold">Size: {item.size} • Qty: {item.quantity}</p>
                      <p className="font-h font-bold text-brand-primary mt-1">₹{((item.product?.discount_price || item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 font-sans text-sm border-t border-brand-surface-normal pt-6">
                <div className="flex justify-between items-center text-brand-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-bold text-brand-on-surface">₹{summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-brand-on-surface-variant">
                  <span>Shipping</span>
                  <span className={cn("font-bold uppercase tracking-widest text-xs", dynamicShippingCost === 0 ? "text-green-600" : "text-brand-on-surface")}>
                    {dynamicShippingCost === 0 ? 'FREE' : `₹${dynamicShippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="h-px bg-brand-surface-normal my-2" />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-h text-lg font-bold text-brand-on-surface">Total</span>
                  <span className="font-h text-2xl font-black text-brand-primary">₹{dynamicTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={handlePayNow}
                className="w-full mt-10 bg-brand-primary text-white py-4 rounded-2xl font-sans font-bold text-xs uppercase tracking-[0.2em] hover:bg-brand-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-primary/40 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShieldCheck size={20} />
                )}
                {isProcessing ? 'Processing...' : `Pay ₹${payableAmount.toFixed(2)}`}
              </button>
            </section>

            <div className="bg-brand-surface-low p-6 rounded-2xl border border-brand-surface-normal flex flex-col items-center gap-3">
              <div className="flex gap-4 text-brand-on-surface-variant opacity-40">
                <ShieldCheck size={20} />
                <Truck size={20} />
                <CreditCard size={20} />
              </div>
              <p className="font-sans text-[10px] uppercase tracking-[0.15em] font-black text-brand-on-surface-variant/60 text-center">
                Secure SSL Encrypted Checkout
              </p>
            </div>
          </aside>
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
