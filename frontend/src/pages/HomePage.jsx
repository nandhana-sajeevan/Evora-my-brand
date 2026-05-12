import Hero from "../components/home/Hero";
import FeaturedCategories from "../components/home/FeaturedCategories";
import TrendingProducts from "../components/home/TrendingProducts";
import NewArrivalsCarousel from "../components/home/NewArrivalsCarousel";
import PromoBanners from "../components/home/PromoBanners";
import AboutBrand from "../components/home/AboutBrand";
import Testimonials from "../components/home/Testimonials";
import Newsletter from "../components/home/Newsletter";

export default function HomePage() {
  return (
    <main data-testid="home-page">
      <Hero />
      <FeaturedCategories />
      <TrendingProducts />
      <PromoBanners />
      <NewArrivalsCarousel />
      <AboutBrand />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
