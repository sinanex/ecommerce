"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ShoppingBag, Heart, Shield, Truck, Verified, Star, Plus, Minus, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import { API_BASE_URL } from '@/config';
import { Product } from '@/types';
import AuthModal from '@/components/AuthModal';
import { useCart } from '@/context/CartContext';
import { useSnackbar } from '@/context/SnackbarContext';

const PRODUCT_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ38GlBp8aAxQiOSE483yc-jVtTv1lt7uPjbJPMqq3BnoBXAnwpLhriKduHt78pWPxt4xoy1fHnfGwE-Z4nwkIhmuD6SKOzj8fAilcBGsvR72hRYVnuhnY_jmPdmyIXyqjEgTmkBI6H39e7RH1PlUPj0lLJ2YJdi5szTSKj2rXwdus87pu3lNAOKiOpjwDco5G41Z4R5-DruwUZz3q6YoKdx9EFu5vVb-j5u6CZEBZVgEpiSLB8z4V6aRuzIXd4KsBh6xpiqKxvXQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCbEJMVpwIFu8oMmXCrtUm1USGw8g1BRK0aTKZvWjqjWh6mM8JkJFv-W8g9a0mG7CtCYrYmuMJkOHCkfksKbklq8DmLIGu_XTDbWlPU47PgU_Z_QjhKkygQe1WCNou2X-u6eROcgBZeudaiUxNWrJJGXf83kEvjIpWc-m9P-AlLntC3jCDrpXuBPEK72Y-vJTGsnTCXsODZf6IW9MO0Rb1mwshHlcwuSx1HIWBNMiXd1WF5HIokD1eQPtkR2jNXJG7dnrP2LVy4uJ8',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCC7tE90YgglT6siA2IUT4S8TysQKQdUIid1ZqEQ460L8rqmCexHtiiNOFwv4zuNNHX8y9MiRzed8MU4kYS_e4mvR-cfNPM7HiUwY3ttekqBePhYSEYycRI5DeeKj1gm0Jhm4ww5lHaXuAmWW0Jc8U_b938BvOuohas2NTPYWsPu02Awgj7L-Q3SWN2WwlOr1YEBz5X8IGp2JbeVghxLxdMRfUpDvwi-0l0Ac9pJ64RhfKQOv5_0X_2r28wCmanmTuT8ItByThlkKc',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDiQQyjZTQu4Fl13vJOreMurpzVLckTYpibU2t0XBZyW_i5jvFHksqJ92Amdp1P1fbP4FCKLVfxHTqqaC7-vc0DpK1DK-1aFahNxBYpx38NkntlUzdBI4sp958CRZt6_mMFud2NkIyOEGRB9Dsr5weW1ZRB3v_5GJXNPeUbnc9MThPUfgbQBY3jpuTIsRurKKwU-nA9HUc3akV8wK1ysB393fcCkKE61O_2KMJpbvOqkjGFyHv47Wq0mY5ky3Smv0H-aWnexuXhJH0'
];

const RELATED_PRODUCTS: Product[] = [
  { _id: 'rem-1', id: 'rem-1', name: 'Match Day Shorts 24/25', category: 'Training', price: 45.00, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtsxW-3BYThB30FuJIwHJ2rtE_YfYgZP0cPJNGbVT8GG5oyTAgZwqPuUgHNKR61dZf__VjyRpUfOjyfoT8hwxZ5phVhkr9j4hvU3j2RrHW0nkHdU_CvyjrueugLGgrxZXnZhfbnpT1UUCm8jwrEkLK2LOMbYYS6pzyXCMtfOif1us9e_b4vq16-p1XrrqpPN0TPp890Xio5EVJJsP3EZR4zsvBAYEWtW0jgc2lLPz2qP0QTWbGdEWy6LBp2_JBgSIysR9v7Fk7BE8', images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAtsxW-3BYThB30FuJIwHJ2rtE_YfYgZP0cPJNGbVT8GG5oyTAgZwqPuUgHNKR61dZf__VjyRpUfOjyfoT8hwxZ5phVhkr9j4hvU3j2RrHW0nkHdU_CvyjrueugLGgrxZXnZhfbnpT1UUCm8jwrEkLK2LOMbYYS6pzyXCMtfOif1us9e_b4vq16-p1XrrqpPN0TPp890Xio5EVJJsP3EZR4zsvBAYEWtW0jgc2lLPz2qP0QTWbGdEWy6LBp2_JBgSIysR9v7Fk7BE8'] },
  { _id: 'rem-2', id: 'rem-2', name: 'Home Socks 24/25', category: 'Training', price: 18.00, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-1t0-egD2l-PeCCChC_jzV3QTUqEh8aeaeDCnU5k1mwoqj32vGHGZ_cr_sukPN-sMT7EUul0AKyW0tXAefZgnHtdurIdeivHvAq43LOhK5SkgQ3LpySG2A0k33VPCqgZUBXVyWdv74QA_s3yJ7oIQVPspVGKhLmROqMrHuXJvPkV3C2EL2z3Gpu0IzsmNs96zXCr3psBs7lbwqAQJv9RR_4LDenyCPMPGZoyMSxYVXAM6b4qBJNYpx4tjYLNGYbsyUHIi4Jj6VRk', images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuA-1t0-egD2l-PeCCChC_jzV3QTUqEh8aeaeDCnU5k1mwoqj32vGHGZ_cr_sukPN-sMT7EUul0AKyW0tXAefZgnHtdurIdeivHvAq43LOhK5SkgQ3LpySG2A0k33VPCqgZUBXVyWdv74QA_s3yJ7oIQVPspVGKhLmROqMrHuXJvPkV3C2EL2z3Gpu0IzsmNs96zXCr3psBs7lbwqAQJv9RR_4LDenyCPMPGZoyMSxYVXAM6b4qBJNYpx4tjYLNGYbsyUHIi4Jj6VRk'] },
  { _id: 'rem-3', id: 'rem-3', name: 'Elite Performance Cleats', category: 'Football', price: 199.99, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQNUc3ftOij7Bj9Ezh-tRGZHvg24ciwytkQqrWSTJ1khsiZwsCf0rOM3qtsvVkq8kfUrk-ifOCbbRHyqh2D7UuzG-z7EqPHecGHCMTQPYQt-EsRWo8GvUG3p_RFySePC9SPUsZMeWfHTUwT0SAH8i-pap61Z0YVNyKw0RBfANImxjONbXnco8G2uZw_tV42iEUrY3lPJaaT3r1yJsZk74yzdL8AogwHiVuyuJgCEQ8Y4668cS2hXlPqgnvHFRfqipgEB6mxSsGaFo', images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDQNUc3ftOij7Bj9Ezh-tRGZHvg24ciwytkQqrWSTJ1khsiZwsCf0rOM3qtsvVkq8kfUrk-ifOCbbRHyqh2D7UuzG-z7EqPHecGHCMTQPYQt-EsRWo8GvUG3p_RFySePC9SPUsZMeWfHTUwT0SAH8i-pap61Z0YVNyKw0RBfANImxjONbXnco8G2uZw_tV42iEUrY3lPJaaT3r1yJsZk74yzdL8AogwHiVuyuJgCEQ8Y4668cS2hXlPqgnvHFRfqipgEB6mxSsGaFo'] },
  { _id: 'rem-4', id: 'rem-4', name: 'Anthem Jacket 24/25', category: 'Training', price: 110.00, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_sVWjkZ9pxd6d_4QyWv9cFZPk0khxtskZ2an-DetgIdgTj9OQFgu3YM5z0OTUhNr_8IgPtW7Y1GbiatnIdSbkMDJMVXr3vOls1IvUmtGKnF5nymsOcAf22N_snjPpsc53SYNV_Cx0Zfz0Nrh3SlKZJFzI2LxI7rJFqV9GA6FxxVrDGIK7o4x-2tTw94iETn6pVkJqxOAMr-2OF3sXJyypAGZZui7rv-u192RQ87LDi27XyupZDOoF6zMxi2I6tvAkSTAE9nC1rDE', images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC_sVWjkZ9pxd6d_4QyWv9cFZPk0khxtskZ2an-DetgIdgTj9OQFgu3YM5z0OTUhNr_8IgPtW7Y1GbiatnIdSbkMDJMVXr3vOls1IvUmtGKnF5nymsOcAf22N_snjPpsc53SYNV_Cx0Zfz0Nrh3SlKZJFzI2LxI7rJFqV9GA6FxxVrDGIK7o4x-2tTw94iETn6pVkJqxOAMr-2OF3sXJyypAGZZui7rv-u192RQ87LDi27XyupZDOoF6zMxi2I6tvAkSTAE9nC1rDE'] },
  { _id: 'rem-4', id: 'rem-4', name: 'Anthem Jacket 24/25', category: 'Training', price: 110.00, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_sVWjkZ9pxd6d_4QyWv9cFZPk0khxtskZ2an-DetgIdgTj9OQFgu3YM5z0OTUhNr_8IgPtW7Y1GbiatnIdSbkMDJMVXr3vOls1IvUmtGKnF5nymsOcAf22N_snjPpsc53SYNV_Cx0Zfz0Nrh3SlKZJFzI2LxI7rJFqV9GA6FxxVrDGIK7o4x-2tTw94iETn6pVkJqxOAMr-2OF3sXJyypAGZZui7rv-u192RQ87LDi27XyupZDOoF6zMxi2I6tvAkSTAE9nC1rDE', images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC_sVWjkZ9pxd6d_4QyWv9cFZPk0khxtskZ2an-DetgIdgTj9OQFgu3YM5z0OTUhNr_8IgPtW7Y1GbiatnIdSbkMDJMVXr3vOls1IvUmtGKnF5nymsOcAf22N_snjPpsc53SYNV_Cx0Zfz0Nrh3SlKZJFzI2LxI7rJFqV9GA6FxxVrDGIK7o4x-2tTw94iETn6pVkJqxOAMr-2OF3sXJyypAGZZui7rv-u192RQ87LDi27XyupZDOoF6zMxi2I6tvAkSTAE9nC1rDE'] },
];

const DeliveryTimeline = ({ settings }: { settings: any }) => {
  const [timeLeft, setTimeLeft] = useState({ hrs: 0, mins: 0 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diffMs = endOfDay.getTime() - now.getTime();
      setTimeLeft({
        hrs: Math.floor(diffMs / (1000 * 60 * 60)),
        mins: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const minProcessing = settings?.processingTimeFrom || 2;
  const maxProcessing = settings?.processingTimeTo || 4;
  const minDelivery = settings?.deliveryTimeFrom || 5;
  const maxDelivery = settings?.deliveryTimeTo || 7;

  const processMinD = new Date(); processMinD.setDate(processMinD.getDate() + minProcessing);
  const processMaxD = new Date(); processMaxD.setDate(processMaxD.getDate() + maxProcessing);

  const d1 = new Date(); d1.setDate(d1.getDate() + minProcessing + minDelivery);
  const d2 = new Date(); d2.setDate(d2.getDate() + maxProcessing + maxDelivery);

  const formatFull = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="bg-white border border-brand-surface-normal rounded-xl p-4 md:p-6 mb-6">
      <p className="font-sans text-[15px] text-gray-800 leading-relaxed mb-8">
        Order within <span className="font-bold">{timeLeft.hrs} h {timeLeft.mins} min</span> for delivery between <span className="font-bold">{formatFull(d1)} - {formatFull(d2)}</span>.
      </p>

      <div className="relative">
        <div className="absolute top-[35px] left-[15%] right-[15%] h-[1.5px] bg-gray-800 z-0"></div>

        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col items-center flex-1 bg-white">
            <ShoppingBag size={24} strokeWidth={1.5} className="text-gray-900 mb-2" />
            <div className="w-[7px] h-[7px] rounded-full bg-gray-900 ring-[6px] ring-white mb-2"></div>
            <div className="text-center bg-white px-1">
              <p className="font-bold text-[13px] text-gray-900">{formatShort(new Date())}</p>
              <p className="text-[13px] text-gray-600 mt-0.5">Purchased</p>
            </div>
          </div>

          <div className="flex flex-col items-center flex-1 bg-white">
            <Truck size={26} strokeWidth={1.5} className="text-gray-900 mb-2" />
            <div className="w-[7px] h-[7px] rounded-full bg-gray-900 ring-[6px] ring-white mb-2"></div>
            <div className="text-center bg-white px-1">
              <p className="font-bold text-[13px] text-gray-900">{formatShort(processMinD)} - {formatShort(processMaxD).split(' ')[1]}</p>
              <p className="text-[13px] text-gray-600 mt-0.5">Processing</p>
            </div>
          </div>

          <div className="flex flex-col items-center flex-1 bg-white">
            <MapPin size={24} strokeWidth={1.5} className="text-gray-900 mb-2" />
            <div className="w-[7px] h-[7px] rounded-full bg-gray-900 ring-[6px] ring-white mb-2"></div>
            <div className="text-center bg-white px-1">
              <p className="font-bold text-[13px] text-gray-900">{formatShort(d1)} - {formatShort(d2).split(' ')[1]}</p>
              <p className="text-[13px] text-gray-600 mt-0.5">Delivered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProductDetailClient() {
  const { showSnackbar } = useSnackbar();
  const { id } = useParams() as { id: string };
  const navigate = useRouter();
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ transformOrigin: 'center' });
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'cart' | 'buy' | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const [reviewsList, setReviewsList] = useState<{ rating: number, text: string, name: string, date: string, images?: string[] }[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, text: '', name: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewImages, setReviewImages] = useState<File[]>([]);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0, img.width, img.height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          }, 'image/jpeg', 0.6);
        };
        img.onerror = error => reject(error);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.text.trim() || !newReview.name.trim()) return;
    setIsSubmittingReview(true);
    try {
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const formData = new FormData();
      formData.append('rating', newReview.rating.toString());
      formData.append('text', newReview.text);
      formData.append('name', newReview.name);
      formData.append('date', dateStr);

      const previewUrls: string[] = [];

      for (const file of reviewImages) {
        const compressedFile = await compressImage(file);
        formData.append('images', compressedFile);
        previewUrls.push(URL.createObjectURL(compressedFile)); // For optimistic UI
      }

      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("Failed to submit review");

      // Assume success, update local state
      const newReviewData = { ...newReview, date: dateStr, images: previewUrls };
      setReviewsList([newReviewData, ...reviewsList]);

      // Reset form
      setNewReview({ rating: 5, text: '', name: '' });
      setReviewImages([]);
      setShowReviewForm(false);
    } catch (err) {
      showSnackbar("Error", "Failed to submit review. Please try again.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)',
    });
  };

  const handleMouseEnter = () => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomStyle({
      transformOrigin: 'center',
      transform: 'scale(1)',
    });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isZoomed && e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      setZoomStyle({
        transformOrigin: `${x}% ${y}%`,
        transform: 'scale(2.2)',
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null || touchStartY === null) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartX - endX;
    const diffY = touchStartY - endY;

    const productImages = product?.images && product.images.length > 0 ? product.images : PRODUCT_IMAGES;

    if (!isZoomed) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX > 0) {
          setActiveImage((prev) => (prev + 1) % productImages.length);
        } else {
          setActiveImage((prev) => (prev - 1 + productImages.length) % productImages.length);
        }
        setTouchStartX(null);
        setTouchStartY(null);
        return;
      }
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (isZoomed) {
        setIsZoomed(false);
        setZoomStyle({ transformOrigin: 'center', transform: 'scale(1)' });
      } else {
        setIsZoomed(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((endX - rect.left) / rect.width) * 100;
        const y = ((endY - rect.top) / rect.height) * 100;
        setZoomStyle({
          transformOrigin: `${x}% ${y}%`,
          transform: 'scale(2.2)',
        });
      }
      setLastTap(0);
    } else {
      setLastTap(now);
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  useEffect(() => {
    if (!id) return;

    // List of static mock ids
    const mockIds = ['1', '2', '3', '4', '5', '6', '7', '8', 'rem-1', 'rem-2', 'rem-3', 'rem-4'];
    if (mockIds.includes(id)) {
      setProduct({
        _id: id,
        name: id === '1' ? 'Manchester Home Kit 24/25' :
          id === '2' ? 'Elite Vapour Training Tee' :
            id === '3' ? 'London Away Kit 24/25' :
              id === '4' ? 'National Pro Match Jersey' :
                id === '5' ? 'Premium Red Kit' :
                  id === '6' ? 'Sky Blue Fan Jersey' :
                    id === '7' ? 'Pro Training Black' :
                      id === '8' ? 'National Home Kit' : 'Match Gear',
        price: id === '1' ? 89.99 : id === '2' ? 54.99 : id === '3' ? 84.99 : id === '4' ? 79.99 : 89.99,
        discount_price: undefined,
        category: 'Football',
        description: 'Blends heritage with cutting-edge HEAT.RDY technology. Designed for peak performance on the pitch and premium style in the stands.',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Red', 'White'],
        images: PRODUCT_IMAGES
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/products/${id}`).then(res => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      }),
      fetch(`${API_BASE_URL}/api/settings`).then(res => res.json()).catch(() => null)
    ])
      .then(([productData, settingsData]) => {
        setProduct(productData);
        if (settingsData) setSettings(settingsData);
        if (productData.sizes && productData.sizes.length > 0) {
          // Do not auto-select size to force user to choose
          // setSelectedSize(productData.sizes[0]);
        }
        if (productData.reviews) {
          setReviewsList(productData.reviews);
        }
      })
      .catch(err => {
        console.error("Fetch detail error:", err);
        // Default fallback if any live fetch fails
        setProduct({
          _id: id,
          name: 'Manchester Home Kit 24/25',
          price: 89.99,
          discount_price: undefined,
          category: 'Football',
          description: 'Blends heritage with cutting-edge HEAT.RDY technology. Designed for peak performance on the pitch and premium style in the stands.',
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          colors: ['Red', 'White'],
          images: PRODUCT_IMAGES
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async (skipAuthCheck = false) => {
    if (!product) return;
    if (!selectedSize) {
      showSnackbar("Warning", "Please select size", "warning");
      return;
    }

    if (!skipAuthCheck && typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setPendingAction('cart');
        setIsAuthModalOpen(true);
        return;
      }
    }

    setIsAdding(true);
    try {
      await addToCart(product, selectedSize, 1);
      navigate.push('/cart');
    } catch (err) {
      showSnackbar("Error", "Failed to add to cart", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async (skipAuthCheck = false) => {
    if (!product) return;
    if (!selectedSize) {
      showSnackbar("Warning", "Please select size", "warning");
      return;
    }

    if (!skipAuthCheck && typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setPendingAction('buy');
        setIsAuthModalOpen(true);
        return;
      }
    }

    setIsBuying(true);
    try {
      const itemId = await addToCart(product, selectedSize, 1, true);
      
      const token = localStorage.getItem('userToken');
      let defaultAddr = null;
      if (token) {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          defaultAddr = data.addresses?.find((a: any) => a.isDefault) || data.addresses?.[0] || null;
        }
      }
      
      const itemPrice = product.discount_price || product.price;
      const buyNowItem = {
        _id: itemId,
        product,
        size: selectedSize,
        quantity: 1
      };
      
      localStorage.setItem('checkoutState', JSON.stringify({
        cartItems: [buyNowItem],
        summary: { subtotal: itemPrice, shippingCost: 0, total: itemPrice },
        address: defaultAddr,
        isBuyNow: true,
        buyNowItemId: itemId
      }));

      if (!defaultAddr) {
        navigate.push('/cart?changeAddress=true&buyNow=true');
      } else {
        navigate.push('/checkout');
      }
    } catch (err) {
      showSnackbar("Error", "Failed to process order", "error");
    } finally {
      setIsBuying(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL'];
  const rawSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
  const sizes = [...rawSizes].sort((a, b) => {
    const idxA = SIZE_ORDER.indexOf(a.toUpperCase());
    const idxB = SIZE_ORDER.indexOf(b.toUpperCase());
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });
  const productImages = product.images && product.images.length > 0 ? product.images : PRODUCT_IMAGES;

  const currentPrice = product.discount_price || product.price;
  const firstImage = productImages[0];
  const schemaMarkup = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": firstImage,
    "description": product.description || `Buy premium ${product.name} at 6YARD STORE. engineered for the fans, designed for the pros.`,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": currentPrice,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <main className="max-w-[1280px] mx-auto px-6 pt-25 pb-12">


      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-sans text-brand-on-surface-variant mb-4 uppercase tracking-widest">
        <Link className="hover:text-brand-primary transition-colors" href="/">Home</Link>
        <ChevronRight size={14} />
        <Link className="hover:text-brand-primary transition-colors" href="/">Shop</Link>
        <ChevronRight size={14} />
        <span className="text-brand-on-surface font-black">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            className="relative aspect-[4/5] rounded-xl overflow-hidden bg-brand-surface-normal group cursor-zoom-in"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              alt="Main Product"
              className={cn(
                "w-full h-full object-cover select-none pointer-events-none origin-center",
                isZoomed ? "" : "transition-transform duration-300 ease-out"
              )}
              style={isZoomed ? zoomStyle : { transform: 'scale(1)', transformOrigin: 'center' }}
              src={productImages[activeImage]}
            />
            {(() => {
              const isSoldOut = product.stock !== undefined && product.stock <= 0;
              const displayTag = isSoldOut ? "Sold Out" : product.salesTag;
              const displayTagColor = isSoldOut ? "#333333" : product.salesTagColor || '#ff0000';
              if (!displayTag) return null;
              return (
                <div
                  className="absolute top-4 left-4 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] pointer-events-none select-none z-10 shadow-lg"
                  style={{ backgroundColor: displayTagColor }}
                >
                  {displayTag}
                </div>
              );
            })()}

            {/* Desktop Hint */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none hidden md:block z-10">
              Hover to Zoom
            </div>

            {/* Mobile Swipe Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full z-10 select-none pointer-events-none">
              {productImages.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    activeImage === idx ? "bg-white w-4" : "bg-white/40"
                  )}
                />
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-4 gap-4">
            {productImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "aspect-square rounded-xl overflow-hidden transition-all duration-300",
                  activeImage === idx ? "opacity-100 ring-2 ring-brand-primary ring-offset-2 scale-95" : "opacity-60 hover:opacity-100"
                )}
              >
                <img className="w-full h-full object-cover" src={img} alt={`Thumb ${idx}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
          <div>

            <h1 className="font-h text-[24px] md:text-[32px] text-brand-on-surface mt-2 mb-3 leading-[1.2] font-bold">{product.name}</h1>
            <div className="flex items-center gap-4">
              <span className="font-h text-[22px] md:text-[28px] text-brand-primary font-bold">₹{(product.discount_price || product.price).toFixed(2)}</span>
              {product.discount_price && (
                <span className="text-brand-on-surface-variant line-through text-base opacity-40">₹{product.price.toFixed(2)}</span>
              )}
            </div>
          </div>


          {/* Size Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] border-b border-brand-surface-normal pb-2">
              <span className="font-sans font-bold text-brand-on-surface uppercase tracking-widest">SELECT SIZE</span>
              <button onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)} className="font-sans text-brand-primary font-bold underline underline-offset-4 hover:opacity-70">Size Guide</button>
            </div>

            <AnimatePresence>
              {isSizeGuideOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="py-2">
                    <img src="/sizechart.png" alt="Size Chart" className="w-full h-auto rounded-xl border border-brand-surface-normal shadow-sm" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-3">
              {sizes.map(size => {
                const sizeStockInfo = product?.sizeStocks?.find((s: any) => s.size === size);
                const isOutOfStock = sizeStockInfo ? sizeStockInfo.stock <= 0 : false;
                return (
                  <button
                    key={size}
                    onClick={() => !isOutOfStock && setSelectedSize(size)}
                    disabled={isOutOfStock}
                    className={cn(
                      "relative w-14 h-14 rounded-xl flex items-center justify-center border-2 font-h transition-all overflow-hidden",
                      isOutOfStock ? "opacity-50 cursor-not-allowed border-brand-surface-normal text-brand-on-surface-variant" : "active:scale-90",
                      selectedSize === size && !isOutOfStock
                        ? "border-brand-primary font-bold"
                        : !isOutOfStock ? "border-brand-surface-normal text-brand-on-surface-variant hover:border-brand-primary-hover" : ""
                    )}
                  >
                    <span className={isOutOfStock ? "opacity-50" : ""}>{size}</span>
                    {isOutOfStock && (
                      <div className="absolute w-full h-[1.5px] top-1/2 -translate-y-1/2 bg-brand-on-surface-variant pointer-events-none"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Estimated Delivery */}
          {settings && <DeliveryTimeline settings={settings} />}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => handleAddToCart()}
              disabled={isAdding || isBuying}
              className="w-full bg-white border-2 border-brand-surface-normal hover:border-brand-primary text-brand-on-surface font-sans font-bold py-5 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <AnimatePresence mode="wait">
                {isAdding ? (
                  <motion.div
                    key="adding"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                    >
                      <ShoppingBag size={20} />
                    </motion.div>
                    ADDING...
                  </motion.div>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <ShoppingBag size={20} />
                    ADD TO CART
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => handleBuyNow()}
              disabled={isAdding || isBuying}
              className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-sans font-bold py-5 rounded-xl shadow-2xl shadow-brand-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
              <AnimatePresence mode="wait">
                {isBuying ? (
                  <motion.div
                    key="buying"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    PROCESSING...
                  </motion.div>
                ) : (
                  <motion.div
                    key="buy"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    BUY NOW
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>


        </div>
      </div>

      <div className="mt-24 max-w-4xl mx-auto space-y-4">
        {[
          { id: 'description', title: 'Product Description', content: <p className="py-4 text-brand-on-surface-variant leading-relaxed whitespace-pre-wrap">{product.description}</p> },
        ].map(section => (
          <div key={section.id} className="border-b border-brand-surface-normal">
            <button
              onClick={() => setOpenAccordion(openAccordion === section.id ? null : section.id)}
              className="w-full flex justify-between items-center text-left py-6 group"
            >
              <span className="font-h text-xl font-bold group-hover:text-brand-primary transition-colors">{section.title}</span>
              {openAccordion === section.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <AnimatePresence>
              {openAccordion === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {section.content}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Always Visible Reviews Section */}
      <div className="mt-16 max-w-4xl mx-auto border-t border-brand-surface-normal pt-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-h text-3xl font-bold">Customer Reviews ({reviewsList.length})</h2>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-brand-surface border border-brand-surface-normal hover:border-brand-primary text-brand-on-surface font-sans font-bold py-2 px-6 rounded-full uppercase tracking-widest text-xs transition-all"
          >
            {showReviewForm ? "Cancel" : "Write a Review"}
          </button>
        </div>
        <div className="space-y-12">
          {/* Add Review Form */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddReview}
                className="bg-brand-surface-lowest border border-brand-surface-normal p-6 rounded-2xl space-y-4 overflow-hidden"
              >
                <h3 className="font-h font-bold text-lg">Write a Review</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setNewReview({ ...newReview, rating: star })} className="text-brand-primary transition-transform active:scale-90">
                      <Star size={24} fill={star <= newReview.rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-surface-normal rounded-xl px-4 py-3 font-sans outline-none focus:border-brand-primary"
                  />
                  <textarea
                    placeholder="Share your thoughts about this product..."
                    required
                    rows={3}
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-surface-normal rounded-xl px-4 py-3 font-sans outline-none focus:border-brand-primary resize-none"
                  />
                </div>

                {/* Image Upload Option */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer text-brand-on-surface-variant hover:text-brand-primary transition-colors w-max">
                    <div className="w-10 h-10 rounded-full bg-brand-surface border border-brand-surface-normal flex items-center justify-center">
                      <Plus size={18} />
                    </div>
                    <span className="font-sans text-sm font-bold">Add Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          setReviewImages(Array.from(e.target.files));
                        }
                      }}
                    />
                  </label>
                  {reviewImages.length > 0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto">
                      {reviewImages.map((file, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-brand-surface-normal flex-shrink-0">
                          <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview || !newReview.text.trim() || !newReview.name.trim()}
                  className="bg-brand-primary hover:bg-brand-primary-hover text-white font-sans font-bold py-3 px-6 rounded-xl uppercase tracking-widest text-xs transition-all disabled:opacity-50 mt-2">
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* List Reviews */}
          <div className="space-y-6">
            {reviewsList.length === 0 ? (
              <p className="text-brand-on-surface-variant font-sans py-4">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviewsList.map((review, idx) => (
                <div key={idx} className="border-b border-brand-surface-normal pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-sans font-bold text-brand-on-surface">{review.name}</div>
                      <div className="text-[10px] text-brand-on-surface-variant uppercase tracking-widest mt-1">{review.date}</div>
                    </div>
                    <div className="flex items-center text-brand-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <p className="font-sans text-brand-on-surface-variant text-sm mt-3 leading-relaxed">"{review.text}"</p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {review.images.map((img, i) => (
                        <div key={i} className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-brand-surface-normal">
                          <img src={img} alt="review" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>


      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          if (pendingAction === 'cart') handleAddToCart(true);
          else if (pendingAction === 'buy') handleBuyNow(true);
          setPendingAction(null);
        }}
      />
    </main>
  );
}
