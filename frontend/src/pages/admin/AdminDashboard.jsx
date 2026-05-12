import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Tag, ShoppingCart, Users, Image, Mail, ArrowUpRight } from "lucide-react";
import api from "../../lib/api";

const TILES = [
  { key: "products", label: "Products", icon: Package, to: "/admin/products" },
  { key: "categories", label: "Categories", icon: Tag, to: "/admin/categories" },
  { key: "orders", label: "Orders", icon: ShoppingCart, to: "/admin/orders" },
  { key: "pending_orders", label: "Pending", icon: ShoppingCart, to: "/admin/orders" },
  { key: "users", label: "Users", icon: Users, to: "/admin/users" },
  { key: "admins", label: "Admins", icon: Users, to: "/admin/users" },
  { key: "newsletter_subs", label: "Newsletter", icon: Mail, to: "#" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data));
    api.get("/admin/orders").then(({ data }) => setOrders(data.slice(0, 5)));
  }, []);

  return (
    <div data-testid="admin-dashboard">
      <header className="mb-10">
        <p className="text-eyebrow opacity-60">Atelier</p>
        <h1 className="font-serif text-5xl md:text-6xl font-light mt-2">Dashboard</h1>
        <p className="mt-3 opacity-70 text-sm">Overview of the house at a glance.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {TILES.map(({ key, label, icon: Icon, to }) => (
          <Link
            key={key + label}
            to={to}
            data-testid={`stat-${key}`}
            className="border border-border p-6 hover:bg-secondary/50 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <Icon size={18} strokeWidth={1.5} className="opacity-70" />
              <ArrowUpRight size={14} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="font-serif text-4xl md:text-5xl font-light mt-6">{stats[key] ?? "—"}</div>
            <div className="text-eyebrow opacity-60 mt-2">{label}</div>
          </Link>
        ))}
      </div>

      <section className="mt-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-serif text-3xl font-light">Recent orders</h2>
          <Link to="/admin/orders" className="text-eyebrow opacity-70 hover:opacity-100">View all →</Link>
        </div>
        {orders.length === 0 ? (
          <div className="border border-border p-10 text-center opacity-60 text-sm">
            No orders yet. New orders will appear here.
          </div>
        ) : (
          <div className="border border-border">
            <table className="w-full text-sm" data-testid="recent-orders-table">
              <thead className="bg-secondary/50 text-eyebrow text-left">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-5 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                    <td className="px-5 py-3">{o.user_name || o.user_email}</td>
                    <td className="px-5 py-3">${o.total.toFixed(2)}</td>
                    <td className="px-5 py-3 capitalize">{o.status}</td>
                    <td className="px-5 py-3 opacity-70">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
