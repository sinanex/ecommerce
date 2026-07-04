"use client";

import React from 'react';
import { Send, Package } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

// Checkmark that draws itself in with a stroke animation
function AnimatedCheck() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
      className="relative w-28 h-28 flex items-center justify-center mb-8"
    >
      {/* Expanding pulse rings */}
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full bg-green-400"
          initial={{ opacity: 0.5, scale: 0.6 }}
          animate={{ opacity: 0, scale: 1.8 }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            repeatDelay: 0.4,
            delay: 0.4 + i * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}

      <div className="relative w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-sm border border-green-200 z-10">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <motion.path
            d="M12 25L20 33L36 15"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
          />
        </svg>
      </div>

      {/* Little confetti burst */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 60;
        return (
          <motion.span
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: i % 2 === 0 ? '#22c55e' : '#facc15',
              top: '50%',
              left: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
            }}
            transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
          />
        );
      })}
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

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
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          <motion.div variants={itemVariants}>
            <AnimatedCheck />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-h text-4xl md:text-5xl font-black text-brand-on-surface uppercase tracking-tight mb-4"
          >
            Thank you for your order!
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="font-sans text-brand-on-surface-variant text-lg mb-12 max-w-lg"
          >
            Your order has been successfully placed.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="bg-white border border-brand-surface-normal rounded-2xl p-8 w-full shadow-sm text-left mb-10"
          >
            <h3 className="font-h text-xl font-bold mb-6 border-b border-brand-surface-normal pb-4">
              Order Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant mb-1">
                  Order ID
                </p>
                <p className="font-h text-lg font-bold">
                  {order._id?.slice(-8).toUpperCase()}
                </p>
              </div>

              <div>
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant mb-1">
                  Payment Method
                </p>
                <p className="font-sans text-base font-medium">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  {order.paymentMethod === 'cod' ? ` (Adv: ₹${order.advancePaid})` : ''}
                </p>
              </div>

              <div>
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant mb-1">
                  Shipping Address
                </p>
                <p className="font-sans text-base font-medium">
                  {order.shippingAddress?.name}
                  <br />
                  {order.shippingAddress?.address}, {order.shippingAddress?.locality}
                  <br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                  {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
          >
            <Link
              href="/orders"
              className="w-full sm:w-auto bg-brand-surface-low border-2 border-brand-primary text-brand-primary px-8 py-4 rounded-xl font-sans font-bold text-sm uppercase tracking-widest hover:bg-brand-primary hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Package size={18} />
              Manage Order
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto bg-brand-primary text-white px-8 py-4 rounded-xl font-sans font-bold text-sm uppercase tracking-widest hover:bg-brand-primary-hover active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Continue Shopping
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}