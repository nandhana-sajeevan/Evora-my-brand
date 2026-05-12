import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, ShoppingBag, Star } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { resolveUrl } from "../admin/ImageUploader";
import { motion } from "framer-motion";

export default function ProductCard({ product, onQuickView, index = 0 }) {
  const { addToCart, toggleWishlist, inWishlist } = useShop();
  const [hovered, setHovered] = useState(false);
  const liked = inWishlist(product.id);

  return (
    <motion.article
      data-testid={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block overflow-hidden aspect-[3/4] bg-secondary relative">
        <img
          src={resolveUrl(product.images?.[0])}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          loading="lazy"
        />
        {product.images?.[1] && (
          <img
            src={resolveUrl(product.images[1])}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new && (
            <span className="bg-background text-foreground text-[9px] tracking-[0.25em] uppercase px-2.5 py-1">
              New
            </span>
          )}
          {product.original_price && (
            <span className="bg-foreground text-background text-[9px] tracking-[0.25em] uppercase px-2.5 py-1">
              -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
            </span>
          )}
        </div>

        {/* Icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            data-testid={`wishlist-toggle-${product.id}`}
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className="w-9 h-9 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
            aria-label="Wishlist"
          >
            <Heart size={15} strokeWidth={1.5} fill={liked ? "currentColor" : "none"} />
          </button>
          <button
            data-testid={`quick-view-${product.id}`}
            onClick={(e) => { e.preventDefault(); onQuickView?.(product); }}
            className="w-9 h-9 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-foreground hover:text-background transition-colors opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-500"
            aria-label="Quick view"
          >
            <Eye size={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* Quick Add */}
        <button
          data-testid={`add-to-cart-${product.id}`}
          onClick={(e) => { e.preventDefault(); addToCart(product.id, { size: product.sizes?.[0] }); }}
          className="absolute bottom-0 inset-x-0 bg-foreground text-background py-3.5 text-eyebrow flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
        >
          <ShoppingBag size={14} strokeWidth={1.5} /> Quick Add
        </button>
      </Link>

      <div className="pt-4 flex items-start justify-between gap-4">
        <div>
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-base font-medium tracking-wide leading-snug group-hover:opacity-60 transition-opacity">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs opacity-60 mt-1 uppercase tracking-[0.2em]">{product.category}</p>
          <div className="flex items-center gap-1 mt-2">
            <Star size={12} fill="currentColor" strokeWidth={0} />
            <span className="text-xs opacity-70">{product.rating} <span className="opacity-50">({product.reviews_count})</span></span>
          </div>
        </div>
        <div className="text-right">
          {product.original_price && (
            <p className="text-xs opacity-50 line-through">${product.original_price.toFixed(0)}</p>
          )}
          <p className="text-sm font-medium" data-testid={`product-price-${product.id}`}>${product.price.toFixed(0)}</p>
        </div>
      </div>
    </motion.article>
  );
}
