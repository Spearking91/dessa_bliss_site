"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import Toast from "../components/toast";

interface CartContextType {
  cart: any[];
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (product: any, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id,
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          <Toast
            title="Stock limit reached"
            description={`Only ${product.stock} items available`}
            variant="destructive"
          />;
          return prevCart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: product.stock }
              : item,
          );
        }

        <Toast
          title="Cart updated"
          description={`${product.name} quantity updated in cart`}
        />;
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: existingItem.quantity + quantity }
            : item,
        );
      }

      <Toast
        title="Added to cart"
        description={`${product.name} added to your cart`}
      />;
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId),
    );
    <Toast
      title="Item removed"
      description={"Product removed from your cart"}
    />;
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const product = prevCart.find(
        (item) => item.product.id === productId,
      )?.product;
      if (product && quantity > product.stock) {
        <Toast
          title="Stock limit reached"
          description={`Only ${product.stock} items available`}
          variant="destructive"
        />;
        return prevCart.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: product.stock }
            : item,
        );
      }

      return prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      );
    });
  };

  const clearCart = () => {
    setCart([]);
    <Toast
      title="Cart cleared"
      description="All items have been removed from your cart"
    />;
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
