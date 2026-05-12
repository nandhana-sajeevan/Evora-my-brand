import { useEffect, useState } from "react";
import api from "../../lib/api";
import ImageUploader, { resolveUrl } from "../../components/admin/ImageUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const EMPTY = { name: "", slug: "", image: "", order: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => api.get("/categories").then(({ data }) => setCategories(data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name) return toast.error("Name required");
    setSaving(true);
    try {
      const payload = { ...editing, order: parseInt(editing.order) || 0 };
      if (editing.id) await api.put(`/admin/categories/${editing.id}`, payload);
      else await api.post("/admin/categories", payload);
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
      await api.delete(`/admin/categories/${id}`);
      toast("Deleted");
      await load();
      setConfirmDelete(null);
    } catch (e) {
      toast.error("Delete failed", { description: e.response?.data?.detail });
    }
  };

  return (
    <div data-testid="admin-categories">
      <header className="flex items-end justify-between mb-8">
        <div>
          <p className="text-eyebrow opacity-60">Catalogue</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light mt-2">Categories</h1>
        </div>
        <button
          data-testid="new-category-btn"
          onClick={() => setEditing({ ...EMPTY })}
          className="bg-foreground text-background px-6 py-3 text-eyebrow flex items-center gap-2 hover:bg-foreground/90"
        >
          <Plus size={14} strokeWidth={1.5} /> New Category
        </button>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c.id || c.slug} data-testid={`category-card-${c.slug}`} className="border border-border group">
            <div className="aspect-[3/4] bg-secondary overflow-hidden">
              {c.image && <img src={resolveUrl(c.image)} alt={c.name} className="w-full h-full object-cover" />}
            </div>
            <div className="p-4 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{c.name}</div>
                <div className="text-xs opacity-60 truncate">{c.slug}</div>
              </div>
              <div className="flex gap-1">
                <button data-testid={`edit-category-${c.slug}`} onClick={() => setEditing({ ...c })} className="p-2 hover:bg-secondary" aria-label="Edit">
                  <Edit2 size={14} strokeWidth={1.5} />
                </button>
                <button data-testid={`delete-category-${c.slug}`} onClick={() => setConfirmDelete(c)} className="p-2 hover:bg-destructive/10 text-destructive" aria-label="Delete">
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg bg-background rounded-none border-border" data-testid="category-editor">
          <DialogHeader><DialogTitle className="font-serif text-3xl font-light">{editing?.id ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 mt-2">
              <label className="block">
                <span className="text-eyebrow opacity-60 block mb-2">Image</span>
                <ImageUploader
                  testId="category-image"
                  value={editing.image}
                  onChange={(v) => setEditing({ ...editing, image: v })}
                />
              </label>
              <label className="block">
                <span className="text-eyebrow opacity-60 block mb-2">Name</span>
                <input data-testid="category-name" className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </label>
              <label className="block">
                <span className="text-eyebrow opacity-60 block mb-2">Slug (auto if blank)</span>
                <input className={inputCls} value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </label>
              <label className="block">
                <span className="text-eyebrow opacity-60 block mb-2">Display order</span>
                <input type="number" className={inputCls} value={editing.order} onChange={(e) => setEditing({ ...editing, order: e.target.value })} />
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button onClick={() => setEditing(null)} className="px-5 py-3 text-eyebrow hover:bg-secondary">Cancel</button>
                <button
                  data-testid="save-category-btn"
                  disabled={saving}
                  onClick={save}
                  className="px-5 py-3 bg-foreground text-background text-eyebrow disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-md bg-background rounded-none border-border">
          <DialogHeader><DialogTitle className="font-serif text-2xl font-light">Delete category?</DialogTitle></DialogHeader>
          <p className="opacity-70 text-sm">"{confirmDelete?.name}" will be removed. Categories in use by products cannot be deleted.</p>
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
