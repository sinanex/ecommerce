"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, X } from 'lucide-react';
import { API_BASE_URL } from '@/config';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function SearchPage() {
  const navigate = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [randomProducts, setRandomProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data);
          const shuffled = [...data].sort(() => 0.5 - Math.random()).slice(0, 10);
          setRandomProducts(shuffled);
          setFilteredProducts(shuffled);
        }
      })
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(randomProducts);
      return;
    }

    const query = searchQuery.toLowerCase();

    // Priority 1: Match Name
    const nameMatches = allProducts.filter(p => p.name?.toLowerCase().includes(query));

    const isCategoryMatch = (p: any, q: string) => {
      if (Array.isArray(p.category)) {
        return p.category.some((c: string) => c?.toLowerCase().includes(q));
      }
      return typeof p.category === 'string' && p.category.toLowerCase().includes(q);
    };

    // Priority 2: Match Category
    const categoryMatches = allProducts.filter(p => {
      if (p.name?.toLowerCase().includes(query)) return false;
      return isCategoryMatch(p, query);
    });

    // Priority 3: Match Description
    const descMatches = allProducts.filter(p => {
      if (p.name?.toLowerCase().includes(query) || isCategoryMatch(p, query)) return false;
      return p.description?.toLowerCase().includes(query);
    });

    setFilteredProducts([...nameMatches, ...categoryMatches, ...descMatches]);
  }, [searchQuery, allProducts]);

  return (
    <div className="min-h-screen bg-brand-surface-light pt-24 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-[50px]">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95 text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div className="relative flex-1 group max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400 group-focus-within:text-black transition-colors" size={18} />
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Search shoes, categories, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50/80 backdrop-blur-md border border-gray-100 rounded-full py-3 pl-11 pr-10 text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-black/5 transition-all duration-300 font-sans font-medium text-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-black transition-colors"
              >
                <div className="p-1 hover:bg-gray-100 rounded-full">
                  <X size={14} strokeWidth={2.5} />
                </div>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-brand-on-surface-variant font-bold animate-pulse">Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const isSoldOut = product.stock <= 0;
              const mappedProduct: Product = {
                _id: product._id,
                id: product._id,
                name: product.name,
                category: product.category,
                price: product.discount_price || product.price,
                originalPrice: product.discount_price ? product.price : undefined,
                images: product.images || [],
                image: product.images?.[0] || 'https://images.unsplash.com/photo-1541002442-9f5985aa8023',
                stock: product.stock,
                salesTag: isSoldOut ? "Sold Out" : product.salesTag,
                salesTagColor: isSoldOut ? "#333333" : product.salesTagColor,
                isNew: true,
                isSale: !!product.discount_price
              };
              return (
                <ProductCard key={product._id} product={mappedProduct} />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-surface-normal text-brand-on-surface-variant mb-4">
              <Search size={32} />
            </div>
            <h3 className="font-h text-xl font-bold mb-2">No products found</h3>
            <p className="text-brand-on-surface-variant max-w-sm mx-auto">We couldn't find anything matching "{searchQuery}". Try searching with different keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}
