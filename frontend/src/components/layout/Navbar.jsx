import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";

const NAV_LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/shop?category=Hoodies", label: "Collections" },
  { to: "/about", label: "About" },
  { to: "/shop?category=Streetwear", label: "Journal" },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const { cartCount, setCartOpen, wishlist } = useShop();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal("");
    }
  };

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-2xl bg-background/70 border-b border-border/40"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Marquee announcement */}
      <div className="bg-foreground text-background overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee py-2 text-[10px] tracking-[0.3em] uppercase">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="px-8">Complimentary shipping over $250 — Timeless Style, Elevated You.</span>
          ))}
        </div>
      </div>

      <nav className="container-fluid flex items-center justify-between h-16 md:h-20">
        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 -ml-2"
          aria-label="Open menu"
        >
          {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>

        <ul className="hidden md:flex items-center gap-10 text-eyebrow flex-1">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <NavLink
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                to={l.to}
                className={({ isActive }) =>
                  `relative py-2 hover:opacity-60 transition-opacity ${isActive ? "opacity-100" : "opacity-80"}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <Link
          to="/"
          data-testid="brand-logo"
          className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl md:text-3xl tracking-[0.35em] font-light"
        >
          ÉVORA
        </Link>

        <div className="flex items-center gap-1 md:gap-3 flex-1 justify-end">
          <button
            data-testid="search-toggle"
            onClick={() => setSearchOpen((v) => !v)}
            className="p-2 hover:opacity-60 transition-opacity"
            aria-label="Search"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>
          <button
            data-testid="theme-toggle"
            onClick={toggle}
            className="p-2 hover:opacity-60 transition-opacity"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          </button>
          <Link
            data-testid="wishlist-link"
            to="/wishlist"
            className="p-2 hover:opacity-60 transition-opacity relative"
            aria-label="Wishlist"
          >
            <Heart size={18} strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-foreground text-background text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button
            data-testid="cart-toggle"
            onClick={() => setCartOpen(true)}
            className="p-2 hover:opacity-60 transition-opacity relative"
            aria-label="Cart"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-foreground text-background text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          {user && typeof user === "object" ? (
            <div className="hidden md:flex items-center gap-3 pl-2">
              {user.role === "admin" && (
                <Link
                  data-testid="admin-link"
                  to="/admin"
                  className="text-eyebrow border border-foreground px-3 py-1 hover:bg-foreground hover:text-background transition-colors"
                >
                  Admin
                </Link>
              )}
              <span className="text-eyebrow opacity-70" data-testid="user-name">{user.name?.split(" ")[0]}</span>
              <button
                data-testid="logout-btn"
                onClick={logout}
                className="text-eyebrow hover:opacity-60 transition-opacity"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              data-testid="login-link"
              to="/login"
              className="hidden md:inline-flex items-center gap-2 text-eyebrow hover:opacity-60 transition-opacity pl-2"
            >
              <User size={16} strokeWidth={1.5} /> Account
            </Link>
          )}
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <form onSubmit={submitSearch} className="container-fluid py-6 flex items-center gap-4">
            <Search size={20} strokeWidth={1.5} className="opacity-60" />
            <input
              data-testid="search-input"
              autoFocus
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search for hoodies, jackets, tees..."
              className="flex-1 bg-transparent outline-none text-lg tracking-wide placeholder:opacity-40"
            />
            <button
              type="submit"
              data-testid="search-submit"
              className="text-eyebrow px-4 py-2 border border-border hover:bg-secondary transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <ul className="container-fluid py-6 space-y-4">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  onClick={() => setMobileOpen(false)}
                  to={l.to}
                  className="block py-2 text-eyebrow"
                  data-testid={`mobile-nav-${l.label.toLowerCase()}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              {user && typeof user === "object" ? (
                <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-2 text-eyebrow">Logout</button>
              ) : (
                <Link onClick={() => setMobileOpen(false)} to="/login" className="block py-2 text-eyebrow">Account</Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
