import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../../lib/api";
import { resolveUrl } from "../admin/ImageUploader";

const FALLBACK = {
  title: "Timeless Style, Elevated You.",
  subtitle: "Fall · Winter 26 — Volume I",
  cta_label: "Shop the Collection",
  cta_link: "/shop",
  image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80",
};

export default function Hero() {
  const [b, setB] = useState(FALLBACK);

  useEffect(() => {
    api.get("/banners").then(({ data }) => {
      const hero = data.find((x) => x.placement === "hero" && x.active);
      if (hero) setB(hero);
    }).catch(() => {});
  }, []);

  return (
    <section data-testid="hero" className="relative h-screen min-h-[640px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <img src={resolveUrl(b.image)} alt={b.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/30" />
      </div>

      <div className="relative h-full container-fluid flex flex-col justify-end pb-16 md:pb-24 text-white">
        {b.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-eyebrow text-white/80"
          >
            {b.subtitle}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[112px] font-light tracking-tight leading-[0.95] mt-4 max-w-4xl"
        >
          {b.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-md text-base md:text-lg opacity-85 leading-relaxed"
        >
          A measured study in luxury streetwear — editorial silhouettes, considered fabrics, finished by hand in our atelier.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap gap-4"
        >
          {b.cta_label && (
            <Link
              to={b.cta_link || "/shop"}
              data-testid="hero-cta-shop"
              className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-eyebrow hover:bg-white/90 transition-colors"
            >
              {b.cta_label}
              <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          <Link
            to="/about"
            data-testid="hero-cta-about"
            className="inline-flex items-center gap-3 border border-white/40 text-white px-8 py-4 text-eyebrow hover:bg-white/10 transition-colors"
          >
            Discover the House
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-[10px] tracking-[0.3em] uppercase">
        Scroll
      </div>
    </section>
  );
}
