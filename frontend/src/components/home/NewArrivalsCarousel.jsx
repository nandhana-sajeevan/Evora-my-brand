import { useEffect, useState, useRef } from "react";
import api from "../../lib/api";
import ProductCard from "../shop/ProductCard";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function NewArrivalsCarousel() {
  const [products, setProducts] = useState([]);
  const scrollerRef = useRef(null);

  useEffect(() => {
    api.get("/products", { params: { is_new: true } }).then(({ data }) => setProducts(data)).catch(() => {});
  }, []);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-carousel-item]");
    const dist = card ? card.clientWidth + 24 : 320;
    el.scrollBy({ left: dir * dist, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section data-testid="new-arrivals" className="section-y bg-secondary/40">
      <div className="container-fluid">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <p className="text-eyebrow opacity-60">03 — Just Landed</p>
            <h2 className="font-serif text-4xl md:text-6xl font-light leading-[0.95] mt-3">
              New arrivals.
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              data-testid="carousel-prev"
              onClick={() => scrollBy(-1)}
              className="w-12 h-12 border border-border hover:bg-background flex items-center justify-center"
              aria-label="Previous"
            >
              <ArrowLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              data-testid="carousel-next"
              onClick={() => scrollBy(1)}
              className="w-12 h-12 border border-border hover:bg-background flex items-center justify-center"
              aria-label="Next"
            >
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto pl-6 md:pl-12 lg:pl-24 pr-6 pb-4 no-scrollbar snap-x snap-mandatory"
      >
        {products.map((p, i) => (
          <div
            key={p.id}
            data-carousel-item
            className="snap-start flex-shrink-0 w-[80vw] sm:w-[45vw] md:w-[32vw] lg:w-[22vw]"
          >
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
