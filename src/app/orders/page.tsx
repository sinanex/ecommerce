"use client";

import React from 'react';
import { Package, ChevronRight, ArrowLeft, Search, Truck, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Order } from '@/types';

import { API_BASE_URL } from '@/config';

export default function Orders() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      router.push('/');
      return;
    }

    fetch(`${API_BASE_URL}/api/orders/my-orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const filteredOrders = React.useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(order => {
      const orderIdMatches = order._id?.toLowerCase().includes(query);
      const itemsMatch = order.items?.some((item: any) => 
        item.name?.toLowerCase().includes(query)
      );
      return orderIdMatches || itemsMatch;
    });
  }, [orders, searchQuery]);

  return (
    <div className="min-h-screen bg-brand-surface pt-24 pb-40">
      <main className="max-w-3xl mx-auto px-6 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-sans text-brand-on-surface-variant mb-8 uppercase tracking-widest opacity-80">
          <Link className="hover:text-brand-primary transition-colors" href="/">Home</Link>
          <ChevronRight size={12} className="opacity-60" />
          <Link className="hover:text-brand-primary transition-colors" href="/profile">Profile</Link>
          <ChevronRight size={12} className="opacity-60" />
          <span className="text-brand-on-surface font-black">My Orders</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-brand-on-surface-variant hover:text-brand-primary transition-colors font-sans font-bold text-sm mb-6 cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="font-h text-3xl md:text-[40px] font-bold text-brand-on-surface leading-none uppercase tracking-tight">My Orders</h1>
        </div>

        {/* Search Bar */}
        {orders.length > 0 && (
          <div className="relative mb-10 w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-brand-on-surface-variant opacity-40 group-focus-within:text-brand-on-surface transition-colors" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by order ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-brand-surface-normal rounded-full py-3 pl-11 pr-10 text-brand-on-surface placeholder-brand-on-surface-variant/40 outline-none focus:border-brand-primary transition-all duration-300 font-sans font-medium text-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-on-surface-variant hover:text-brand-on-surface transition-colors cursor-pointer"
              >
                <div className="p-1 hover:bg-brand-surface-low rounded-full">
                  <X size={14} strokeWidth={2.5} />
                </div>
              </button>
            )}
          </div>
        )}

        {/* Order List */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[32px] p-6 md:p-8 border border-brand-surface-normal animate-pulse shadow-sm">
                <div className="flex justify-between items-center pb-6 border-b border-brand-surface-normal">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-brand-surface-normal rounded"></div>
                    <div className="h-4 w-32 bg-brand-surface-normal rounded"></div>
                  </div>
                  <div className="space-y-2 flex flex-col items-end">
                    <div className="h-3 w-16 bg-brand-surface-normal rounded"></div>
                    <div className="h-4 w-24 bg-brand-surface-normal rounded"></div>
                  </div>
                </div>
                <div className="flex gap-6 py-6">
                  <div className="w-20 h-20 bg-brand-surface-normal rounded-xl shrink-0"></div>
                  <div className="flex-grow space-y-3 py-2">
                    <div className="h-5 w-2/3 bg-brand-surface-normal rounded"></div>
                    <div className="h-3 w-1/4 bg-brand-surface-normal rounded"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-brand-surface-normal">
                  <div className="h-10 w-36 bg-brand-surface-normal rounded-xl"></div>
                  <div className="h-8 w-24 bg-brand-surface-normal rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-brand-surface-normal p-8 max-w-md mx-auto shadow-sm">
            <div className="w-20 h-20 mx-auto bg-brand-surface-low text-brand-on-surface-variant opacity-60 rounded-full flex items-center justify-center mb-6">
              <Package size={36} className="text-brand-primary" />
            </div>
            <h2 className="font-h text-xl font-bold text-brand-on-surface mb-2">No orders found</h2>
            <p className="font-sans text-brand-on-surface-variant opacity-70 text-sm mb-8">Looks like you haven't placed any orders yet.</p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 rounded-xl font-sans font-bold hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/10 cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[32px] border border-brand-surface-normal p-8 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 mx-auto bg-brand-surface-low text-brand-on-surface-variant opacity-60 rounded-full flex items-center justify-center mb-4">
              <Search size={28} className="text-brand-primary" />
            </div>
            <h2 className="font-h text-lg font-bold text-brand-on-surface mb-2">No matches found</h2>
            <p className="font-sans text-brand-on-surface-variant opacity-70 text-sm mb-6">We couldn't find any orders matching "{searchQuery}".</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="bg-brand-surface-low text-brand-on-surface border border-brand-surface-normal px-6 py-3 rounded-xl font-sans font-bold hover:bg-brand-surface-high active:scale-95 transition-all text-xs uppercase tracking-widest cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, idx) => {
              const mainItem = order.items?.[0] || {};
              const itemsCount = order.items?.length || 0;
              const dateObj = new Date(order.createdAt);
              const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const originalIdx = orders.findIndex(o => o._id === order._id);
              const orderNum = String(orders.length - originalIdx).padStart(4, '0');

              return (
                <motion.section
                  key={order._id}
                  className="group bg-white rounded-[32px] p-6 md:p-8 shadow-xl shadow-brand-primary/5 border border-brand-surface-normal hover:border-brand-primary/20 hover:shadow-brand-primary/10 transition-all cursor-pointer"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/track/${order._id}`} className="block">
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-brand-surface-normal">
                      <div>
                        <span className="block text-[10px] font-sans font-black text-brand-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Order Placed</span>
                        <span className="font-h text-sm font-bold text-brand-on-surface">{formattedDate}</span>
                      </div>
                      <div className="sm:text-right">
                        <span className="block text-[10px] font-sans font-black text-brand-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Order ID</span>
                        <span className="font-sans text-sm font-bold text-brand-primary tracking-wider">#{orderNum}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="flex gap-6 py-6 items-center">
                      <div className="w-20 h-20 bg-brand-surface-low rounded-xl overflow-hidden shrink-0 shadow-sm border border-brand-surface-normal/50">
                        {mainItem.image ? (
                          <img className="w-full h-full object-cover" src={mainItem.image} alt={mainItem.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-brand-on-surface-variant">No Image</div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-h text-lg font-bold text-brand-on-surface truncate pr-4">{mainItem.name || 'Unknown Product'}</h3>
                        <p className="font-sans text-xs text-brand-on-surface-variant font-medium mt-1">
                          {itemsCount > 1 ? `+ ${itemsCount - 1} other items` : '1 Item'}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center">
                        <ChevronRight size={22} className="text-brand-on-surface-variant opacity-40 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-brand-surface-normal">
                      <div>
                        {order.trackingId ? (
                          <a
                            href={`https://myspeedpost.com/?n=${order.trackingId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 bg-brand-surface-low px-4 py-2 rounded-xl border border-brand-surface-normal hover:border-brand-primary/30 hover:bg-white text-brand-primary font-sans text-xs font-bold uppercase tracking-wider transition-all"
                          >
                            <Truck size={14} />
                            <span>Track: {order.trackingId}</span>
                          </a>
                        ) : (
                          <span className="text-xs font-sans text-brand-on-surface-variant opacity-60">Standard Shipping</span>
                        )}
                      </div>
                      <div className="sm:text-right flex items-baseline justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <span className="font-sans text-xs text-brand-on-surface-variant opacity-60">Total Amount:</span>
                        <span className="font-h text-2xl font-black text-brand-on-surface">
                          ₹{order.totalAmount?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
