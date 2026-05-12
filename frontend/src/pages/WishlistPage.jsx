import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { Heart, X, ShoppingBag } from "lucide-react";

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useShop();

  if (user === false) {
    return (
      <main className="pt-40 pb-24 container-fluid text-center">
        <Heart size={32} strokeWidth={1.2} className="mx-auto opacity-50" />
        <h1 className="font-serif text-4xl md:text-5xl font-light mt-6">Your wishlist awaits.</h1>
        <p className="mt-4 opacity-70 max-w-md mx-auto">Sign in to save and revisit the pieces that move you.</p>
        <Link to="/login" className="inline-block mt-8 px-8 py-4 bg-foreground text-background text-eyebrow">Sign In</Link>
      </main>
    );
  }

  return (
    <main data-testid="wishlist-page" className="pt-32 md:pt-40 pb-24 container-fluid">
      <p className="text-eyebrow opacity-60">Wishlist</p>
      <h1 className="font-serif text-5xl md:text-6xl font-light mt-3">Saved for later.</h1>

      {wishlist.length === 0 ? (
        <div className="mt-16 text-center py-20 border border-border">
          <p className="opacity-70">No pieces saved yet.</p>
          <Link to="/shop" className="inline-block mt-6 px-8 py-3 bg-foreground text-background text-eyebrow">
            Discover the Shop
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
          {wishlist.map((w) => (
            <article key={w.id} data-testid={`wishlist-item-${w.id}`} className="group">
              <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
                <Link to={`/product/${w.product_id}`}>
                  <img src={w.product?.images?.[0]} alt={w.product?.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </Link>
                <button
                  onClick={() => toggleWishlist(w.product_id)}
                  className="absolute top-3 right-3 w-9 h-9 bg-background/90 flex items-center justify-center"
                  aria-label="Remove"
                  data-testid={`wishlist-remove-${w.product_id}`}
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
              <div className="pt-4 flex justify-between items-start gap-3">
                <div>
                  <p className="font-medium">{w.product?.name}</p>
                  <p className="text-eyebrow opacity-60 mt-1">{w.product?.category}</p>
                </div>
                <p className="text-sm font-medium">${w.product?.price?.toFixed(0)}</p>
              </div>
              <button
                onClick={() => addToCart(w.product_id, { size: w.product?.sizes?.[0] })}
                className="mt-4 w-full py-3 border border-foreground text-eyebrow inline-flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-colors"
              >
                <ShoppingBag size={13} strokeWidth={1.5} /> Add to Bag
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
