import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Package, Tag, Image, ShoppingCart, Users, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex" data-testid="admin-layout">
      <aside className="w-64 border-r border-border bg-secondary/30 flex flex-col h-screen sticky top-0">
        <Link to="/" className="px-6 py-6 border-b border-border block hover:bg-secondary transition-colors" data-testid="admin-brand">
          <div className="font-serif text-2xl tracking-[0.35em] font-light">ÉVORA</div>
          <div className="text-eyebrow opacity-60 mt-1">Atelier · Admin</div>
        </Link>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              data-testid={`admin-nav-${label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "hover:bg-secondary text-foreground/80 hover:text-foreground"
                }`
              }
            >
              <Icon size={16} strokeWidth={1.5} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-border space-y-2">
          {user && (
            <div className="px-3 py-2 text-xs opacity-70">
              <div className="font-medium text-sm text-foreground">{user.name}</div>
              <div className="opacity-60 truncate">{user.email}</div>
            </div>
          )}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-secondary transition-colors"
            data-testid="admin-back-to-site"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> Back to site
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-secondary transition-colors"
            data-testid="admin-logout"
          >
            <LogOut size={14} strokeWidth={1.5} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="px-8 lg:px-12 py-10 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
