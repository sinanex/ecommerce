"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, Heart, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname.startsWith('/admin')) {
    return null;
  }
  const isProfile = pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/orders');

  const { totalQuantity } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    if (token) {
      router.push('/profile');
    } else {
      setIsAuthModalOpen(true);
    }
  };  return (
    <>
      <header className="fixed top-0 w-full z-50 border-b border-brand-surface-normal bg-white/80 backdrop-blur-xl shadow-sm">
        <nav className="flex justify-between items-center h-20 px-6 md:px-12 max-w-[1280px] mx-auto w-full relative">
          <Link href="/" className="shrink-0 flex items-center">
          <img src="/logo.png" alt="KITBAY" className="h-10 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 font-sans text-xs uppercase tracking-[0.15em] font-bold">
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <div className="relative">
              <Link
                href="/search"
                className="py-2 text-brand-on-surface-variant hover:text-brand-primary transition-all active:scale-95 block"
              >
                <Search size={22} />
              </Link>
            </div>
            <Link href="/cart" className="py-2 text-brand-on-surface-variant hover:text-brand-primary transition-all active:scale-95 relative">
              <ShoppingBag size={22} />
              {totalQuantity > 0 && (
                <span className="absolute top-1 right-1 bg-brand-primary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalQuantity}
                </span>
              )}
            </Link>
            <button onClick={handleProfileClick} className="py-2 text-brand-on-surface-variant hover:text-brand-primary transition-all active:scale-95">
              <User size={22} />
            </button>
          </div>
        </nav>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => router.push('/profile')}
      />
    </>
  );
}
