import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";

import "@/App.css";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ShopProvider } from "./context/ShopContext";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CartDrawer from "./components/layout/CartDrawer";

import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AboutPage from "./pages/AboutPage";

import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";

function SmoothScroll({ children }) {
  const location = useLocation();
  useEffect(() => {
    // Disable Lenis on admin routes (sticky sidebar conflicts with smooth scroll)
    if (location.pathname.startsWith("/admin")) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, [location.pathname]);
  return children;
}

function PublicShell({ children }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      {children}
      <Footer />
    </>
  );
}

function Shell() {
  return (
    <div className="App relative">
      <Routes>
        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Public */}
        <Route path="/" element={<PublicShell><HomePage /></PublicShell>} />
        <Route path="/shop" element={<PublicShell><ShopPage /></PublicShell>} />
        <Route path="/product/:id" element={<PublicShell><ProductDetailPage /></PublicShell>} />
        <Route path="/wishlist" element={<PublicShell><WishlistPage /></PublicShell>} />
        <Route path="/about" element={<PublicShell><AboutPage /></PublicShell>} />
        <Route path="/login" element={<PublicShell><LoginPage /></PublicShell>} />
        <Route path="/register" element={<PublicShell><RegisterPage /></PublicShell>} />
        <Route path="*" element={<PublicShell><HomePage /></PublicShell>} />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 0,
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ShopProvider>
            <SmoothScroll>
              <Shell />
            </SmoothScroll>
          </ShopProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
