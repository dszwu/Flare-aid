"use client";

import { useEffect, useState } from "react";

interface Org {
  id: number;
  name: string;
  country: string;
  walletAddress: string;
  contactInfo: string;
  allowlisted: boolean;
}

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    country: "",
    walletAddress: "",
    contactInfo: "",
    allowlisted: true,
  });

  const loadOrgs = async () => {
    setLoading(true);
    const res = await fetch("/api/orgs/all");
    const json = await res.json();
    setOrgs(json.data || []);
    setLoading(false);
  };

  useEffect(() => { loadOrgs(); }, []);

  const resetForm = () => {
    setForm({ name: "", country: "", walletAddress: "", contactInfo: "", allowlisted: true });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (org: Org) => {
    setEditId(org.id);
    setForm({
      name: org.name,
      country: org.country,
      walletAddress: org.walletAddress || "",
      contactInfo: org.contactInfo || "",
      allowlisted: !!org.allowlisted,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await fetch(`/api/orgs/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    resetForm();
    loadOrgs();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-flare-500 text-white rounded-lg text-sm font-medium hover:bg-flare-600 transition-colors"
        >
          + Add Organization
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editId ? "Edit Organization" : "Add Organization"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-flare-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <input
                  required
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-flare-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                <input
                  value={form.walletAddress}
                  onChange={(e) => setForm((p) => ({ ...p, walletAddress: e.target.value }))}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-flare-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                <input
                  value={form.contactInfo}
                  onChange={(e) => setForm((p) => ({ ...p, contactInfo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-flare-500 focus:border-transparent"
                />
              </div>
            </div>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={form.allowlisted}
                onChange={(e) => setForm((p) => ({ ...p, allowlisted: e.target.checked }))}
                className="rounded border-gray-300 text-flare-500"
              />
              <span>Allowlisted (visible to donors)</span>
            </label>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-flare-500 text-white rounded-lg text-sm font-medium hover:bg-flare-600">
                {editId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Org table */}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Country</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Wallet</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{org.name}</td>
                  <td className="px-4 py-3 text-gray-600">{org.country}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {org.walletAddress
                      ? `${org.walletAddress.slice(0, 6)}...${org.walletAddress.slice(-4)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        org.allowlisted
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {org.allowlisted ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(org)}
                      className="text-ocean-600 hover:text-ocean-800 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
