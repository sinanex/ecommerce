"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Shield, Star, Trophy, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { API_BASE_URL } from '@/config';
import AuthModal from '@/components/AuthModal';
import heroBanner from '@/assets/Football_players_running_in_stadium_202605072331.jpeg';
import { ShoppingBag, CheckCircle2, X } from 'lucide-react';
import { useSnackbar } from '@/context/SnackbarContext';





export default function HomeClient() {
  const { showSnackbar } = useSnackbar();
  const navigate = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showSpinUpMessage, setShowSpinUpMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isAddingBulk, setIsAddingBulk] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const timer = setTimeout(() => {
      if (active) {
        setShowSpinUpMessage(true);
      }
    }, 5000);

    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (active && Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => {
        if (active) {
          setLoading(false);
          setShowSpinUpMessage(false);
          clearTimeout(timer);
        }
      });

    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        if (active && Array.isArray(data)) setCategories(data);
      })
      .catch(err => console.error("Error fetching categories:", err));

    fetch(`${API_BASE_URL}/api/banner`)
      .then(res => res.json())
      .then(data => {
        if (active && Array.isArray(data)) setBanners(data);
      })
      .catch(err => console.error("Error fetching banners:", err));

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  // Carousel Auto-play
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const toggleSelection = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAdd = async () => {
    if (selectedProductIds.length === 0) return;

    const token = localStorage.getItem('userToken');
    if (!token) {
      setPendingAction(() => handleBulkAdd);
      setIsAuthModalOpen(true);
      return;
    }

    setIsAddingBulk(true);
    try {
      const items = selectedProductIds.map(id => ({ productId: id, size: 'M', quantity: 1 }));
      const response = await fetch(`${API_BASE_URL}/api/users/cart/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });

      if (response.ok) {
        navigate.push('/cart');
      } else {
        showSnackbar("Error", "Failed to add items to cart", "error");
      }
    } catch (err) {
      showSnackbar("Error", "Connection error", "error");
    } finally {
      setIsAddingBulk(false);
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('userToken');
    if (!token) {
      setPendingAction(() => () => handleQuickAdd(e, product));
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product._id, size: 'M', quantity: 1 })
      });

      if (response.ok) {
        navigate.push('/cart');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="pt-20">

        {loading ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              {/* Pulsing Logo */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-8"
              >
                <img src="/logo.png" alt="6YARD" className="h-16 w-auto object-contain filter drop-shadow-md" />
              </motion.div>

              {/* Premium Spinner */}
              <div className="relative w-12 h-12 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 rounded-full border-4 border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent"
                />
              </div>

              {/* Animating Loading Text */}
              <h2 className="font-h text-lg font-bold tracking-wider text-brand-on-surface uppercase mb-2">
                Loading
              </h2>

              <AnimatePresence>
                {showSpinUpMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-sans text-xs text-brand-on-surface-variant/75 text-center max-w-xs mt-2 leading-relaxed"
                  >
                    Our server is booting up. This might take a few seconds. Thank you for your patience!
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            {banners.length > 0 && (
              <section className="relative h-[55vh] w-full overflow-hidden bg-black md:hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={currentBannerIndex}
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.5 }
                    }}
                    className="absolute inset-0"
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={banners[currentBannerIndex]?.imageUrl || heroBanner}
                      alt="Sports hero"
                      fetchPriority="high"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end px-6 md:px-[50px] pb-12 md:pb-20 w-full">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-3xl"
                      >
                        {banners[currentBannerIndex]?.title && (
                          <h1 className="font-h text-white mb-3 md:mb-6 text-[32px] md:text-[72px] leading-[1] font-black uppercase italic tracking-tighter">
                            {banners[currentBannerIndex].title}
                          </h1>
                        )}
                        {banners[currentBannerIndex]?.subtitle && (
                          <p className="font-sans text-sm md:text-xl text-white/70 mb-6 md:mb-10 max-w-xl leading-relaxed">
                            {banners[currentBannerIndex].subtitle}
                          </p>
                        )}
                        {banners[currentBannerIndex]?.buttonText && (
                          <button
                            onClick={() => navigate.push(banners[currentBannerIndex]?.linkUrl || '/')}
                            className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 md:px-12 md:py-5 rounded-xl md:rounded-2xl font-sans font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs transition-all hover:scale-[1.05] shadow-2xl shadow-brand-primary/40 cursor-pointer active:scale-95"
                          >
                            {banners[currentBannerIndex].buttonText}
                          </button>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Carousel Indicators */}
                {banners.length > 1 && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentBannerIndex(idx)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-500",
                          currentBannerIndex === idx ? "w-12 bg-brand-primary" : "w-3 bg-white/30 hover:bg-white/60"
                        )}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Categories Section */}
            {categories.length > 0 && (
              <section className="py-3 bg-white w-full">
                <div className="px-2 md:px-[50px] w-full">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {categories.map((cat, idx) => (
                      <motion.div
                        key={cat._id || cat.name}
                        className="group cursor-pointer transition-all duration-300 relative flex flex-col"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => navigate.push(`/category/${encodeURIComponent(cat.name)}`)}
                      >
                        {cat.imageUrl ? (
                          <div className="w-full aspect-[2/3] overflow-hidden rounded-xl bg-brand-surface-low">
                            <img
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              src={cat.imageUrl}
                              alt={cat.name}
                            />
                          </div>
                        ) : (
                          <div className="w-full aspect-[2/3] rounded-xl bg-brand-surface-low flex items-center justify-center">
                            <div className="font-h text-brand-on-surface-variant opacity-20 text-6xl">?</div>
                          </div>
                        )}
                        <p className="font-h text-base font-bold text-brand-on-surface text-center mt-2 tracking-wide">{cat.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}



        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            if (pendingAction) pendingAction();
            setPendingAction(null);
          }}
        />

      </div>
    </>
  );
}
