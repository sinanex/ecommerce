"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSnackbar } from './SnackbarContext';

export interface CartItem {
  _id?: string;
  product: any;
  size?: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  totalQuantity: number;
  totalAmount: number;
  addToCart: (product: any, size?: string, quantity?: number, skipSnackbar?: boolean) => Promise<string>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  loadCart: () => Promise<void>;
  mergeCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { showSnackbar } = useSnackbar();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => {
    const price = item.product?.discount_price || item.product?.price || 0;
    return acc + (price * item.quantity);
  }, 0);

  // Load cart on initial mount
  useEffect(() => {
    loadCart();
  }, []);

  const saveToLocalStorage = (items: CartItem[]) => {
    localStorage.setItem('kitbay_guest_cart', JSON.stringify(items));
  };

  const getFromLocalStorage = (): CartItem[] => {
    const saved = localStorage.getItem('kitbay_guest_cart');
    return saved ? JSON.parse(saved) : [];
  };

  const loadCart = async () => {
    setLoading(true);
    setCartItems(getFromLocalStorage());
    setLoading(false);
  };

  const mergeCart = async () => {
    // No-op since we are only using localStorage now
    return Promise.resolve();
  };

  const addToCart = async (product: any, size?: string, quantity = 1, skipSnackbar = false): Promise<string> => {
    const currentCart = [...cartItems];
    const existingIndex = currentCart.findIndex(
      item => item.product._id === product._id && item.size === size
    );

    const sizeStockInfo = product?.sizeStocks?.find((s: any) => s.size === size);
    const maxStock = sizeStockInfo ? Number(sizeStockInfo.stock) : (product?.stock !== undefined ? Number(product.stock) : 10);

    let itemId = '';

    if (existingIndex >= 0) {
      const newQuantity = currentCart[existingIndex].quantity + quantity;
      if (newQuantity > maxStock) {
        if (!skipSnackbar) showSnackbar("Limit Reached", `Only ${maxStock} items available in size ${size}`, "warning");
        currentCart[existingIndex].quantity = maxStock;
      } else {
        currentCart[existingIndex].quantity = newQuantity;
      }
      itemId = currentCart[existingIndex]._id as string;
    } else {
      if (quantity > maxStock) {
        if (!skipSnackbar) showSnackbar("Limit Reached", `Only ${maxStock} items available in size ${size}`, "warning");
        quantity = maxStock;
      }
      itemId = `local_${Date.now()}_${Math.random()}`;
      // Generate a fake ID for local items
      currentCart.push({
        _id: itemId,
        product,
        size,
        quantity
      });
    }
    setCartItems(currentCart);
    saveToLocalStorage(currentCart);
    return itemId;
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const item = cartItems.find(i => i._id === itemId);
    if (!item) return;

    const sizeStockInfo = item.product?.sizeStocks?.find((s: any) => s.size === item.size);
    const maxStock = sizeStockInfo ? Number(sizeStockInfo.stock) : (item.product?.stock !== undefined ? Number(item.product.stock) : 10);

    if (quantity > maxStock) {
      showSnackbar("Limit Reached", `Only ${maxStock} items available in size ${item.size}`, "warning");
      quantity = maxStock;
    }

    const currentCart = cartItems.map(i =>
      i._id === itemId ? { ...i, quantity } : i
    );
    setCartItems(currentCart);
    saveToLocalStorage(currentCart);
  };

  const removeFromCart = async (itemId: string) => {
    const currentCart = cartItems.filter(item => item._id !== itemId);
    setCartItems(currentCart);
    saveToLocalStorage(currentCart);
  };

  const clearCart = () => {
    setCartItems([]);
    saveToLocalStorage([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      totalQuantity,
      totalAmount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loadCart,
      mergeCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

