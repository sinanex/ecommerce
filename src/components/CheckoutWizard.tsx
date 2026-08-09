"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, MapPin, CreditCard, ChevronRight, Lock,
  Percent, ArrowRight, AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { API_BASE_URL } from '@/config';


// Simplified validation schema matching only requested fields
const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().length(10, 'Mobile 1 must be exactly 10 digits'),
  alternatePhone: z.string().length(10, 'Mobile 2 must be exactly 10 digits').optional().or(z.literal('')),
  pincode: z.string().length(6, 'Pincode must be exactly 6 digits'),
  address: z.string().min(5, 'Address is too short'),
  locality: z.string().min(2, 'Post Name is required'),
  city: z.string().min(2, 'Place is required'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface SavedAddress {
  name: string;
  phone: string;
  pincode: string;
  locality: string;
  address: string;
  city: string;
  country: string;
  alternatePhone?: string;
}

const steps = [
  { id: 'address', label: 'Address' },
  { id: 'payment', label: 'Payment' }
];

export default function CheckoutWizard() {
  const router = useRouter();
  const { cartItems, totalAmount, clearCart } = useCart();
  const { showSnackbar } = useSnackbar();

  // Wizard state (simplified to just address and payment)
  const [currentStep, setCurrentStep] = useState<'address' | 'payment'>('address');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');


  // Payment progress
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Initialize Form Validation
  const {
    register,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      alternatePhone: '',
    }
  });

  // Load user profile addresses on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setValue('name', data.name || '');
          setValue('phone', data.phone || '');
          if (data.addresses && data.addresses.length > 0) {
            const def = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
            setValue('name', def.name || data.name || '');
            setValue('phone', def.phone || data.phone || '');
            setValue('alternatePhone', def.alternatePhone || '');
            setValue('pincode', def.pincode || '');
            setValue('locality', def.locality || '');
            setValue('address', def.address || '');
            setValue('city', def.city || '');
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    fetchProfile();
  }, [setValue]);




  // Form step navigation logic with step-by-step validations
  const nextStep = async () => {
    if (currentStep === 'address') {
      const isValid = await trigger([
        'name',
        'phone',
        'alternatePhone',
        'pincode',
        'address',
        'locality',
        'city'
      ]);
      if (isValid) {
        setCurrentStep('payment');
      }
    }
  };

  const prevStep = () => {
    if (currentStep === 'payment') setCurrentStep('address');
  };

  // Razorpay integrations
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const getActiveAddress = (): Partial<SavedAddress> => {
    const vals = getValues();
    return {
      name: vals.name || 'Customer',
      phone: vals.phone || '',
      alternatePhone: vals.alternatePhone || '',
      pincode: vals.pincode || '',
      locality: vals.locality || '',
      address: vals.address || '',
      city: vals.city || '',
      country: 'India'
    };
  };

  const handlePaySecurely = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    const activeAddress = getActiveAddress();
    const finalAmount = paymentMethod === 'cod' ? 50 : totalAmount;
    const finalTotalAmount = totalAmount;

    const loaded = await loadRazorpay();
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

    // Mock API Flow if Key is missing
    if (!loaded || !key) {
      setTimeout(async () => {
        try {
          const token = localStorage.getItem('userToken');
          const res = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              items: cartItems.map(item => ({
                product: item.product._id,
                name: item.product.name,
                price: item.product.discount_price || item.product.price,
                image: item.product.images?.[0],
                size: item.size,
                quantity: item.quantity
              })),
              shippingAddress: {
                name: activeAddress?.name || 'Customer',
                phone: activeAddress?.phone || '9999999999',
                alternatePhone: activeAddress?.alternatePhone || '',
                pincode: activeAddress?.pincode || '123456',
                locality: activeAddress?.locality || 'Locality',
                address: activeAddress?.address || '123 Test Street',
                city: activeAddress?.city || 'City',
                country: activeAddress?.country || 'India'
              },
              paymentMethod: paymentMethod,
              totalAmount: finalTotalAmount,
              shippingCharge: paymentMethod === 'cod' ? 50 : 0,
              subtotal: totalAmount,
              razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
              razorpayOrderId: 'order_mock_' + Math.random().toString(36).substr(2, 9),
              razorpaySignature: 'sig_mock_' + Math.random().toString(36).substr(2, 9),
              advancePaid: finalAmount
            })
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('lastOrder', JSON.stringify(data));
            clearCart();
            showSnackbar('Success', 'Order completed successfully!', 'success');
            router.push('/success');
          } else {
            throw new Error('Order creation failed on server');
          }
        } catch (err: any) {
          setPaymentError(err.message || 'Payment simulation failed.');
          setIsProcessing(false);
        }
      }, 2000);
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const orderRes = await fetch(`${API_BASE_URL}/api/razorpay/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: finalAmount })
      });

      if (!orderRes.ok) {
        throw new Error('Could not create Razorpay payment order');
      }

      const rpOrder = await orderRes.json();

      const options = {
        key: key,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: "KITBAY STORE",
        description: "Secure Order Payment",
        image: "/icon.png",
        order_id: rpOrder.id,
        handler: async function (response: any) {
          try {
            const finalRes = await fetch(`${API_BASE_URL}/api/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                items: cartItems.map(item => ({
                  product: item.product._id,
                  name: item.product.name,
                  price: item.product.discount_price || item.product.price,
                  image: item.product.images?.[0],
                  size: item.size,
                  quantity: item.quantity
                })),
                shippingAddress: {
                  name: activeAddress?.name || 'Customer',
                  phone: activeAddress?.phone || '9999999999',
                  alternatePhone: activeAddress?.alternatePhone || '',
                  pincode: activeAddress?.pincode || '123456',
                  locality: activeAddress?.locality || 'Locality',
                  address: activeAddress?.address || '123 Test Street',
                  city: activeAddress?.city || 'City',
                  country: activeAddress?.country || 'India'
                },
                paymentMethod: paymentMethod,
                totalAmount: finalTotalAmount,
                shippingCharge: paymentMethod === 'cod' ? 50 : 0,
                subtotal: totalAmount,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                advancePaid: finalAmount
              })
            });

            if (finalRes.ok) {
              const data = await finalRes.json();
              localStorage.setItem('lastOrder', JSON.stringify(data));
              clearCart();
              showSnackbar('Success', 'Order completed successfully!', 'success');
              router.push('/success');
            } else {
              throw new Error('Payment signature verification failed');
            }
          } catch (err: any) {
            setPaymentError(err.message || 'Signature verification failed.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: activeAddress?.name || '',
          contact: activeAddress?.phone || ''
        },
        theme: { color: "#0D0D0D" },
        modal: {
          ondismiss: function () {
            setPaymentError('Payment window was cancelled by the user.');
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      setPaymentError(err.message || 'Razorpay initialization failed.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[999] flex flex-col items-center justify-center text-white"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-primary border-solid mb-4"></div>
            <h3 className="font-h text-xl font-bold uppercase tracking-widest">Securing Payment...</h3>
            <p className="font-sans text-xs text-brand-on-surface-variant/80 mt-2">Please do not close this window or hit back button</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Wizard Form Details */}
      <div className="lg:col-span-8 space-y-6">


        {/* Dynamic Wizard Steps */}
        <AnimatePresence mode="wait">
          {currentStep === 'address' && (
            <motion.div
              key="step-address"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Shipping Address direct Form */}
              <div className="bg-white rounded-3xl border border-brand-surface-normal p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-h text-xl font-bold uppercase">Shipping Address</h3>
                </div>


                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-sans font-black uppercase text-brand-on-surface-variant tracking-wider block mb-1.5">Full Name</label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        id="name"
                        {...register('name')}
                        className={`w-full px-4 py-3.5 bg-brand-surface border rounded-2xl font-sans text-sm focus:outline-none focus:border-brand-primary transition-colors ${errors.name ? 'border-red-500' : 'border-brand-surface-normal'}`}
                      />
                      {errors.name && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-sans font-black uppercase text-brand-on-surface-variant tracking-wider block mb-1.5">Mobile 1</label>
                      <input
                        type="tel"
                        placeholder="10-digit Mobile"
                        id="phone"
                        {...register('phone', {
                          onChange: (e) => setValue('phone', e.target.value.replace(/\D/g, '').slice(0, 10))
                        })}
                        className={`w-full px-4 py-3.5 bg-brand-surface border rounded-2xl font-sans text-sm focus:outline-none focus:border-brand-primary transition-colors ${errors.phone ? 'border-red-500' : 'border-brand-surface-normal'}`}
                      />
                      {errors.phone && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-sans font-black uppercase text-brand-on-surface-variant tracking-wider block mb-1.5">Mobile 2 (Optional)</label>
                      <input
                        type="tel"
                        placeholder="10-digit Alternate Mobile"
                        id="alternatePhone"
                        {...register('alternatePhone', {
                          onChange: (e) => setValue('alternatePhone', e.target.value.replace(/\D/g, '').slice(0, 10))
                        })}
                        className={`w-full px-4 py-3.5 bg-brand-surface border rounded-2xl font-sans text-sm focus:outline-none focus:border-brand-primary transition-colors ${errors.alternatePhone ? 'border-red-500' : 'border-brand-surface-normal'}`}
                      />
                      {errors.alternatePhone && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.alternatePhone.message}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-sans font-black uppercase text-brand-on-surface-variant tracking-wider block mb-1.5">PIN Code</label>
                      <input
                        type="text"
                        placeholder="6-digit Pincode"
                        id="pincode"
                        {...register('pincode', {
                          onChange: (e) => setValue('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))
                        })}
                        className={`w-full px-4 py-3.5 bg-brand-surface border rounded-2xl font-sans text-sm focus:outline-none focus:border-brand-primary transition-colors ${errors.pincode ? 'border-red-500' : 'border-brand-surface-normal'}`}
                      />
                      {errors.pincode && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.pincode.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-sans font-black uppercase text-brand-on-surface-variant tracking-wider block mb-1.5">Address</label>
                    <textarea
                      placeholder="House Number, Building, Street Address"
                      id="address"
                      rows={3}
                      {...register('address')}
                      className={`w-full px-4 py-3.5 bg-brand-surface border rounded-2xl font-sans text-sm resize-none focus:outline-none focus:border-brand-primary transition-colors ${errors.address ? 'border-red-500' : 'border-brand-surface-normal'}`}
                    />
                    {errors.address && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-sans font-black uppercase text-brand-on-surface-variant tracking-wider block mb-1.5">Post Name</label>
                      <input
                        type="text"
                        placeholder="Post Office / locality"
                        id="locality"
                        {...register('locality')}
                        className={`w-full px-4 py-3.5 bg-brand-surface border rounded-2xl font-sans text-sm focus:outline-none focus:border-brand-primary transition-colors ${errors.locality ? 'border-red-500' : 'border-brand-surface-normal'}`}
                      />
                      {errors.locality && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.locality.message}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-sans font-black uppercase text-brand-on-surface-variant tracking-wider block mb-1.5">Place</label>
                      <input
                        type="text"
                        placeholder="City / Place Name"
                        id="city"
                        {...register('city')}
                        className={`w-full px-4 py-3.5 bg-brand-surface border rounded-2xl font-sans text-sm focus:outline-none focus:border-brand-primary transition-colors ${errors.city ? 'border-red-500' : 'border-brand-surface-normal'}`}
                      />
                      {errors.city && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.city.message}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'payment' && (
            <motion.div
              key="step-payment"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl border border-brand-surface-normal p-8 shadow-sm space-y-6"
            >
              <div>
                <h3 className="font-h text-xl font-bold uppercase mb-2">Secure Payment</h3>
                <p className="font-sans text-xs text-brand-on-surface-variant">Your transaction is fully encrypted & secured by Razorpay API.</p>
              </div>

              {paymentError && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 flex gap-3 items-start">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-sans font-bold text-sm">Payment Failed</h5>
                    <p className="font-sans text-xs mt-0.5">{paymentError}</p>
                  </div>
                </div>
              )}

              {/* Secure Payment Card Display */}
              <div className="border border-brand-surface-normal rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center text-xs font-sans font-bold">
                  <span>Selected Address Preview:</span>
                  <button onClick={() => setCurrentStep('address')} className="text-brand-primary hover:underline">Change</button>
                </div>
                <div className="bg-brand-surface p-4 rounded-xl text-xs font-sans text-brand-on-surface-variant leading-relaxed">
                  <p className="font-bold text-brand-on-surface">{getActiveAddress()?.name}</p>
                  <p>{getActiveAddress()?.address}, {getActiveAddress()?.locality}</p>
                  <p>{getActiveAddress()?.city} - {getActiveAddress()?.pincode}</p>
                  <p className="mt-1 font-bold">{getActiveAddress()?.phone}</p>
                </div>
              </div>

              {/* Payment Methods Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`text-left border rounded-2xl p-4 text-xs font-sans transition-all cursor-pointer ${paymentMethod === 'online' ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20' : 'border-brand-surface-normal bg-brand-surface-low hover:border-brand-primary/50'}`}
                >
                  <h5 className="font-bold text-brand-on-surface flex items-center gap-2 mb-2">
                    <span className="text-lg">💳</span> Online Payment
                  </h5>
                  <p className="text-brand-on-surface-variant leading-relaxed">
                    No extra charge — only product price.<br />
                    <span className="text-green-600 font-bold">Free shipping available</span> on online payment ❤️
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`text-left border rounded-2xl p-4 text-xs font-sans transition-all cursor-pointer ${paymentMethod === 'cod' ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20' : 'border-brand-surface-normal bg-brand-surface-low hover:border-brand-primary/50'}`}
                >
                  <h5 className="font-bold text-brand-on-surface flex items-center gap-2 mb-2">
                    <span className="text-lg">🚚</span> Cash on Delivery
                  </h5>
                  <p className="text-brand-on-surface-variant leading-relaxed">
                    For COD orders, <span className="font-bold text-brand-on-surface">₹50 extra charge</span> including shipping is required for order confirmation ✅
                  </p>
                </button>
              </div>

              {/* Safety Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-surface-normal text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck size={24} className="text-brand-primary" />
                  <span className="font-sans text-[9px] uppercase tracking-wider font-bold text-brand-on-surface-variant mt-1.5">100% Secure</span>
                </div>
                <div className="flex flex-col items-center">
                  <Lock size={24} className="text-brand-primary" />
                  <span className="font-sans text-[9px] uppercase tracking-wider font-bold text-brand-on-surface-variant mt-1.5">SSL Encrypted</span>
                </div>
                <div className="flex flex-col items-center">
                  <CreditCard size={24} className="text-brand-primary" />
                  <span className="font-sans text-[9px] uppercase tracking-wider font-bold text-brand-on-surface-variant mt-1.5">Razorpay verified</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Navigation Controls */}
        <div className="flex justify-between items-center pt-4">
          {currentStep !== 'address' ? (
            <button
              onClick={prevStep}
              className="px-6 py-3.5 bg-white border border-brand-surface-normal hover:bg-brand-surface-low text-brand-on-surface rounded-2xl font-sans font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep !== 'payment' ? (
            <button
              onClick={nextStep}
              className="px-8 py-4 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-2xl font-sans font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-brand-primary/20"
            >
              Continue to Payment
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handlePaySecurely}
              className="px-10 py-4.5 bg-black hover:bg-gray-900 text-white rounded-2xl font-sans font-black text-sm uppercase tracking-widest transition-all cursor-pointer flex items-center gap-3 shadow-xl"
            >
              <Lock size={16} />
              {paymentMethod === 'cod' ? 'Pay Advance Securely (₹50.00)' : `Pay Securely (₹${totalAmount.toFixed(2)})`}
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-brand-surface-normal shadow-lg shadow-brand-primary/5">
          <h4 className="font-h font-bold text-lg text-brand-on-surface mb-6 uppercase tracking-wider">Order Summary</h4>

          <div className="space-y-4 mb-6 border-b border-brand-surface-normal pb-6 max-h-48 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item._id} className="flex gap-4 items-center">
                <div className="w-12 h-16 bg-brand-surface-low rounded-xl overflow-hidden shrink-0">
                  <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-grow">
                  <h5 className="font-h font-bold text-brand-on-surface text-xs truncate leading-tight">{item.product?.name}</h5>
                  <p className="font-sans text-[9px] font-bold text-brand-on-surface-variant mt-1 uppercase tracking-wider">Size: {item.size} • Qty: {item.quantity}</p>
                </div>
                <span className="font-h font-bold text-sm text-brand-on-surface shrink-0">
                  ₹{((item.product?.discount_price || item.product?.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-4 font-sans text-xs">
            <div className="flex justify-between items-center text-brand-on-surface-variant">
              <span>Total Product Value</span>
              <span className="font-medium text-brand-on-surface">₹{totalAmount.toFixed(2)}</span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="flex justify-between items-center text-brand-primary font-bold">
                <span>Advance COD Charge (Shipping + Fee)</span>
                <span>₹50.00</span>
              </div>
            )}
            {paymentMethod === 'online' && (
              <div className="flex justify-between items-center text-brand-on-surface-variant">
                <span>Shipping Fee</span>
                <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">FREE</span>
              </div>
            )}
            <div className="h-px bg-brand-surface-normal my-2" />
            <div className="flex justify-between items-center pt-2">
              <span className="font-h text-sm font-bold uppercase tracking-wider text-brand-on-surface">Total Amount to Pay Now</span>
              <span className="font-h text-xl font-black text-brand-primary">
                ₹{paymentMethod === 'cod' ? '50.00' : totalAmount.toFixed(2)}
              </span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="flex justify-between items-center pt-1">
                <span className="font-sans text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider">Amount to pay on delivery</span>
                <span className="font-h text-md font-bold text-brand-on-surface">₹{totalAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
