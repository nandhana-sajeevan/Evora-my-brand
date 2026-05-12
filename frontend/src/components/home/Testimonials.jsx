import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "The hoodie has the weight and drape I haven't felt since I lived in Tokyo. ÉVORA understands fabric in a way most houses no longer do.",
    name: "Maya Asano",
    role: "Creative Director, Numéro",
  },
  {
    quote: "I bought one piece a year ago and have worn it through every season since. It still looks like the day it arrived.",
    name: "Idris Vance",
    role: "Architect, London",
  },
  {
    quote: "Editorial without being precious. Streetwear without the noise. A rare line.",
    name: "Elena Costa",
    role: "Stylist, Vogue Italia",
  },
];

export default function Testimonials() {
  return (
    <section data-testid="testimonials" className="section-y bg-foreground text-background">
      <div className="container-fluid">
        <p className="text-eyebrow opacity-60">05 — Words From the Quiet</p>
        <h2 className="font-serif text-4xl md:text-6xl font-light leading-[0.95] mt-4 max-w-3xl">
          What our wearers say.
        </h2>

        <div className="grid md:grid-cols-3 gap-10 md:gap-12 mt-16 md:mt-24">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={i}
              data-testid={`testimonial-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-background/15 pt-8"
            >
              <p className="font-serif text-2xl md:text-[28px] font-light leading-snug italic">
                "{t.quote}"
              </p>
              <figcaption className="mt-8">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-eyebrow opacity-60 mt-1">{t.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
