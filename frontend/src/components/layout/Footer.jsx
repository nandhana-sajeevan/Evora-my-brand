import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer data-testid="footer" className="bg-foreground text-background mt-32">
      <div className="container-fluid py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="font-serif text-5xl md:text-6xl tracking-[0.2em] font-light">ÉVORA</div>
            <p className="mt-6 max-w-md text-sm leading-relaxed opacity-70">
              Crafted slowly. Worn endlessly. ÉVORA is a study in quiet luxury — editorial silhouettes, considered fabrics,
              made for a life of intention.
            </p>
            <p className="mt-8 text-eyebrow opacity-60">Timeless Style, Elevated You.</p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-eyebrow opacity-60 mb-5">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop?category=Oversized%20Tees" className="hover:opacity-60">Oversized Tees</Link></li>
              <li><Link to="/shop?category=Hoodies" className="hover:opacity-60">Hoodies</Link></li>
              <li><Link to="/shop?category=Jackets" className="hover:opacity-60">Jackets</Link></li>
              <li><Link to="/shop?category=Streetwear" className="hover:opacity-60">Streetwear</Link></li>
              <li><Link to="/shop?category=Accessories" className="hover:opacity-60">Accessories</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-eyebrow opacity-60 mb-5">House</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:opacity-60">About ÉVORA</Link></li>
              <li><a href="#" className="hover:opacity-60">Journal</a></li>
              <li><a href="#" className="hover:opacity-60">Sustainability</a></li>
              <li><a href="#" className="hover:opacity-60">Press</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-eyebrow opacity-60 mb-5">Contact</h4>
            <ul className="space-y-3 text-sm opacity-90">
              <li>concierge@evora.studio</li>
              <li>+1 (555) 022-3001</li>
              <li>54 Mercer St, New York</li>
            </ul>
            <div className="flex gap-4 mt-8" data-testid="social-icons">
              <a href="#" aria-label="Instagram" className="hover:opacity-60"><Instagram size={18} strokeWidth={1.5} /></a>
              <a href="#" aria-label="Twitter" className="hover:opacity-60"><Twitter size={18} strokeWidth={1.5} /></a>
              <a href="#" aria-label="Youtube" className="hover:opacity-60"><Youtube size={18} strokeWidth={1.5} /></a>
              <a href="#" aria-label="Facebook" className="hover:opacity-60"><Facebook size={18} strokeWidth={1.5} /></a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-background/15 flex flex-col md:flex-row justify-between gap-4 text-[11px] tracking-widest uppercase opacity-50">
          <p>© {new Date().getFullYear()} ÉVORA Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
