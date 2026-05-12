import { useEffect, useState } from "react";
import api from "../../lib/api";
import ProductCard from "../shop/ProductCard";
import QuickViewDialog from "../shop/QuickViewDialog";
import { Link } from "react-router-dom";

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [qv, setQv] = useState(null);

  useEffect(() => {
    api.get("/products", { params: { trending: true } }).then(({ data }) => setProducts(data.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <section data-testid="trending-section" className="section-y container-fluid">
      <div className="flex items-end justify-between mb-12 md:mb-16">
        <div>
          <p className="text-eyebrow opacity-60">02 — Trending</p>
          <h2 className="font-serif text-4xl md:text-6xl font-light leading-[0.95] mt-3 max-w-2xl">
            What everyone's wearing.
          </h2>
        </div>
        <Link to="/shop" className="hidden md:inline-block text-eyebrow border-b border-foreground pb-1 hover:opacity-60">
          Shop All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} onQuickView={setQv} />
        ))}
      </div>

      <QuickViewDialog product={qv} open={!!qv} onOpenChange={(o) => !o && setQv(null)} />
    </section>
  );
}
