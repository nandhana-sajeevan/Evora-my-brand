import { useEffect, useState } from "react";
import api from "../../lib/api";
import ImageUploader, { resolveUrl } from "../../components/admin/ImageUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const EMPTY = {
  name: "", slug: "", price: 0, original_price: null,
  category: "", description: "", images: [], sizes: [], colors: [],
  rating: 0, reviews_count: 0, in_stock: true, is_new: false, is_trending: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);   // product or EMPTY
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      api.get("/products"),
      api.get("/categories"),
    ]);
    setProducts(p);
    setCategories(c);
  };
  useEffect(() => { load(); }, []);

  const filtered = products.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    if (!editing.name || !editing.category || !editing.price) {
      toast.error("Name, category and price are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editing,
        price: parseFloat(editing.price),
        original_price: editing.original_price ? parseFloat(editing.original_price) : null,
        rating: parseFloat(editing.rating) || 0,
        reviews_count: parseInt(editing.reviews_count) || 0,
      };
      if (editing.id) {
        await api.put(`/admin/products/${editing.id}`, payload);
        toast("Product updated");
      } else {
        await api.post("/admin/products", payload);
        toast("Product created");
      }
      await load();
      setEditing(null);
    } catch (e) {
      toast.error("Save failed", { description: e.response?.data?.detail || e.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      toast("Product deleted");
      await load();
      setConfirmDelete(null);
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const setField = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

  return (
    <div data-testid="admin-products">
      <header className="flex items-end justify-between mb-8">
        <div>
          <p className="text-eyebrow opacity-60">Catalogue</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light mt-2">Products</h1>
        </div>
        <button
          data-testid="new-product-btn"
          onClick={() => setEditing({ ...EMPTY })}
          className="bg-foreground text-background px-6 py-3 text-eyebrow flex items-center gap-2 hover:bg-foreground/90"
        >
          <Plus size={14} strokeWidth={1.5} /> New Product
        </button>
      </header>

      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <Search size={16} strokeWidth={1.5} className="opacity-60" />
        <input
          data-testid="products-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <span className="text-xs opacity-60">{filtered.length} of {products.length}</span>
      </div>

      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-eyebrow text-left">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border" data-testid={`product-row-${p.id}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 bg-secondary overflow-hidden">
                      {p.images?.[0] && <img src={resolveUrl(p.images[0])} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs opacity-60">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 opacity-80">{p.category}</td>
                <td className="px-4 py-3 font-medium">${p.price?.toFixed(2)}</td>
                <td className="px-4 py-3 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {p.is_new && <span className="bg-accent px-2 py-0.5">New</span>}
                    {p.is_trending && <span className="bg-foreground text-background px-2 py-0.5">Trending</span>}
                    {!p.in_stock && <span className="bg-destructive text-destructive-foreground px-2 py-0.5">Out</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button
                      data-testid={`edit-product-${p.id}`}
                      onClick={() => setEditing({ ...p })}
                      className="p-2 hover:bg-secondary"
                      aria-label="Edit"
                    >
                      <Edit2 size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      data-testid={`delete-product-${p.id}`}
                      onClick={() => setConfirmDelete(p)}
                      className="p-2 hover:bg-destructive/10 text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 opacity-60 text-sm">No products.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Editor dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background rounded-none border-border" data-testid="product-editor">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl font-light">
              {editing?.id ? "Edit Product" : "New Product"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-5 mt-2">
              <div>
                <label className="text-eyebrow opacity-60 block mb-2">Images</label>
                <ImageUploader
                  testId="product-images"
                  multiple
                  value={editing.images}
                  onChange={(v) => setField("images", v)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Name" required>
                  <input data-testid="product-name" className={inputCls} value={editing.name} onChange={(e) => setField("name", e.target.value)} />
                </Field>
                <Field label="Slug">
                  <input className={inputCls} value={editing.slug || ""} onChange={(e) => setField("slug", e.target.value)} placeholder="auto" />
                </Field>
                <Field label="Category" required>
                  <select data-testid="product-category" className={inputCls} value={editing.category} onChange={(e) => setField("category", e.target.value)}>
                    <option value="">Select...</option>
                    {categories.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Price" required>
                  <input data-testid="product-price" type="number" step="0.01" className={inputCls} value={editing.price} onChange={(e) => setField("price", e.target.value)} />
                </Field>
                <Field label="Original price (optional)">
                  <input type="number" step="0.01" className={inputCls} value={editing.original_price || ""} onChange={(e) => setField("original_price", e.target.value || null)} />
                </Field>
                <Field label="Rating (0–5)">
                  <input type="number" step="0.1" min="0" max="5" className={inputCls} value={editing.rating} onChange={(e) => setField("rating", e.target.value)} />
                </Field>
                <Field label="Reviews count">
                  <input type="number" className={inputCls} value={editing.reviews_count} onChange={(e) => setField("reviews_count", e.target.value)} />
                </Field>
              </div>

              <Field label="Description">
                <textarea rows={3} className={`${inputCls} resize-none`} value={editing.description} onChange={(e) => setField("description", e.target.value)} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Sizes (comma separated)">
                  <input className={inputCls} value={(editing.sizes || []).join(", ")} onChange={(e) => setField("sizes", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
                </Field>
                <Field label="Colors (comma separated)">
                  <input className={inputCls} value={(editing.colors || []).join(", ")} onChange={(e) => setField("colors", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
                </Field>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <Toggle label="In stock" value={editing.in_stock} onChange={(v) => setField("in_stock", v)} />
                <Toggle label="New" value={editing.is_new} onChange={(v) => setField("is_new", v)} testId="toggle-new" />
                <Toggle label="Trending" value={editing.is_trending} onChange={(v) => setField("is_trending", v)} testId="toggle-trending" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button onClick={() => setEditing(null)} className="px-6 py-3 text-eyebrow hover:bg-secondary">Cancel</button>
                <button
                  data-testid="save-product-btn"
                  disabled={saving}
                  onClick={save}
                  className="px-6 py-3 bg-foreground text-background text-eyebrow disabled:opacity-50"
                >
                  {saving ? "Saving..." : (editing.id ? "Save Changes" : "Create Product")}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-md bg-background rounded-none border-border">
          <DialogHeader><DialogTitle className="font-serif text-2xl font-light">Delete product?</DialogTitle></DialogHeader>
          <p className="opacity-70 text-sm">
            "{confirmDelete?.name}" will be permanently removed. This cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setConfirmDelete(null)} className="px-5 py-3 text-eyebrow hover:bg-secondary">Cancel</button>
            <button
              data-testid="confirm-delete-product"
              onClick={() => remove(confirmDelete.id)}
              className="px-5 py-3 bg-destructive text-destructive-foreground text-eyebrow"
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const inputCls = "w-full bg-transparent border border-border px-3 py-2.5 text-sm outline-none focus:border-foreground";

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-eyebrow opacity-60 block mb-2">{label}{required && <span className="text-destructive ml-1">*</span>}</span>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange, testId }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none" data-testid={testId}>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <span className="w-9 h-5 bg-border rounded-full relative peer-checked:bg-foreground transition-colors">
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full transition-transform ${value ? "translate-x-4" : ""}`} />
      </span>
      <span className="text-sm">{label}</span>
    </label>
  );
}
