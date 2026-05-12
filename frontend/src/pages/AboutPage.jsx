import AboutBrand from "../components/home/AboutBrand";
import Testimonials from "../components/home/Testimonials";
import Newsletter from "../components/home/Newsletter";

export default function AboutPage() {
  return (
    <main data-testid="about-page" className="pt-28 md:pt-36">
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1649624964799-609681c92d1b"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full container-fluid flex items-end pb-16 text-white">
          <div>
            <p className="text-eyebrow text-white/80">About ÉVORA</p>
            <h1 className="font-serif text-5xl md:text-7xl font-light mt-3 leading-[0.95] max-w-2xl">
              Crafted slowly.<br/>Worn endlessly.
            </h1>
          </div>
        </div>
      </section>
      <AboutBrand />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
