import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../lib/api";
import { resolveUrl } from "../admin/ImageUploader";

export default function PromoBanners() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    api.get("/banners").then(({ data }) => {
      setBanners(data.filter((b) => b.placement === "promo" && b.active));
    }).catch(() => {});
  }, []);

  if (banners.length === 0) return null;

  const [big, small] = banners;

  return (
    <section data-testid="promo-banners" className="section-y container-fluid">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {big && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`relative aspect-[16/10] md:aspect-[16/9] overflow-hidden group ${small ? "md:col-span-8" : "md:col-span-12"}`}
          >
            <img
              src={resolveUrl(big.image)}
              alt={big.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-8 md:p-12 text-white">
              {big.subtitle && <p className="text-eyebrow text-white/80">{big.subtitle}</p>}
              <h3 className="font-serif text-4xl md:text-6xl mt-3 font-light max-w-md leading-tight">{big.title}</h3>
              {big.cta_label && (
                <Link
                  to={big.cta_link || "/shop"}
                  data-testid="promo-big-cta"
                  className="mt-6 inline-block w-fit border border-white/50 px-7 py-3 text-eyebrow hover:bg-white hover:text-black transition-colors"
                >
                  {big.cta_label}
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {small && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-4 relative aspect-[16/10] md:aspect-auto overflow-hidden group bg-accent"
          >
            <img
              src={resolveUrl(small.image)}
              alt={small.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative h-full flex flex-col justify-end p-8 text-white">
              {small.subtitle && <p className="text-eyebrow text-white/80">{small.subtitle}</p>}
              <h3 className="font-serif text-3xl md:text-4xl mt-3 font-light leading-tight">{small.title}</h3>
              {small.cta_label && (
                <Link
                  to={small.cta_link || "/shop"}
                  data-testid="promo-small-cta"
                  className="mt-5 inline-block w-fit border border-white/50 px-6 py-2.5 text-eyebrow hover:bg-white hover:text-black transition-colors"
                >
                  {small.cta_label}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
