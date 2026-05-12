import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { useShop } from "../../context/ShopContext";
import { Star, Heart, X } from "lucide-react";

export default function QuickViewDialog({ product, open, onOpenChange }) {
  const { addToCart, toggleWishlist, inWishlist } = useShop();
  const [size, setSize] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (product) {
      setSize(product.sizes?.[0] || null);
      setActiveImg(0);
    }
  }, [product]);

  if (!product) return null;
  const liked = inWishlist(product.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 bg-background border-border" data-testid="quick-view-dialog">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-background hover:bg-secondary border border-border"
          aria-label="Close"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
        <div className="grid md:grid-cols-2">
          <div className="bg-secondary">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={product.images?.[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 p-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-20 overflow-hidden border ${activeImg === i ? "border-foreground" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="p-8 md:p-10 flex flex-col">
            <p className="text-eyebrow opacity-60">{product.category}</p>
            <h2 className="font-serif text-3xl md:text-4xl mt-2 leading-tight">{product.name}</h2>
            <div className="flex items-center gap-2 mt-3">
              <Star size={14} fill="currentColor" strokeWidth={0} />
              <span className="text-sm opacity-70">{product.rating} ({product.reviews_count} reviews)</span>
            </div>
            <div className="flex items-baseline gap-3 mt-6">
              <p className="text-2xl font-medium">${product.price.toFixed(0)}</p>
              {product.original_price && (
                <p className="text-sm opacity-50 line-through">${product.original_price.toFixed(0)}</p>
              )}
            </div>
            <p className="text-sm opacity-70 mt-6 leading-relaxed">{product.description}</p>

            {product.sizes?.length > 0 && (
              <div className="mt-8">
                <p className="text-eyebrow opacity-60 mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      data-testid={`qv-size-${s}`}
                      onClick={() => setSize(s)}
                      className={`min-w-[44px] h-10 px-3 text-xs border transition-colors ${
                        size === s
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-8 flex gap-3">
              <button
                data-testid="qv-add-to-cart"
                onClick={() => addToCart(product.id, { size })}
                className="flex-1 bg-foreground text-background py-4 text-eyebrow hover:bg-foreground/90 transition-colors"
              >
                Add to Bag
              </button>
              <button
                data-testid="qv-wishlist"
                onClick={() => toggleWishlist(product.id)}
                className="px-5 border border-border hover:bg-secondary transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={18} strokeWidth={1.5} fill={liked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
