"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Users, Plus, Pencil, Trash2, Eye, EyeOff, X, Upload, Image as ImageIcon } from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
}

interface Leader {
  id: string;
  memberId: string | null;
  name: string;
  position: string;
  bio: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  member: Member | null;
}

const emptyForm = { memberId: "", name: "", position: "", bio: "", imageUrl: "", sortOrder: 0, isPublished: true };

export default function ManageLeadersPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Leader | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchLeaders = useCallback(() => {
    fetch("/api/leaders")
      .then((r) => r.json())
      .then((d) => setLeaders(d.leaders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchMembers = useCallback(() => {
    fetch("/api/members?status=ACTIVE&limit=500")
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchLeaders(); fetchMembers(); }, [fetchLeaders, fetchMembers]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (leader: Leader) => {
    setEditing(leader);
    setForm({
      memberId: leader.memberId || "",
      name: leader.name,
      position: leader.position,
      bio: leader.bio || "",
      imageUrl: leader.imageUrl || "",
      sortOrder: leader.sortOrder,
      isPublished: leader.isPublished,
    });
    setShowModal(true);
  };

  const handleMemberSelect = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    setForm({
      ...form,
      memberId,
      name: member ? `${member.firstName} ${member.lastName}` : form.name,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
      }
    } catch {
      // ignore
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.position.trim() || (!form.memberId && !form.name.trim())) return;
    setSaving(true);
    try {
      const url = editing ? `/api/leaders/${editing.id}` : "/api/leaders";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        fetchLeaders();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this leader?")) return;
    await fetch(`/api/leaders/${id}`, { method: "DELETE" });
    fetchLeaders();
  };

  const togglePublish = async (leader: Leader) => {
    await fetch(`/api/leaders/${leader.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !leader.isPublished }),
    });
    fetchLeaders();
  };

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leadership</h1>
          <p className="text-sm text-gray-500 mt-1">Manage choir leadership displayed on the About Us page</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Leader
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-500">No leaders added yet</h3>
          <p className="text-sm text-gray-400 mt-1">Add choir leadership positions from your members</p>
          <button onClick={openCreate} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            Add First Leader
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Leader</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Position</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader) => (
                <tr key={leader.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {leader.imageUrl ? (
                        <img src={leader.imageUrl} alt={leader.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <span className="font-medium text-sm text-gray-900">{leader.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{leader.position}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 hidden sm:table-cell">{leader.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${leader.isPublished ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {leader.isPublished ? "Published" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => togglePublish(leader)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title={leader.isPublished ? "Hide" : "Show"}>
                        {leader.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => openEdit(leader)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(leader.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? "Edit Leader" : "Add Leader"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Member *</label>
                <select
                  value={form.memberId}
                  onChange={(e) => handleMemberSelect(e.target.value)}
                  className={inputClass}
                >
                  <option value="">-- Choose a member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                  placeholder="Auto-filled from member"
                />
                <p className="text-xs text-gray-400 mt-1">Auto-filled when you select a member. Edit if needed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Choir Director, Secretary, Soprano Leader"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <div className="flex items-start gap-4">
                  {form.imageUrl ? (
                    <div className="relative">
                      <img src={form.imageUrl} alt="Preview" className="h-24 w-24 rounded-lg object-cover border border-gray-200" />
                      <button
                        onClick={() => setForm({ ...form, imageUrl: "" })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? "Uploading..." : "Browse Photo"}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className={`${inputClass} resize-none`}
                  placeholder="Brief description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Published</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.position.trim() || (!form.memberId && !form.name.trim())}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : editing ? "Update" : "Add Leader"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
