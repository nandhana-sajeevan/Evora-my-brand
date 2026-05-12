import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../lib/api";
import { resolveUrl } from "../admin/ImageUploader";

export default function FeaturedCategories() {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    api.get("/categories").then(({ data }) => setCats(data)).catch(() => {});
  }, []);

  return (
    <section data-testid="categories-section" className="section-y container-fluid">
      <div className="flex items-end justify-between mb-12 md:mb-16">
        <div>
          <p className="text-eyebrow opacity-60">01 — Categories</p>
          <h2 className="font-serif text-4xl md:text-6xl font-light leading-[0.95] mt-3 max-w-2xl">
            The Edit, by category.
          </h2>
        </div>
        <Link to="/shop" className="hidden md:inline-block text-eyebrow border-b border-foreground pb-1 hover:opacity-60">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6">
        {cats.map((c, i) => (
          <motion.div
            key={c.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group"
          >
            <Link
              to={`/shop?category=${encodeURIComponent(c.name)}`}
              data-testid={`category-${c.slug}`}
              className="block"
            >
              <div className="aspect-[3/4] overflow-hidden bg-secondary">
                <img
                  src={resolveUrl(c.image)}
                  alt={c.name}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-serif text-xl md:text-2xl">{c.name}</p>
                <span className="text-eyebrow opacity-60 group-hover:opacity-100">→</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
