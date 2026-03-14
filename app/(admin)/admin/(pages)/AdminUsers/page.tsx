"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Users as UsersIcon, Eye, Trash2 } from "lucide-react";
import { supabase } from "@/utils/supabase/supabase_client";
import { useToast } from "@/app/context/ToastContext";

interface AppUser {
  id: string;
  name: string | null;
  email: string;
  address: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<AppUser | null>(null);
  const { showToast: toast } = useToast();

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast("Error", "error", error.message);
    } else {
      setUsers(data || []);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("users").delete().eq("id", deleteId);
    if (error) toast("Error", "error", error.message);
    else toast("User deleted", "success");
    setDeleteId(null);
    fetchUsers();
  };

  const filtered = users.filter(
    (u) =>
      (u.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">{users.length} registered users</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full pl-9"
        />
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <UsersIcon className="h-8 w-8 mx-auto mb-2" />
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td className="font-medium text-foreground">
                        {u.name || "—"}
                      </td>
                      <td className="text-foreground">{u.email}</td>
                      <td className="text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="text-right space-x-1">
                        <button
                          className="btn btn-ghost rounded-full"
                          onClick={() => setViewUser(u)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="btn btn-ghost rounded-full text-error hover:text-error-foreground"
                          onClick={() => setDeleteId(u.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View User */}
      {viewUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">User Details</h3>
            <div className="space-y-3 py-4">
              <div>
                <span className="text-sm text-muted-foreground">ID:</span>
                <p className="text-foreground font-mono text-sm">
                  {viewUser.id}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <p className="text-foreground">{viewUser.name || "—"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="text-foreground">{viewUser.email}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Address:</span>
                <p className="text-foreground">{viewUser.address || "—"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Joined:</span>
                <p className="text-foreground">
                  {new Date(viewUser.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setViewUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete User</h3>
            <p className="py-4">
              This will permanently remove this user's data. This action cannot
              be undone.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
