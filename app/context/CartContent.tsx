"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useToast } from "./ToastContext";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category: string;
}

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
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
      showToast("Error", "error", "Could not load cart from storage.");
    }
  }, [showToast]);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
      showToast("Error", "error", "Could not save cart.");
    }
  }, [cart, showToast]);

  const addToCart = useCallback(
    (product: Product, quantity: number) => {
      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item?.product?.id === product.id,
        );

        if (existingItem) {
          showToast(
            "Cart updated",
            "info",
            `${product.name} quantity updated in cart`,
          );
          return prevCart.map((item) =>
            item?.product?.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }

        showToast(
          "Added to cart",
          "success",
          `${product.name} added to your cart`,
        );
        return [...prevCart, { product, quantity }];
      });
    },
    [showToast],
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prevCart) =>
        prevCart.filter((item) => item.product.id !== productId),
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
          item.product.id === productId ? { ...item, quantity } : item,
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
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
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
