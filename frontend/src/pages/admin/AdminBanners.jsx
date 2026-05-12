import { useEffect, useState } from "react";
import api from "../../lib/api";
import ImageUploader, { resolveUrl } from "../../components/admin/ImageUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const EMPTY = { title: "", subtitle: "", cta_label: "", cta_link: "", image: "", placement: "hero", order: 0, active: true };

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => api.get("/admin/banners").then(({ data }) => setBanners(data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.title || !editing.image) return toast.error("Title and image are required");
    setSaving(true);
    try {
      const payload = { ...editing, order: parseInt(editing.order) || 0 };
      if (editing.id) await api.put(`/admin/banners/${editing.id}`, payload);
      else await api.post("/admin/banners", payload);
      toast("Saved");
      await load();
      setEditing(null);
    } catch (e) {
      toast.error("Save failed", { description: e.response?.data?.detail });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/banners/${id}`);
      toast("Deleted");
      await load();
      setConfirmDelete(null);
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  return (
    <div data-testid="admin-banners">
      <header className="flex items-end justify-between mb-8">
        <div>
          <p className="text-eyebrow opacity-60">Storefront</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light mt-2">Banners</h1>
          <p className="mt-2 text-sm opacity-70">Hero & promotional banners shown on the homepage.</p>
        </div>
        <button
          data-testid="new-banner-btn"
          onClick={() => setEditing({ ...EMPTY })}
          className="bg-foreground text-background px-6 py-3 text-eyebrow flex items-center gap-2"
        >
          <Plus size={14} strokeWidth={1.5} /> New Banner
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b.id} data-testid={`banner-card-${b.id}`} className="border border-border">
            <div className="relative aspect-[16/9] bg-secondary overflow-hidden">
              {b.image && <img src={resolveUrl(b.image)} alt="" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <p className="text-eyebrow text-white/80">{b.subtitle}</p>
                <h3 className="font-serif text-3xl font-light mt-2">{b.title}</h3>
              </div>
              <span className={`absolute top-3 right-3 text-[10px] tracking-widest uppercase px-2 py-1 ${b.active ? "bg-foreground text-background" : "bg-destructive text-destructive-foreground"}`}>
                {b.placement} {b.active ? "" : "· off"}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="text-xs opacity-70">Order: {b.order} · CTA: {b.cta_label || "—"}</div>
              <div className="flex gap-1">
                <button data-testid={`edit-banner-${b.id}`} onClick={() => setEditing({ ...b })} className="p-2 hover:bg-secondary" aria-label="Edit">
                  <Edit2 size={14} strokeWidth={1.5} />
                </button>
                <button data-testid={`delete-banner-${b.id}`} onClick={() => setConfirmDelete(b)} className="p-2 hover:bg-destructive/10 text-destructive" aria-label="Delete">
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="col-span-full border border-dashed border-border p-16 text-center opacity-60 text-sm">
            No banners yet. Create one to get started.
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-none border-border" data-testid="banner-editor">
          <DialogHeader><DialogTitle className="font-serif text-3xl font-light">{editing?.id ? "Edit Banner" : "New Banner"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 mt-2">
              <label className="block">
                <span className="text-eyebrow opacity-60 block mb-2">Image</span>
                <ImageUploader testId="banner-image" value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block col-span-2">
                  <span className="text-eyebrow opacity-60 block mb-2">Title *</span>
                  <input data-testid="banner-title" className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </label>
                <label className="block col-span-2">
                  <span className="text-eyebrow opacity-60 block mb-2">Subtitle</span>
                  <input className={inputCls} value={editing.subtitle || ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-eyebrow opacity-60 block mb-2">CTA Label</span>
                  <input className={inputCls} value={editing.cta_label || ""} onChange={(e) => setEditing({ ...editing, cta_label: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-eyebrow opacity-60 block mb-2">CTA Link</span>
                  <input className={inputCls} value={editing.cta_link || ""} onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })} placeholder="/shop?category=..." />
                </label>
                <label className="block">
                  <span className="text-eyebrow opacity-60 block mb-2">Placement</span>
                  <select data-testid="banner-placement" className={inputCls} value={editing.placement} onChange={(e) => setEditing({ ...editing, placement: e.target.value })}>
                    <option value="hero">Hero</option>
                    <option value="promo">Promo</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-eyebrow opacity-60 block mb-2">Order</span>
                  <input type="number" className={inputCls} value={editing.order} onChange={(e) => setEditing({ ...editing, order: e.target.value })} />
                </label>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
                <span className="text-sm">Active (shown on storefront)</span>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button onClick={() => setEditing(null)} className="px-5 py-3 text-eyebrow hover:bg-secondary">Cancel</button>
                <button data-testid="save-banner-btn" disabled={saving} onClick={save} className="px-5 py-3 bg-foreground text-background text-eyebrow disabled:opacity-50">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-md bg-background rounded-none border-border">
          <DialogHeader><DialogTitle className="font-serif text-2xl font-light">Delete banner?</DialogTitle></DialogHeader>
          <p className="opacity-70 text-sm">"{confirmDelete?.title}" will be removed.</p>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setConfirmDelete(null)} className="px-5 py-3 text-eyebrow hover:bg-secondary">Cancel</button>
            <button onClick={() => remove(confirmDelete.id)} className="px-5 py-3 bg-destructive text-destructive-foreground text-eyebrow">Delete</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const inputCls = "w-full bg-transparent border border-border px-3 py-2.5 text-sm outline-none focus:border-foreground";
