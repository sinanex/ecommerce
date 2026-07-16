import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  key?: string | number;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onQuickAdd?: (e: React.MouseEvent, product: Product) => void;
}

export default function ProductCard({ product, isSelectable, isSelected, onSelect, onQuickAdd }: ProductCardProps) {
  return (
    <motion.div
      className="group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] bg-brand-surface-normal rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
          <Image
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />

          {product.salesTag && (
            <div
              className="absolute top-2 left-2 text-white text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tight pointer-events-none select-none z-10 shadow-sm"
              style={{ backgroundColor: product.salesTagColor || '#ff0000' }}
            >
              {product.salesTag}
            </div>
          )}

          {isSelectable && (
            <div className="absolute top-4 left-4 z-20">
              <div
                className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                  isSelected ? "bg-brand-primary border-brand-primary" : "bg-white/50 border-white backdrop-blur-sm"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect?.(product._id);
                }}
              >
                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
              </div>
            </div>
          )}

          <button
            onClick={(e) => onQuickAdd?.(e, product)}
            className="absolute bottom-4 right-4 bg-white text-brand-on-surface p-3 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90 hover:bg-brand-surface-bright z-20"
          >
            <ShoppingCart size={20} />
          </button>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-brand-on-surface-variant opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 z-10"
          >
            <Heart size={18} />
          </button>
        </div>
      </Link>

      <h3 className="font-sans text-xs leading-tight font-bold text-brand-on-surface mb-0.5 group-hover:text-brand-primary transition-colors line-clamp-2">{product.name}</h3>
      <div className="flex items-center gap-1.5">
        <p className="font-h text-sm text-brand-primary font-bold">₹{product.price.toFixed(2)}</p>
        {product.originalPrice && (
          <p className="font-h text-brand-on-surface-variant text-[10px] line-through opacity-50">
            ₹{product.originalPrice.toFixed(2)}
          </p>
        )}
      </div>
    </motion.div>
  );
}
