"use client";

import React, { useState, useEffect } from 'react';
import { Settings, ShoppingBag, ShoppingCart, CreditCard, MapPin, Heart, LogOut, ChevronRight, Bell, ShieldCheck, User as UserIcon, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config';
import { useSnackbar } from '@/context/SnackbarContext';

export default function Profile() {
  const { showSnackbar } = useSnackbar();
  const navigate = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate.push('/');
      return;
    }

    fetch(`${API_BASE_URL}/api/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setNewName(data.name || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  const handleUpdateName = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsEditingName(false);
      }
    } catch (err) {
      showSnackbar("Error", "Failed to update name", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    navigate.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', path: '/orders', color: 'text-blue-500' },
    { icon: ShoppingCart, label: 'My Cart', path: '/cart', color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-brand-surface pt-24 pb-40">
      <main className="max-w-2xl mx-auto px-6">
        {/* Profile Card */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-brand-surface-normal mb-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />

          <div className="flex flex-col items-center text-center relative z-10">
            {/* Profile Image removed as per "venda" request */}
            <div className="w-20 h-20 bg-brand-surface-low rounded-full flex items-center justify-center mb-5 text-brand-primary border border-brand-surface-normal">
              <UserIcon size={32} />
            </div>

            {isEditingName ? (
              <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-normal rounded-xl text-center font-h text-xl font-bold"
                  placeholder="Enter your name"
                  autoFocus
                />
                <div className="flex gap-2 w-full">
                  <button onClick={handleUpdateName} className="flex-1 bg-brand-primary text-white py-2 rounded-lg font-sans font-bold text-xs uppercase tracking-widest">Save</button>
                  <button onClick={() => setIsEditingName(false)} className="flex-1 bg-brand-surface-low text-brand-on-surface-variant py-2 rounded-lg font-sans font-bold text-xs uppercase tracking-widest">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h2 className="font-h text-2xl md:text-3xl font-black text-brand-on-surface mb-1">
                    {user?.name || 'Set Name'}
                  </h2>
                  <button onClick={() => setIsEditingName(true)} className="p-1.5 hover:bg-brand-surface-low rounded-lg transition-colors text-brand-primary">
                    <Edit2 size={16} />
                  </button>
                </div>
                <p className="font-sans text-brand-on-surface-variant text-sm font-medium opacity-60">
                  +91 {user?.phone}
                </p>
              </>
            )}
          </div>
        </section>

        {/* Menu Items */}
        <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-surface-normal">
          <div className="divide-y divide-brand-surface-normal">
            {menuItems.map((item, idx) => (
              <Link
                key={item.label}
                href={item.path}
                className="flex items-center justify-between p-4 md:p-5 hover:bg-brand-surface-low transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl bg-brand-surface-lowest border border-brand-surface-normal flex items-center justify-center transition-all group-hover:scale-110 font-bold", item.color)}>
                    <item.icon size={18} />
                  </div>
                  <span className="font-h text-base font-bold text-brand-on-surface">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-brand-on-surface-variant opacity-40 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </section>

        <button
          onClick={handleLogout}
          className="w-full mt-6 p-4 flex items-center justify-center gap-2 bg-white text-red-500 rounded-2xl font-h font-bold hover:bg-red-50 transition-all border border-brand-surface-normal active:scale-95 text-sm shadow-sm"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </main>
    </div>
  );
}
