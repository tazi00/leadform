"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/submissions");
    const data = await res.json();
    setSubmissions(data.submissions || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this entry?")) return;
    await fetch("/api/admin/submissions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function handleExport() {
    setExporting(true);
    setExportMsg("");
    try {
      const res = await fetch("/api/admin/export", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Export failed");

      setExportMsg(
        data.exportedCount === 0
          ? "Nothing new to export — sheet is already up to date."
          : `Exported ${data.exportedCount} new entr${
              data.exportedCount === 1 ? "y" : "ies"
            } to Google Sheet.`
      );
      load();
    } catch (err) {
      setExportMsg(err.message);
    } finally {
      setExporting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  const pendingCount = submissions.filter((s) => !s.exported).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Registration submissions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {submissions.length} total &middot; {pendingCount} not yet
              exported
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={exporting || pendingCount === 0}
              className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {exporting ? "Exporting..." : `Export to Google Sheet`}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Log out
            </button>
          </div>
        </div>

        {exportMsg && (
          <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 text-sm">
            {exportMsg}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {loading ? (
            <p className="p-6 text-sm text-slate-500">Loading...</p>
          ) : submissions.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              No submissions yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Gender</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Exported</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {[s.firstName, s.middleName, s.lastName]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{s.phone}</td>
                    <td className="px-4 py-3 text-slate-700">{s.gender}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                      {[s.addressLine1, s.addressLine2]
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{s.course}</td>
                    <td className="px-4 py-3">
                      {s.exported ? (
                        <span className="text-green-600 text-xs font-medium">
                          Yes
                        </span>
                      ) : (
                        <span className="text-amber-600 text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
