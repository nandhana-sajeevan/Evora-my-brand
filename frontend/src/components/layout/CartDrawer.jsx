import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useShop } from "../../context/ShopContext";

import { Minus, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cart, updateCartItem, removeCartItem, cartSubtotal } = useShop();

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-background" data-testid="cart-drawer">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-eyebrow font-normal">Shopping Bag ({cart.length})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-20">
              <p className="font-serif text-2xl">Your bag is empty.</p>
              <p className="text-sm opacity-60 max-w-xs">
                Looking for inspiration? Explore the season's pieces.
              </p>
              <Link
                onClick={() => setCartOpen(false)}
                to="/shop"
                className="mt-4 inline-block px-8 py-3 bg-foreground text-background text-eyebrow"
                data-testid="cart-empty-shop-link"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-4" data-testid={`cart-item-${item.id}`}>
                  <div className="w-24 h-32 bg-secondary overflow-hidden flex-shrink-0">
                    <img
                      src={item.product?.images?.[0]}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-serif text-lg leading-tight">{item.product?.name}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {item.size ? `Size ${item.size} · ` : ""}{item.product?.colors?.[0]}
                        </p>
                      </div>
                      <button
                        onClick={() => removeCartItem(item.id)}
                        className="opacity-60 hover:opacity-100"
                        aria-label="Remove"
                        data-testid={`cart-remove-${item.id}`}
                      >
                        <X size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => item.quantity > 1 && updateCartItem(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-secondary"
                          aria-label="Decrease"
                          data-testid={`cart-dec-${item.id}`}
                        >
                          <Minus size={12} strokeWidth={1.5} />
                        </button>
                        <span className="px-3 text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-secondary"
                          aria-label="Increase"
                          data-testid={`cart-inc-${item.id}`}
                        >
                          <Plus size={12} strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="font-medium">${(item.product?.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4" data-testid="cart-summary">
            <div className="flex justify-between text-sm">
              <span className="opacity-70">Subtotal</span>
              <span className="font-medium" data-testid="cart-subtotal">${cartSubtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs opacity-50">Shipping & taxes calculated at checkout.</p>
            <button
              className="w-full bg-foreground text-background py-4 text-eyebrow hover:bg-foreground/90 transition-colors"
              data-testid="checkout-btn"
            >
              Checkout
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
