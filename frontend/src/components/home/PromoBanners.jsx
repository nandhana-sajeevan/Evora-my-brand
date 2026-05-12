import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function PromoBanners() {
  return (
    <section data-testid="promo-banners" className="section-y container-fluid">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Large banner */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-8 relative aspect-[16/10] md:aspect-[16/9] overflow-hidden group"
        >
          <img
            src="https://images.unsplash.com/photo-1649624963958-554d32e28c55"
            alt="The Outerwear Edit"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          <div className="relative h-full flex flex-col justify-end p-8 md:p-12 text-white">
            <p className="text-eyebrow text-white/80">The Outerwear Edit</p>
            <h3 className="font-serif text-4xl md:text-6xl mt-3 font-light max-w-md leading-tight">
              For the cold pursuits.
            </h3>
            <Link
              to="/shop?category=Jackets"
              data-testid="promo-outerwear-cta"
              className="mt-6 inline-block w-fit border border-white/50 px-7 py-3 text-eyebrow hover:bg-white hover:text-black transition-colors"
            >
              Explore Jackets
            </Link>
          </div>
        </motion.div>

        {/* Small banner */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-4 relative aspect-[16/10] md:aspect-auto overflow-hidden group bg-accent"
        >
          <img
            src="https://images.unsplash.com/photo-1649624964799-609681c92d1b"
            alt="Accessories"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative h-full flex flex-col justify-end p-8 text-white">
            <p className="text-eyebrow text-white/80">Accessories</p>
            <h3 className="font-serif text-3xl md:text-4xl mt-3 font-light leading-tight">
              The finishing touch.
            </h3>
            <Link
              to="/shop?category=Accessories"
              data-testid="promo-accessories-cta"
              className="mt-5 inline-block w-fit border border-white/50 px-6 py-2.5 text-eyebrow hover:bg-white hover:text-black transition-colors"
            >
              Shop
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
