import { useEffect, useState } from "react";
import api from "../../lib/api";
import { resolveUrl } from "../../components/admin/ImageUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { toast } from "sonner";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const STATUS_CLASS = {
  pending: "bg-accent text-accent-foreground",
  processing: "bg-foreground text-background",
  shipped: "bg-foreground text-background",
  delivered: "bg-secondary text-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [viewing, setViewing] = useState(null);

  const load = () => api.get("/admin/orders").then(({ data }) => setOrders(data));
  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const updateStatus = async (orderId, status) => {
    try {
      const { data } = await api.put(`/admin/orders/${orderId}/status`, { status });
      setOrders((arr) => arr.map((o) => (o.id === orderId ? data : o)));
      if (viewing?.id === orderId) setViewing(data);
      toast("Status updated");
    } catch (e) {
      toast.error("Failed", { description: e.response?.data?.detail });
    }
  };

  return (
    <div data-testid="admin-orders">
      <header className="mb-8">
        <p className="text-eyebrow opacity-60">Operations</p>
        <h1 className="font-serif text-4xl md:text-5xl font-light mt-2">Orders</h1>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            data-testid={`order-filter-${s}`}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-eyebrow transition-colors ${filter === s ? "bg-foreground text-background" : "border border-border hover:bg-secondary"}`}
          >
            {s} ({s === "all" ? orders.length : orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>

      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-eyebrow text-left">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border" data-testid={`order-row-${o.id}`}>
                <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{o.user_name}</div>
                  <div className="text-xs opacity-60">{o.user_email}</div>
                </td>
                <td className="px-4 py-3">{o.items?.length}</td>
                <td className="px-4 py-3 font-medium">${o.total?.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <select
                    data-testid={`order-status-${o.id}`}
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className={`text-eyebrow px-2 py-1 border border-border bg-transparent ${STATUS_CLASS[o.status] || ""}`}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 opacity-70 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <button data-testid={`view-order-${o.id}`} onClick={() => setViewing(o)} className="text-eyebrow underline opacity-70 hover:opacity-100">
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-16 opacity-60 text-sm">No orders.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-none border-border" data-testid="order-detail-dialog">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl font-light">Order details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="mt-2 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-eyebrow opacity-60">Order ID</div><div className="font-mono">{viewing.id}</div></div>
                <div><div className="text-eyebrow opacity-60">Status</div><div className="capitalize">{viewing.status}</div></div>
                <div><div className="text-eyebrow opacity-60">Customer</div><div>{viewing.user_name}<br/><span className="opacity-60 text-xs">{viewing.user_email}</span></div></div>
                <div><div className="text-eyebrow opacity-60">Placed</div><div>{new Date(viewing.created_at).toLocaleString()}</div></div>
              </div>
              {viewing.shipping_address && (
                <div><div className="text-eyebrow opacity-60 mb-1">Shipping</div><div className="text-sm opacity-80 whitespace-pre-wrap">{viewing.shipping_address}</div></div>
              )}
              <div>
                <div className="text-eyebrow opacity-60 mb-2">Items</div>
                <div className="border border-border divide-y divide-border">
                  {viewing.items?.map((it, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <div className="w-12 h-14 bg-secondary overflow-hidden">{it.image && <img src={resolveUrl(it.image)} alt="" className="w-full h-full object-cover" />}</div>
                      <div className="flex-1">
                        <div className="font-medium">{it.product_name}</div>
                        <div className="text-xs opacity-60">{it.size ? `Size ${it.size} · ` : ""}Qty {it.quantity} · ${it.price.toFixed(2)}</div>
                      </div>
                      <div className="font-medium">${(it.price * it.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between border-t border-border pt-4">
                <span className="text-eyebrow opacity-60">Total</span>
                <span className="font-medium text-lg">${viewing.total?.toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
