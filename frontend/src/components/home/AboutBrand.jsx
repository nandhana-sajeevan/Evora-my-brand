import { motion } from "framer-motion";

export default function AboutBrand() {
  return (
    <section data-testid="about-section" className="section-y container-fluid">
      <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-6 aspect-[4/5] overflow-hidden bg-secondary"
        >
          <img
            src="https://images.unsplash.com/photo-1649624964799-609681c92d1b"
            alt="ÉVORA atelier"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-6"
        >
          <p className="text-eyebrow opacity-60">04 — About the House</p>
          <h2 className="font-serif text-4xl md:text-6xl font-light leading-[0.95] mt-4 max-w-lg">
            A quieter form of luxury.
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed max-w-lg opacity-80">
            <p>
              ÉVORA is a study in slow craft. Founded in Milan in 2022, the house designs editorial essentials —
              objects that hold their shape, deepen with age, and accompany the wearer through years rather than seasons.
            </p>
            <p>
              We work with small mills in Italy, Portugal and Japan. Every fabric is selected for hand and longevity.
              Every garment is finished by hand. Nothing is rushed. Nothing is approximate.
            </p>
            <p>
              Quiet luxury. Considered streetwear. Pieces designed to outlast the cycle.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
            {[
              { k: "12", l: "Mills, hand-selected" },
              { k: "4", l: "Cities of craft" },
              { k: "100%", l: "Finished by hand" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-serif text-4xl md:text-5xl font-light">{s.k}</p>
                <p className="text-eyebrow opacity-60 mt-2">{s.l}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
