"use client";

import React from 'react';
import { Send, CheckCircle2, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { } from 'next/navigation';
import Link from 'next/link';

export default function Success() {
  const [order, setOrder] = React.useState<any>(null);

  React.useEffect(() => {
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      setOrder(JSON.parse(lastOrder));
    }
  }, []);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-brand-surface text-brand-on-surface pt-32 pb-32">
      <main className="max-w-[800px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 text-green-600 shadow-sm border border-green-200">
            <CheckCircle2 size={48} strokeWidth={1.5} />
          </div>

          <h1 className="font-h text-4xl md:text-5xl font-black text-brand-on-surface uppercase tracking-tight mb-4">
            Thank you for your order!
          </h1>
          <p className="font-sans text-brand-on-surface-variant text-lg mb-12 max-w-lg">
            Your gear is being prepared for flight. Get ready to show your colors on the field! We've sent a confirmation email to you.
          </p>

          <div className="bg-white border border-brand-surface-normal rounded-2xl p-8 w-full shadow-sm text-left mb-10">
            <h3 className="font-h text-xl font-bold mb-6 border-b border-brand-surface-normal pb-4">Order Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant mb-1">Order ID</p>
                <p className="font-h text-lg font-bold">{order._id?.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant mb-1">Estimated Delivery</p>
                <p className="font-h text-lg font-bold">Within 5-7 Days</p>
              </div>
              <div>
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant mb-1">Payment Method</p>
                <p className="font-sans text-base font-medium">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  {order.paymentMethod === 'cod' ? ` (Adv: ₹${order.advancePaid})` : ''}
                </p>
              </div>
              <div>
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant mb-1">Shipping Address</p>
                <p className="font-sans text-base font-medium">
                  {order.shippingAddress?.name}<br />
                  {order.shippingAddress?.address}, {order.shippingAddress?.locality}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <Link href="/orders" className="w-full sm:w-auto bg-brand-surface-low border-2 border-brand-primary text-brand-primary px-8 py-4 rounded-xl font-sans font-bold text-sm uppercase tracking-widest hover:bg-brand-primary hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2">
              <Package size={18} />
              Manage Order
            </Link>
            <Link href="/" className="w-full sm:w-auto bg-brand-primary text-white px-8 py-4 rounded-xl font-sans font-bold text-sm uppercase tracking-widest hover:bg-brand-primary-hover active:scale-95 transition-all flex items-center justify-center gap-2">
              <Send size={18} />
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
