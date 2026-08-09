"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShoppingBag, ArrowDownUp } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { API_BASE_URL } from '@/config';
import AuthModal from '@/components/AuthModal';

export default function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = React.use(params);
  const categoryName = decodeURIComponent(name);
  const navigate = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [sortBy, setSortBy] = useState('new');

  const getSortedProducts = () => {
    let sorted = [...products];
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
    } else if (sortBy === 'alpha') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'new') {
      // Assuming newer products are at the end of the array, or have a higher _id
      sorted.sort((a, b) => (a._id > b._id ? -1 : 1));
    }
    // For 'best', we can just leave it as default or if there is a sales count, use it.
    return sorted;
  };

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(`${API_BASE_URL}/api/products?category=${encodeURIComponent(categoryName)}`)
      .then(res => res.json())
      .then(data => {
        if (active && Array.isArray(data)) setProducts(data);
      })
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [categoryName]);

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
      if (response.ok) navigate.push('/cart');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-brand-surface-lowest">

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 mt-4">
        <button
          onClick={() => navigate.back()}
          className="flex items-center gap-2 text-brand-on-surface-variant hover:text-brand-primary transition-colors font-sans font-bold text-sm mb-4"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Products Section */}
      <section className="pt-2 pb-10 bg-brand-surface-lowest">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
            <div>
              <h2 className="font-h text-[32px] font-bold mb-1">{categoryName}</h2>
              <p className="font-sans text-brand-on-surface-variant text-sm font-medium">
                {products.length} Products Found
              </p>
            </div>
            
            {/* Filter / Sort Dropdown */}
            {products.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl font-medium text-sm outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <option value="new">Newly Added</option>
                    <option value="best">Best Selling</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="alpha">Alphabetical (A-Z)</option>
                  </select>
                  <ArrowDownUp size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-brand-surface-normal p-4 space-y-4 animate-pulse">
                  <div className="aspect-[3/4] bg-brand-surface-normal/40 rounded-2xl w-full" />
                  <div className="h-3.5 bg-brand-surface-normal/50 rounded-full w-1/3" />
                  <div className="space-y-2">
                    <div className="h-5 bg-brand-surface-normal/60 rounded-full w-11/12" />
                    <div className="h-5 bg-brand-surface-normal/60 rounded-full w-2/3" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-brand-surface-normal/70 rounded-full w-1/4" />
                    <div className="h-10 w-10 bg-brand-surface-normal/70 rounded-xl" />
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              getSortedProducts().map((product) => {
                const displayPrice = product.discount_price ? product.discount_price : product.price;
                const originalPrice = product.discount_price ? product.price : undefined;
                const isSoldOut = product.stock <= 0;
                const mappedProduct: Product = {
                  _id: product._id,
                  id: product._id,
                  name: product.name,
                  category: product.category,
                  price: displayPrice,
                  originalPrice: originalPrice,
                  images: product.images || [],
                  image: product.images?.[0] || 'https://images.unsplash.com/photo-1541002442-9f5985aa8023',
                  isNew: true,
                  isSale: !!product.discount_price,
                  stock: product.stock,
                  salesTag: isSoldOut ? "Sold Out" : product.salesTag,
                  salesTagColor: isSoldOut ? "#333333" : product.salesTagColor
                };
                return (
                  <ProductCard
                    key={product._id}
                    product={mappedProduct}
                    onQuickAdd={handleQuickAdd}
                  />
                );
              })
            ) : (
              <div className="col-span-2 md:col-span-4 flex flex-col items-center justify-center py-20 text-center w-full bg-white rounded-3xl border border-brand-surface-normal">
                <div className="w-16 h-16 bg-brand-surface-low rounded-2xl flex items-center justify-center mb-4">
                  <ShoppingBag size={32} className="text-brand-on-surface-variant opacity-40" />
                </div>
                <h3 className="font-h text-xl font-bold text-brand-on-surface">No Products Found</h3>
                <p className="font-sans text-brand-on-surface-variant mt-2 max-w-sm">
                  No shoes in the <strong>{categoryName}</strong> category yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          if (pendingAction) pendingAction();
          setPendingAction(null);
        }}
      />
    </div>
  );
}
