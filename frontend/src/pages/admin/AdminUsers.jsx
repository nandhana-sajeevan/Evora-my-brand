import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Trash2, ShieldCheck, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => api.get("/admin/users").then(({ data }) => setUsers(data));
  useEffect(() => { load(); }, []);

  const toggleRole = async (u) => {
    const role = u.role === "admin" ? "user" : "admin";
    try {
      await api.put(`/admin/users/${u.id}`, { role });
      await load();
      toast(`Now ${role}`);
    } catch (e) {
      toast.error("Failed", { description: e.response?.data?.detail });
    }
  };

  const remove = async (u) => {
    try {
      await api.delete(`/admin/users/${u.id}`);
      await load();
      setConfirmDelete(null);
      toast("User deleted");
    } catch (e) {
      toast.error("Failed", { description: e.response?.data?.detail });
    }
  };

  return (
    <div data-testid="admin-users">
      <header className="mb-8">
        <p className="text-eyebrow opacity-60">House</p>
        <h1 className="font-serif text-4xl md:text-5xl font-light mt-2">Users</h1>
        <p className="mt-2 text-sm opacity-70">Promote members to admin or remove access.</p>
      </header>

      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-eyebrow text-left">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border" data-testid={`user-row-${u.id}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                      {u.role === "admin" ? <ShieldCheck size={16} strokeWidth={1.5} /> : <UserIcon size={16} strokeWidth={1.5} />}
                    </div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 opacity-80">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-eyebrow px-2 py-1 ${u.role === "admin" ? "bg-foreground text-background" : "bg-secondary"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 opacity-70 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    {u.id !== me?.id && (
                      <button
                        data-testid={`toggle-role-${u.id}`}
                        onClick={() => toggleRole(u)}
                        className="text-eyebrow px-3 py-2 border border-border hover:bg-secondary"
                      >
                        {u.role === "admin" ? "Demote" : "Promote to admin"}
                      </button>
                    )}
                    {u.id !== me?.id && (
                      <button
                        data-testid={`delete-user-${u.id}`}
                        onClick={() => setConfirmDelete(u)}
                        className="p-2 hover:bg-destructive/10 text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-md bg-background rounded-none border-border">
          <DialogHeader><DialogTitle className="font-serif text-2xl font-light">Delete user?</DialogTitle></DialogHeader>
          <p className="opacity-70 text-sm">"{confirmDelete?.name}" ({confirmDelete?.email}) will be permanently removed.</p>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setConfirmDelete(null)} className="px-5 py-3 text-eyebrow hover:bg-secondary">Cancel</button>
            <button data-testid="confirm-delete-user" onClick={() => remove(confirmDelete)} className="px-5 py-3 bg-destructive text-destructive-foreground text-eyebrow">Delete</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
