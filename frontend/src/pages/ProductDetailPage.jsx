import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import { useShop } from "../context/ShopContext";
import { resolveUrl } from "../components/admin/ImageUploader";
import { Star, Heart, ShoppingBag, Truck, Shield, ArrowLeft } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const { addToCart, toggleWishlist, inWishlist } = useShop();

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => {
      setProduct(data);
      setSize(data.sizes?.[0] || null);
      setActiveImg(0);
    });
  }, [id]);

  if (!product) {
    return (
      <main className="pt-32 container-fluid">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-secondary animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 bg-secondary w-32 animate-pulse" />
            <div className="h-12 bg-secondary w-3/4 animate-pulse" />
            <div className="h-4 bg-secondary w-1/2 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  const liked = inWishlist(product.id);

  return (
    <main data-testid="product-detail" className="pt-32 md:pt-36 pb-24">
      <div className="container-fluid">
        <Link to="/shop" className="text-eyebrow inline-flex items-center gap-2 opacity-70 hover:opacity-100 mb-8">
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <div className="aspect-[4/5] overflow-hidden bg-secondary">
              <img src={resolveUrl(product.images?.[activeImg])} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-24 overflow-hidden border ${activeImg === i ? "border-foreground" : "border-transparent opacity-70"}`}
                  >
                    <img src={resolveUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:pt-4">
            <p className="text-eyebrow opacity-60">{product.category}</p>
            <h1 className="font-serif text-4xl md:text-5xl mt-3 font-light leading-tight">{product.name}</h1>

            <div className="flex items-center gap-2 mt-4">
              <Star size={14} fill="currentColor" strokeWidth={0} />
              <span className="text-sm opacity-70">{product.rating} ({product.reviews_count} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mt-6">
              <p className="text-3xl font-medium" data-testid="detail-price">${product.price.toFixed(0)}</p>
              {product.original_price && <p className="opacity-50 line-through">${product.original_price.toFixed(0)}</p>}
            </div>

            <p className="mt-8 text-sm opacity-75 leading-relaxed max-w-lg">{product.description}</p>

            {product.sizes?.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between">
                  <p className="text-eyebrow opacity-60">Size</p>
                  <button className="text-eyebrow opacity-60 underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      data-testid={`size-${s}`}
                      onClick={() => setSize(s)}
                      className={`min-w-[52px] h-11 px-4 text-xs border transition-colors ${
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

            <div className="mt-10 flex gap-3">
              <button
                data-testid="pdp-add-to-cart"
                onClick={() => addToCart(product.id, { size })}
                className="flex-1 bg-foreground text-background py-4 text-eyebrow inline-flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors"
              >
                <ShoppingBag size={14} strokeWidth={1.5} /> Add to Bag — ${product.price.toFixed(0)}
              </button>
              <button
                data-testid="pdp-wishlist"
                onClick={() => toggleWishlist(product.id)}
                className="px-5 border border-border hover:bg-secondary"
                aria-label="Wishlist"
              >
                <Heart size={18} strokeWidth={1.5} fill={liked ? "currentColor" : "none"} />
              </button>
            </div>

            <ul className="mt-10 space-y-3 text-sm opacity-75">
              <li className="flex items-center gap-3"><Truck size={16} strokeWidth={1.5} /> Complimentary shipping over $250</li>
              <li className="flex items-center gap-3"><Shield size={16} strokeWidth={1.5} /> 30-day atelier returns</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
