import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import ProductCard from "../components/shop/ProductCard";
import QuickViewDialog from "../components/shop/QuickViewDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const CATEGORIES = ["All", "Oversized Tees", "Hoodies", "Jackets", "Streetwear", "Accessories"];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qv, setQv] = useState(null);

  const category = searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || "";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== "All") params.category = category;
    if (sort) params.sort = sort;
    if (search) params.search = search;
    api.get("/products", { params })
      .then(({ data }) => setProducts(data))
      .finally(() => setLoading(false));
  }, [category, sort, search]);

  const update = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (!val || val === "All" || val === "default") next.delete(key);
    else next.set(key, val);
    setSearchParams(next);
  };

  return (
    <main data-testid="shop-page" className="pt-32 md:pt-40 pb-24">
      <div className="container-fluid">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-eyebrow opacity-60">The Shop</p>
            <h1 className="font-serif text-5xl md:text-7xl font-light leading-[0.95] mt-3">
              {category === "All" ? "All Pieces" : category}
            </h1>
            {search && <p className="mt-3 opacity-60 text-sm">Results for "{search}"</p>}
          </div>
          <div className="flex items-center gap-3">
            <Select value={sort || "default"} onValueChange={(v) => update("sort", v)}>
              <SelectTrigger className="w-[200px] rounded-none border-border" data-testid="sort-select">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Featured</SelectItem>
                <SelectItem value="newest">New arrivals</SelectItem>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-12 border-y border-border py-5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              data-testid={`filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => update("category", c)}
              className={`px-5 py-2 text-eyebrow transition-colors ${
                (category || "All") === c
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center py-20 opacity-60">No pieces found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onQuickView={setQv} />
            ))}
          </div>
        )}

        <QuickViewDialog product={qv} open={!!qv} onOpenChange={(o) => !o && setQv(null)} />
      </div>
    </main>
  );
}
