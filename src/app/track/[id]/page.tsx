"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Circle, Truck, MapPin, PackageCheck, Phone, MessageSquare, ChevronRight, ShoppingBag, Package, PartyPopper } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function formatDateRange(from: Date, to: Date): string {
  if (from.getMonth() === to.getMonth()) {
    return `${formatDate(from)} - ${to.getDate()}`;
  }
  return `${formatDate(from)} - ${formatDate(to)}`;
}

export default function TrackOrder() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = React.useState<any>(null);
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token || !id) return;

    Promise.all([
      fetch(`${API_BASE_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/settings`).then(res => res.json())
    ])
      .then(([orderData, settingsData]) => {
        setOrder(orderData);
        setSettings(settingsData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!order || order.message) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center font-h font-bold text-xl">
        Order not found
      </div>
    );
  }

  // Calculate dates from order createdAt using settings
  const purchasedDate = new Date(order.createdAt || Date.now());
  const procFrom = settings?.processingTimeFrom ?? 2;
  const procTo = settings?.processingTimeTo ?? 4;
  const delFrom = settings?.deliveryTimeFrom ?? 5;
  const delTo = settings?.deliveryTimeTo ?? 7;

  const processingStart = addDays(purchasedDate, 1);
  const processingEnd = addDays(purchasedDate, procTo);
  const deliveryStart = addDays(purchasedDate, delFrom);
  const deliveryEnd = addDays(purchasedDate, delTo);


  return (
    <div className="min-h-screen bg-brand-surface pt-24 pb-40">
      <main className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-xs font-sans text-brand-on-surface-variant mb-4 uppercase tracking-widest opacity-80">
            <Link className="hover:text-brand-primary transition-colors" href="/">Home</Link>
            <ChevronRight size={12} className="opacity-60" />
            <Link className="hover:text-brand-primary transition-colors" href="/orders">Orders</Link>
            <ChevronRight size={12} className="opacity-60" />
            <span className="text-brand-on-surface font-black">Track Order</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => router.push('/orders')}
            className="flex items-center gap-2 text-brand-on-surface-variant hover:text-brand-primary transition-colors font-sans font-bold text-sm mb-6 cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {/* Order Details */}
          <section className="bg-white rounded-[32px] p-8 shadow-xl border border-brand-surface-normal">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <p className="font-sans font-black text-xs uppercase tracking-widest text-brand-on-surface-variant opacity-60 mb-2">Order ID</p>
                <p className="font-h text-xl font-bold text-brand-on-surface">{order._id?.slice(-8).toUpperCase()}</p>
              </div>

              <div>
                <p className="font-sans font-black text-xs uppercase tracking-widest text-brand-on-surface-variant opacity-60 mb-2">Status</p>
                <span className={cn(
                  "font-sans text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border inline-block mt-0.5",
                  order.status === 'Delivered' ? "bg-green-50 text-green-600 border-green-200" :
                  order.status === 'Shipped' ? "bg-amber-50 text-amber-600 border-amber-200" :
                  "bg-blue-50 text-blue-600 border-blue-200"
                )}>
                  {order.status || 'Processing'}
                </span>
              </div>
              
              <div>
                <p className="font-sans font-black text-xs uppercase tracking-widest text-brand-on-surface-variant opacity-60 mb-2">Total Amount</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-h text-xl font-bold text-brand-primary">
                    ₹{order.paymentMethod === 'cod' ? (order.totalAmount - (order.advancePaid || 60)).toFixed(2) : order.totalAmount?.toFixed(2)}
                  </p>
                  <span className="text-[10px] uppercase font-black tracking-widest bg-brand-surface-low px-2 py-1 rounded-md text-brand-on-surface-variant opacity-80 border border-brand-surface-normal">
                    {order.paymentMethod === 'cod' ? 'COD' : 'Paid'}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-sans font-black text-xs uppercase tracking-widest text-brand-on-surface-variant opacity-60 mb-2">Estimated Delivery</p>
                <p className="font-h text-xl font-bold text-brand-on-surface">{formatDateRange(deliveryStart, deliveryEnd)}</p>
              </div>

              {order.trackingId && (
                <div>
                  <p className="font-sans font-black text-xs uppercase tracking-widest text-brand-on-surface-variant opacity-60 mb-2">Tracking ID</p>
                  <p className="font-h text-xl font-bold text-brand-on-surface tracking-wider">{order.trackingId}</p>
                </div>
              )}
            </div>
          </section>

          {/* Items Section */}
          <section className="bg-white rounded-[32px] p-8 shadow-xl border border-brand-surface-normal">
            <h3 className="font-h text-2xl font-bold mb-8">Items in Order</h3>
            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-5 items-center p-4 bg-brand-surface-low rounded-2xl border border-brand-surface-normal">
                  <div className="w-20 h-24 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm border border-brand-surface-normal/50">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-h text-lg font-bold text-brand-on-surface">{item.name}</h4>
                    <p className="font-sans text-xs uppercase tracking-widest font-black text-brand-on-surface-variant opacity-60 mt-1">Size: {item.size} • Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-h font-black text-xl text-brand-primary">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Support Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <section className="bg-white p-8 rounded-[32px] border border-brand-surface-normal shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-brand-surface-low flex items-center justify-center text-brand-primary mb-6">
                <Phone size={32} />
              </div>
              <h3 className="font-h text-xl font-bold mb-2">Need Help?</h3>
              <p className="font-sans text-sm text-brand-on-surface-variant opacity-60 leading-relaxed mb-8">
                Our support team is available for delivery inquiries.
              </p>
              <div className="w-full space-y-3">
                  {order.trackingId && (
                    <a
                      href={`https://myspeedpost.com/?n=${order.trackingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-brand-primary text-white py-4 rounded-xl font-sans font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/20"
                    >
                      <Truck size={18} />
                      Track Shipment
                    </a>
                  )}
                <a
                  href="https://wa.me/919292007150"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white py-4 rounded-xl font-sans font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest shadow-xl"
                >
                  <MessageSquare size={18} />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </section>

          <section className="bg-brand-surface-low p-6 rounded-[32px] border border-brand-surface-normal">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-brand-primary shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <p className="font-sans font-black text-xs uppercase tracking-widest text-brand-on-surface-variant opacity-60 mb-1">Delivery Address</p>
                <p className="font-h font-bold text-brand-on-surface">{order.shippingAddress?.name}</p>
                <p className="font-sans text-xs text-brand-on-surface-variant mt-1 leading-relaxed">
                  {order.shippingAddress?.address}, {order.shippingAddress?.locality}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
