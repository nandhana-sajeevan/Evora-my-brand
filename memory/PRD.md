# ÉVORA — Product Requirements Document

## Original Problem Statement
Build a modern luxury fashion e-commerce website for clothing brand "ÉVORA" inspired by Stylish Wardrobe.
Soft beige/white/black palette, editorial typography, premium minimal aesthetic, smooth Apple-like animations.
Tagline: **"Timeless Style, Elevated You."**
Tech: React + Tailwind frontend, FastAPI backend, MongoDB.

## Architecture
- **Frontend**: React (CRA), Tailwind, framer-motion, Lenis (smooth scroll), sonner (toasts), shadcn/ui, lucide-react
- **Backend**: FastAPI + Motor (async Mongo), bcrypt + PyJWT auth, all routes prefixed `/api`
- **DB**: MongoDB collections — `users`, `products`, `cart`, `wishlist`, `newsletter`
- **Auth**: Email/password JWT, httpOnly cookie + Bearer-token fallback (localStorage `evora_token`)
- **Fonts**: Cormorant Garamond (display) + Outfit (body), loaded via Google Fonts

## User Personas
1. **Editorial shopper** — Discovers via hero/promo banners; values aesthetics, fabric story, slow craft.
2. **Returning member** — Maintains wishlist + cart, expects fast filtering and recurring drops.
3. **First-time visitor** — Lands on home; explores about, testimonials, subscribes to newsletter.

## Core Requirements (Static)
- Sticky responsive navbar (logo, search, wishlist, cart, login, theme toggle, mobile menu)
- Fullscreen hero with editorial CTAs
- Featured categories (5 tiles)
- Trending product grid with hover, ratings, wishlist, quick-view, quick-add
- New arrivals horizontal carousel
- Promotional collection banners (12-col bento)
- About brand section with stats
- Testimonials (dark inverted band)
- Newsletter subscription
- Premium footer with social links
- Dark/light mode toggle
- Cart drawer + wishlist page
- Product filtering & sorting (URL-backed)
- Auth pages (login/register)
- Smooth Lenis scrolling, framer-motion entrance animations
- SEO meta + Open Graph

## Implemented (2026-02-12)
- ✅ Backend: 4 routers (auth/products/cart/wishlist/newsletter/categories), 12 seeded products, admin seed, JWT auth (cookie + Bearer), idempotent seeders
- ✅ Frontend: All sections built (Hero, Categories, Trending, Promo, NewArrivals, About, Testimonials, Newsletter), ProductCard with hover/quick-view/wishlist, QuickViewDialog, CartDrawer, Navbar (sticky/glass/marquee/search overlay/mobile menu), Footer
- ✅ Pages: Home, Shop (URL params for filter/sort/search), Product Detail, Wishlist, Login, Register, About
- ✅ Theme system: light/dark CSS variables, localStorage persistence
- ✅ Smooth scroll (Lenis) + framer-motion staggered animations
- ✅ Testing: 100% backend (21/21 pytest), 100% frontend on tested flows

## Prioritized Backlog
### P0 (next iteration)
- Stripe checkout integration
- Size guide modal
- Product reviews collection + UI
- Account/orders page

### P1
- Search across category/description (currently name-only)
- Advanced filters (price range, color, size)
- Recently viewed products
- Personalized "You may also like"

### P2
- Editorial journal/blog
- Multi-currency switcher
- Email confirmations via Resend/SendGrid
- Brute-force lockout on login (5 fails / 15-min lockout)

## Test Credentials
See `/app/memory/test_credentials.md`.

## Notes
- All product IDs are UUIDs on `id` field (not Mongo `_id`).
- Newsletter dedupes by email (returns `already_subscribed: true`).
- Cart aggregates same `product_id + size` (increments quantity).
