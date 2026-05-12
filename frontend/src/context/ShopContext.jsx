import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const ShopContext = createContext({});

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch (e) {
      setCart([]);
    }
  }, [user]);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const { data } = await api.get("/wishlist");
      setWishlist(data);
    } catch (e) {
      setWishlist([]);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
    refreshWishlist();
  }, [refreshCart, refreshWishlist]);

  const addToCart = async (product_id, { size = null, quantity = 1 } = {}) => {
    if (!user) {
      toast("Please sign in", { description: "Log in to save items to your cart." });
      return false;
    }
    await api.post("/cart", { product_id, size, quantity });
    await refreshCart();
    toast("Added to bag", { description: "Item added to your shopping bag." });
    setCartOpen(true);
    return true;
  };

  const updateCartItem = async (item_id, quantity) => {
    await api.put(`/cart/${item_id}`, { quantity });
    await refreshCart();
  };

  const removeCartItem = async (item_id) => {
    await api.delete(`/cart/${item_id}`);
    await refreshCart();
  };

  const inWishlist = (product_id) => wishlist.some((w) => w.product_id === product_id);

  const toggleWishlist = async (product_id) => {
    if (!user) {
      toast("Please sign in", { description: "Log in to save to your wishlist." });
      return;
    }
    if (inWishlist(product_id)) {
      await api.delete(`/wishlist/${product_id}`);
      toast("Removed from wishlist");
    } else {
      await api.post("/wishlist", { product_id });
      toast("Added to wishlist");
    }
    await refreshWishlist();
  };

  const cartCount = cart.reduce((s, i) => s + (i.quantity || 0), 0);
  const cartSubtotal = cart.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        cartOpen,
        setCartOpen,
        cartCount,
        cartSubtotal,
        addToCart,
        updateCartItem,
        removeCartItem,
        toggleWishlist,
        inWishlist,
        refreshCart,
        refreshWishlist,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
