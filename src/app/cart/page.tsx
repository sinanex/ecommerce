"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Plus, Minus, ChevronRight, ShieldCheck, Truck, CreditCard, Package, Sparkles, MapPin, CheckCircle2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { API_BASE_URL } from '@/config';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import AuthModal from '@/components/AuthModal';
import { useSnackbar } from '@/context/SnackbarContext';

export default function Cart() {
  const { showSnackbar } = useSnackbar();
  const navigate = useRouter();
  const { cartItems, loading, updateQuantity, removeFromCart, totalAmount: cartTotal } = useCart();
  const [showAddressOverlay, setShowAddressOverlay] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddressId, setIsEditingAddressId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: 'Kerala', country: 'India', landmark: '', alternatePhone: '', addressType: 'Home'
  });
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);



  const fetchProfile = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        if (data.addresses && data.addresses.length > 0) {
          const defaultAddr = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
          setSelectedAddressId(defaultAddr._id);
        }
        return data;
      } else {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      setUser(null);
    }
    return null;
  };

  useEffect(() => {
    fetchProfile();
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const shuffled = data.sort(() => 0.5 - Math.random());
          setRelatedProducts(shuffled.slice(0, 4));
        }
      })
      .catch(err => console.error("Error fetching related products:", err));

    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Error fetching settings:", err));

    // Open address overlay if coming from checkout change option
    const params = new URLSearchParams(window.location.search);
    if (params.get('changeAddress') === 'true') {
      setShowAddressOverlay(true);
    }
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    try {
      const isUpdating = !!isEditingAddressId;
      const url = isUpdating
        ? `${API_BASE_URL}/api/users/address/${isEditingAddressId}`
        : `${API_BASE_URL}/api/users/address`;
      const method = isUpdating ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });
      const data = await response.json();
      if (response.ok) {
        // data is the updated addresses array from the API
        setUser({ ...user, addresses: data });
        const updatedAddr = isUpdating
          ? data.find((a: any) => a._id === isEditingAddressId)
          : data[data.length - 1];
        if (updatedAddr) {
          setSelectedAddressId(updatedAddr._id);
        }
        setIsAddingAddress(false);
        setIsEditingAddressId(null);
      }
    } catch (err) {
      showSnackbar("Error", "Failed to save address", "error");
    }
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('userToken');
    if (!token || !user) {
      setIsAuthModalOpen(true);
      return;
    }
    const addr = user?.addresses?.find((a: any) => a._id === selectedAddressId);
    if (!addr) {
      setShowAddressOverlay(true);
      if (!user?.addresses || user.addresses.length === 0) {
        setIsAddingAddress(true);
      }
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const isBuyNowUrl = params.get('buyNow') === 'true';

    const existingStateStr = localStorage.getItem('checkoutState');
    let isBuyNow = false;
    let buyNowItemId = null;
    let itemsToCheckout = cartItems;
    let currentSubtotal = subtotal;
    let currentTotal = total;

    if (existingStateStr && isBuyNowUrl) {
      const existingState = JSON.parse(existingStateStr);
      if (existingState.isBuyNow) {
        isBuyNow = true;
        buyNowItemId = existingState.buyNowItemId;
        itemsToCheckout = existingState.cartItems;
        currentSubtotal = existingState.summary.subtotal;
        currentTotal = existingState.summary.total;
      }
    }

    localStorage.setItem('checkoutState', JSON.stringify({ 
      cartItems: itemsToCheckout, 
      summary: { subtotal: currentSubtotal, shippingCost, total: currentTotal }, 
      address: addr,
      isBuyNow,
      buyNowItemId
    }));
    navigate.push('/checkout');
  };

  const handleAuthSuccess = async () => {
    const profileData = await fetchProfile();
    setIsAuthModalOpen(false);
    setShowAddressOverlay(true);

    if (!profileData?.addresses || profileData.addresses.length === 0) {
      setIsAddingAddress(true);
    }
  };

  const subtotal = cartTotal;
  const shippingCost = 0;
  const total = subtotal;

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-brand-surface text-brand-on-surface pt-20 pb-16">
        <main className="max-w-[1280px] mx-auto px-6 pt-4">
          <motion.div
            className="flex flex-col items-center justify-center py-32 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-24 h-24 bg-brand-surface-low rounded-full flex items-center justify-center mb-8">
              <Package size={40} className="text-brand-on-surface-variant opacity-40" />
            </div>
            <h2 className="font-h text-3xl font-bold text-brand-on-surface mb-3">Your cart is empty</h2>
            <p className="font-sans text-brand-on-surface-variant mb-10 max-w-md">Looks like you haven't added anything to your cart yet. Start exploring our latest drops!</p>
            <Link
              href="/"
              className="bg-brand-primary text-white px-10 py-4 rounded-xl font-sans font-bold text-sm uppercase tracking-widest hover:bg-brand-primary-hover active:scale-[0.98] transition-all shadow-xl shadow-brand-primary/20"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface text-brand-on-surface pt-20 pb-16">
      <>
        <title>Shopping Cart | 6YARD STORE</title>
        <meta name="description" content="View your premium football kits and sports training gear in your shopping cart. Fast and secure checkout with free shipping over ₹1000." />
        <meta name="robots" content="noindex, follow" />
      </>

      <main className="max-w-[1280px] mx-auto px-6 pt-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-[10px] font-sans text-brand-on-surface-variant mb-4 uppercase tracking-widest">
          <Link className="hover:text-brand-primary transition-colors" href="/">Home</Link>
          <ChevronRight size={14} />
          <span className="text-brand-on-surface font-black">Cart</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Cart Items */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between pb-4">
              <h2 className="font-h text-2xl md:text-3xl font-bold text-brand-on-surface leading-[1.3] uppercase">Shopping Cart</h2>
              <span className="font-sans text-[10px] text-brand-on-surface-variant uppercase tracking-[0.2em] font-bold bg-brand-surface-low px-4 py-2 rounded-full">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} ITEMS
              </span>
            </div>



            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <motion.div
                  key={item._id}
                  className="bg-white rounded-3xl border border-brand-surface-normal p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Image */}
                    <Link href={`/product/${item.product?._id}`} className="w-full md:w-40 aspect-[3/4] bg-brand-surface-low rounded-2xl overflow-hidden flex-shrink-0 group">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={item.product?.images?.[0] || 'https://via.placeholder.com/400'}
                        alt={item.product?.name}
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex flex-col justify-between flex-grow py-1 min-w-0">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <h3 className="font-h text-lg text-brand-on-surface leading-tight font-bold truncate">{item.product?.name}</h3>
                            <div className="flex items-center gap-3 mt-2">
                              {item.size && (
                                <span className="font-sans text-[11px] font-bold text-brand-on-surface-variant bg-brand-surface-low px-3 py-1 rounded-lg uppercase tracking-wider">
                                  Size: {item.size}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="font-sans text-xs text-green-600 font-bold flex items-center gap-1.5">
                          <ShieldCheck size={14} /> In Stock
                        </p>
                      </div>

                      <div className="flex justify-between items-end mt-6">
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1 bg-brand-surface-low rounded-xl p-1">
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-10 h-10 flex items-center justify-center text-brand-on-surface rounded-lg hover:bg-white active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-h font-bold text-lg text-brand-on-surface select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            className="w-10 h-10 flex items-center justify-center text-brand-on-surface rounded-lg hover:bg-white active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-brand-on-surface-variant hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-medium cursor-pointer active:scale-90"
                          >
                            <Trash2 size={18} />
                            <span className="hidden sm:inline">Remove</span>
                          </button>

                          <div className="text-right">
                            <p className="font-h text-xl text-brand-on-surface font-black">
                              ₹{((item.product?.discount_price || item.product?.price || 0) * item.quantity).toFixed(2)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="font-sans text-[11px] text-brand-on-surface-variant mt-0.5">
                                ₹{(item.product?.discount_price || item.product?.price || 0).toFixed(2)} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Order Summary */}
          <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-6">
            <motion.section
              className="bg-white p-8 rounded-3xl border border-brand-surface-normal shadow-lg shadow-brand-primary/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-h font-bold text-lg text-brand-on-surface mb-8">Order Summary</h4>
              <div className="space-y-5 font-sans">
                <div className="flex justify-between items-center text-xs md:text-sm text-brand-on-surface-variant">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span className="font-medium text-brand-on-surface">₹{subtotal.toFixed(2)}</span>
                </div>


                <div className="h-px bg-brand-surface-normal my-2" />

                <div className="flex justify-between items-center pt-2">
                  <span className="font-h text-lg font-bold text-brand-on-surface">Total</span>
                  <span className="font-h text-2xl font-black text-brand-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-8 bg-brand-primary text-white py-4 rounded-2xl font-sans font-bold text-xs uppercase tracking-widest hover:bg-brand-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xl shadow-brand-primary/40 cursor-pointer"
              >
                <ShieldCheck size={18} />
                Proceed to Checkout
              </button>
            </motion.section>

            {/* Promo Code */}
            <div className="bg-white p-6 rounded-3xl border border-brand-surface-normal">
              <span className="font-sans font-bold text-xs text-brand-on-surface block mb-3">Promo Code</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-grow bg-brand-surface border border-brand-surface-normal rounded-xl px-4 py-3 font-sans text-brand-on-surface focus:outline-none focus:border-brand-primary transition-colors text-xs"
                />
                <button className="bg-brand-on-surface hover:bg-brand-on-surface/80 text-white px-6 rounded-xl font-sans font-bold text-xs transition-colors cursor-pointer active:scale-95">
                  Apply
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-brand-surface-low rounded-full flex items-center justify-center">
                  <ShieldCheck className="text-brand-on-surface-variant" size={20} />
                </div>
                <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-brand-on-surface-variant">Secure<br />Payment</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-brand-surface-low rounded-full flex items-center justify-center">
                  <CreditCard className="text-brand-on-surface-variant" size={20} />
                </div>
                <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-brand-on-surface-variant">Easy<br />Returns</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Cross-sell */}
        <section className="mt-24 border-t border-brand-surface-normal pt-16">
          <h2 className="font-h text-[32px] font-bold mb-10 text-center uppercase tracking-widest text-brand-primary/20">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((product) => {
                const mappedProduct: Product = {
                  _id: product._id,
                  id: product._id,
                  name: product.name,
                  category: product.category,
                  price: product.discount_price || product.price,
                  originalPrice: product.discount_price ? product.price : undefined,
                  images: product.images || [],
                  image: product.images?.[0] || 'https://via.placeholder.com/400',
                  isNew: true,
                  isSale: !!product.discount_price
                };
                return (
                  <div key={product._id}>
                    <ProductCard product={mappedProduct} />
                  </div>
                );
              })
            ) : (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-brand-surface-normal p-4 space-y-4 animate-pulse">
                  <div className="aspect-[3/4] bg-brand-surface-normal/40 rounded-2xl w-full" />
                  <div className="h-3.5 bg-brand-surface-normal/50 rounded-full w-1/3" />
                  <div className="space-y-2">
                    <div className="h-5 bg-brand-surface-normal/60 rounded-full w-11/12" />
                    <div className="h-5 bg-brand-surface-normal/60 rounded-full w-2/3" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Address Selection Overlay */}
      <AnimatePresence>
        {showAddressOverlay && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-0 md:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressOverlay(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-2xl rounded-t-[32px] md:rounded-[32px] overflow-hidden shadow-2xl h-[85vh] md:h-auto md:max-h-[80vh] flex flex-col"
            >
              <div className="p-8 border-b border-brand-surface-normal flex justify-between items-center bg-white sticky top-0 z-10">
                <h2 className="font-h text-2xl font-bold">Delivery Address</h2>
                <button onClick={() => setShowAddressOverlay(false)} className="p-2 hover:bg-brand-surface-low rounded-full transition-colors">
                  <ChevronRight className="rotate-90 md:rotate-0" size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8">
                {isAddingAddress ? (
                  <form onSubmit={handleAddAddress} className="space-y-6">
                    <button type="button" onClick={() => { setIsAddingAddress(false); setIsEditingAddressId(null); }} className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase tracking-widest mb-4">
                      <ChevronLeft size={16} /> Back to addresses
                    </button>
                      <div className="space-y-4">
                        <input type="text" placeholder="Name" required value={newAddress.name} className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-normal rounded-xl font-sans text-sm" onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} />
                        <textarea placeholder="Address" required value={newAddress.address} rows={3} className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-normal rounded-xl font-sans resize-none text-sm" onChange={e => setNewAddress({ ...newAddress, address: e.target.value })} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input type="text" placeholder="Post Name" required value={newAddress.locality} className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-normal rounded-xl font-sans text-sm" onChange={e => setNewAddress({ ...newAddress, locality: e.target.value })} />
                          <input type="text" placeholder="Place" required value={newAddress.city} className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-normal rounded-xl font-sans text-sm" onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                          <input type="text" placeholder="Pincode" required pattern="[0-9]{6}" title="Please enter a valid 6-digit pincode" value={newAddress.pincode} className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-normal rounded-xl font-sans text-sm" onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="tel" placeholder="Mobile 1" required pattern="[0-9]{10}" title="Please enter a valid 10-digit mobile number" value={newAddress.phone} className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-normal rounded-xl font-sans text-sm" onChange={e => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                          <input type="tel" placeholder="Mobile 2 (Optional)" pattern="[0-9]{10}" title="Please enter a valid 10-digit mobile number" value={newAddress.alternatePhone} className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-normal rounded-xl font-sans text-sm" onChange={e => setNewAddress({ ...newAddress, alternatePhone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-brand-primary text-white py-4 rounded-xl font-sans font-bold uppercase tracking-widest text-xs shadow-xl shadow-brand-primary/20 mt-4">
                        {isEditingAddressId ? 'Update Address' : 'Save and Deliver Here'}
                      </button>
                    </form>
                  ) : (
                  <div className="space-y-4">
                    {(!user?.addresses || user.addresses.length === 0) && (
                      <button onClick={() => {
                        setNewAddress({ name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: 'Kerala', country: 'India', landmark: '', alternatePhone: '', addressType: 'Home' });
                        setIsEditingAddressId(null);
                        setIsAddingAddress(true);
                      }} className="w-full p-6 border-2 border-dashed border-brand-surface-normal rounded-2xl text-brand-primary font-bold flex items-center justify-center gap-2 hover:border-brand-primary hover:bg-brand-primary/5 transition-all mb-4">
                        <Plus size={20} /> Add New Address
                      </button>
                    )}
                    {user?.addresses?.map((addr: any) => (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-brand-primary bg-brand-primary/5 shadow-md scale-[1.02]' : 'border-brand-surface-normal hover:border-brand-primary-hover'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-brand-on-surface">{addr.name}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewAddress({
                                  name: addr.name || '',
                                  phone: addr.phone || '',
                                  pincode: addr.pincode || '',
                                  locality: addr.locality || '',
                                  address: addr.address || '',
                                  city: addr.city || '',
                                  state: addr.state || 'Kerala',
                                  country: addr.country || 'India',
                                  landmark: addr.landmark || '',
                                  alternatePhone: addr.alternatePhone || '',
                                  addressType: addr.addressType || 'Home'
                                });
                                setIsEditingAddressId(addr._id);
                                setIsAddingAddress(true);
                              }}
                              className="text-brand-primary text-xs font-bold uppercase tracking-widest hover:underline"
                            >
                              Edit
                            </button>
                            {selectedAddressId === addr._id && <CheckCircle2 className="text-brand-primary" size={20} />}
                          </div>
                        </div>
                        <p className="font-sans text-sm text-brand-on-surface-variant leading-relaxed mb-1">{addr.address}, {addr.locality}</p>
                        <p className="font-sans text-sm text-brand-on-surface-variant leading-relaxed mb-3">{addr.city} - <span className="font-bold">{addr.pincode}</span></p>
                        <p className="font-sans text-sm font-bold text-brand-on-surface">
                          {addr.phone} {addr.alternatePhone && ` / ${addr.alternatePhone}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isAddingAddress && (
                <div className="p-8 border-t border-brand-surface-normal bg-brand-surface-lowest">
                  <button
                    disabled={!selectedAddressId}
                    onClick={handleCheckout}
                    className="w-full bg-black text-white py-4 rounded-2xl font-sans font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
