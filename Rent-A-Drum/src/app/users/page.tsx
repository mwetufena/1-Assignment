// ============================================================================
// Users Page - Create and Manage Users (simulates create_users RPC)
// ============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [streamMode, setStreamMode] = useState(false);
  const [streamUsers, setStreamUsers] = useState([{ name: "", email: "", role: "HOST", phone: "", address: "" }]);
  const [singleUser, setSingleUser] = useState({ name: "", email: "", role: "HOST", phone: "", address: "" });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const url = roleFilter ? `/api/users?role=${roleFilter}` : "/api/users";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch {
      setMessage({ type: "error", text: "Failed to fetch users" });
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: singleUser }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `User created: ${data.data.name} (${data.data.role})` });
        setSingleUser({ name: "", email: "", role: "HOST", phone: "", address: "" });
        setShowForm(false);
        fetchUsers();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to create user" });
    }
  };

  const handleCreateStreamed = async (e: React.FormEvent) => {
    e.preventDefault();
    const validUsers = streamUsers.filter((u) => u.name && u.email);
    if (validUsers.length === 0) return;
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: validUsers }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setStreamUsers([{ name: "", email: "", role: "HOST", phone: "", address: "" }]);
        setShowForm(false);
        fetchUsers();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to create users" });
    }
  };

  const addStreamUser = () => {
    setStreamUsers([...streamUsers, { name: "", email: "", role: "GUEST", phone: "", address: "" }]);
  };

  const removeStreamUser = (index: number) => {
    setStreamUsers(streamUsers.filter((_, i) => i !== index));
  };

  const updateStreamUser = (index: number, field: string, value: string) => {
    const updated = [...streamUsers];
    updated[index] = { ...updated[index], [field]: value };
    setStreamUsers(updated);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-slate-500">Create and manage Host & Guest accounts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowForm(true); setStreamMode(false); }}
            className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            + Single User
          </button>
          <button
            onClick={() => { setShowForm(true); setStreamMode(true); }}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            ⚡ Stream Users (gRPC)
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 rounded-lg p-4 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-4 font-bold">×</button>
        </div>
      )}

      {/* Create User Form */}
      {showForm && !streamMode && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Create User (Simple RPC)</h2>
          <form onSubmit={handleCreateSingle} className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name *</label>
              <input required value={singleUser.name} onChange={(e) => setSingleUser({ ...singleUser, name: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email *</label>
              <input required type="email" value={singleUser.email} onChange={(e) => setSingleUser({ ...singleUser, email: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Role *</label>
              <select value={singleUser.role} onChange={(e) => setSingleUser({ ...singleUser, role: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="HOST">Host</option>
                <option value="GUEST">Guest</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input value={singleUser.phone} onChange={(e) => setSingleUser({ ...singleUser, phone: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700">Address</label>
              <input value={singleUser.address} onChange={(e) => setSingleUser({ ...singleUser, address: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Create User</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Stream Users Form (Client-side Streaming) */}
      {showForm && streamMode && (
        <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-900">⚡ Create Users — Client-side Streaming RPC</h2>
          <p className="mt-1 text-sm text-blue-700">Stream multiple user profiles from client to server. Server sends single confirmation after all users are registered.</p>
          <form onSubmit={handleCreateStreamed} className="mt-4 space-y-4">
            {streamUsers.map((user, index) => (
              <div key={index} className="rounded-lg border border-blue-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">User #{index + 1}</span>
                  {streamUsers.length > 1 && (
                    <button type="button" onClick={() => removeStreamUser(index)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input required placeholder="Name" value={user.name} onChange={(e) => updateStreamUser(index, "name", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  <input required type="email" placeholder="Email" value={user.email} onChange={(e) => updateStreamUser(index, "email", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  <select value={user.role} onChange={(e) => updateStreamUser(index, "role", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option value="HOST">Host</option>
                    <option value="GUEST">Guest</option>
                  </select>
                  <input placeholder="Phone" value={user.phone} onChange={(e) => updateStreamUser(index, "phone", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  <input placeholder="Address" value={user.address} onChange={(e) => updateStreamUser(index, "address", e.target.value)} className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button type="button" onClick={addStreamUser} className="rounded-lg border border-blue-300 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100">+ Add Another User</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">⚡ Stream & Create All</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex gap-3">
        <button onClick={() => setRoleFilter("")} className={`rounded-lg px-4 py-2 text-sm font-medium ${roleFilter === "" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>All ({users.length})</button>
        <button onClick={() => setRoleFilter("HOST")} className={`rounded-lg px-4 py-2 text-sm font-medium ${roleFilter === "HOST" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>Hosts</button>
        <button onClick={() => setRoleFilter("GUEST")} className={`rounded-lg px-4 py-2 text-sm font-medium ${roleFilter === "GUEST" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>Guests</button>
      </div>

      {/* Users Table */}
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="text-4xl">👥</span>
          <p className="mt-3 text-slate-500">No users yet. Create your first user above!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Name</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Email</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Role</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Phone</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm font-medium text-slate-800">{user.name}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.role === "HOST" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{user.phone || "—"}</td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-400">{user.id.slice(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
