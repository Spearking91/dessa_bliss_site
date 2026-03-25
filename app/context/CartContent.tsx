"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useToast } from "./ToastContext";
import { Product } from "@/app/services/productService";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const isInitialized = useRef(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isInitialized.current) return;
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Safety: Filter out any null items or items with missing product data
        if (Array.isArray(parsed)) {
          setCart(parsed.filter((item) => item?.product?.id));
        }
      }
      isInitialized.current = true;
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
      showToast("Error", "error", "Could not load cart from storage.");
    }
  }, [showToast]); // Run only once on mount

  useEffect(() => {
    // Only save if we have finished the initial load from localStorage
    if (!isInitialized.current) return;

    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
      showToast("Error", "error", "Could not save cart.");
    }
  }, [cart, showToast]);

  const addToCart = useCallback(
    (product: Product, quantity: number) => {
      const existingItem = cart.find(
        (item) => item?.product?.id === product.id,
      );

      if (existingItem) {
        showToast(
          "Cart updated",
          "info",
          `${product.name} quantity updated in cart`,
        );
      } else {
        showToast(
          "Added to cart",
          "success",
          `${product.name} added to your cart`,
        );
      }

      setCart((prevCart) => {
        const isMatch = prevCart.find(
          (item) => item?.product?.id === product.id,
        );
        if (isMatch) {
          return prevCart.map((item) =>
            item?.product?.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [...prevCart, { product, quantity }];
      });
    },
    [showToast, cart],
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prevCart) =>
        prevCart.filter((item) => item?.product?.id !== productId),
      );
      showToast("Item removed", "info", "Product removed from your cart");
    },
    [showToast],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) {
        removeFromCart(productId);
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item?.product?.id === productId ? { ...item, quantity } : item,
        ),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => {
    setCart([]);
    showToast(
      "Cart cleared",
      "info",
      "All items have been removed from your cart",
    );
  }, [showToast]);

  const getCartTotal = useCallback(() => {
    return cart.reduce(
      (total, item) => total + (item?.product?.price || 0) * item.quantity,
      0,
    );
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + (item?.quantity || 0), 0);
  }, [cart]);

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
