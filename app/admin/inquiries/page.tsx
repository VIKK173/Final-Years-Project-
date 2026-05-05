"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Mail,
  Phone,
  Tag,
  Search,
  Filter,
  ChevronDown,
  Send,
  Shield,
  LayoutDashboard,
  Briefcase,
  Wrench,
  Wallet,
  Settings,
  Home,
} from "lucide-react";

interface Inquiry {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  enquiryType: string;
  subject: string;
  message: string;
  isUrgent: boolean;
  status: "open" | "in_review" | "resolved" | "closed";
  adminReply: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  open: { label: "Open", color: "bg-amber-100 text-amber-700", icon: Clock },
  in_review: { label: "In Review", color: "bg-blue-100 text-blue-700", icon: Search },
  resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-slate-100 text-slate-600", icon: XCircle },
};

const TYPE_COLORS: Record<string, string> = {
  booking: "bg-brand-100 text-brand-700",
  payment: "bg-rose-100 text-rose-700",
  service: "bg-violet-100 text-violet-700",
  technical: "bg-orange-100 text-orange-700",
  partnership: "bg-teal-100 text-teal-700",
  other: "bg-slate-100 text-slate-600",
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchInquiries = async () => {
    try {
      const res = await fetch("/api/inquiries?limit=100", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setInquiries(data.data);
    } catch (e) {
      console.error("Failed to fetch inquiries", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateStatus = async (id: string, status: string, adminReply?: string) => {
    setUpdating(true);
    try {
      await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, adminReply }),
      });
      await fetchInquiries();
      setSelectedId(null);
      setReplyText("");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = inquiries.filter((q) => {
    const matchFilter = filter === "all" || q.status === filter;
    const matchSearch =
      !search ||
      q.fullName.toLowerCase().includes(search.toLowerCase()) ||
      q.email.toLowerCase().includes(search.toLowerCase()) ||
      q.subject.toLowerCase().includes(search.toLowerCase()) ||
      q.message.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const selected = inquiries.find((q) => q._id === selectedId);
  const counts = {
    all: inquiries.length,
    open: inquiries.filter((q) => q.status === "open").length,
    in_review: inquiries.filter((q) => q.status === "in_review").length,
    resolved: inquiries.filter((q) => q.status === "resolved").length,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1700px]">
        {/* Sidebar */}
        <aside className="hidden w-72 border-r border-slate-200 bg-white px-6 py-8 lg:flex lg:flex-col shadow-lg">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 p-3 text-white shadow-lg shadow-green-500/30">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black leading-none text-slate-900">ServiceHub</p>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Admin Panel</p>
            </div>
          </div>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700">
              <LayoutDashboard className="h-5 w-5" /> Dashboard
            </Link>
            <Link href="/admin/bookings" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700">
              <Briefcase className="h-5 w-5" /> Bookings
            </Link>
            <Link href="/admin/workers" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700">
              <Wrench className="h-5 w-5" /> Workers
            </Link>
            <Link href="/admin/finance" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700">
              <Wallet className="h-5 w-5" /> Finance
            </Link>
            <div className="flex w-full items-center gap-3 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30">
              <MessageSquare className="h-5 w-5" /> Inquiries
            </div>
            <Link href="/admin/settings" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700">
              <Settings className="h-5 w-5" /> Settings
            </Link>
          </nav>
          <div className="mt-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white shadow-xl">
            <p className="text-xl font-bold">Inquiries</p>
            <p className="mt-1 text-sm text-white/80">Manage customer support requests and enquiries.</p>
            <div className="mt-4">
              <Link href="/admin/dashboard" className="block w-full rounded-xl bg-white/20 py-2.5 text-center text-sm font-bold hover:bg-white/30 transition">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1 p-5 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text font-display text-4xl font-black text-transparent">
                Customer Inquiries
              </h1>
              <p className="mt-1 text-base text-slate-500">Manage and respond to help center requests</p>
            </div>
            <Link href="/" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-violet-400 hover:text-violet-600 flex items-center gap-2">
              <Home className="h-4 w-4" /> Home
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total", value: counts.all, color: "from-slate-500 to-slate-600" },
              { label: "Open", value: counts.open, color: "from-amber-500 to-orange-500" },
              { label: "In Review", value: counts.in_review, color: "from-blue-500 to-cyan-500" },
              { label: "Resolved", value: counts.resolved, color: "from-emerald-500 to-teal-500" },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.color} p-5 text-white shadow-lg`}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">{s.label}</p>
                <p className="mt-2 text-3xl font-black">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters + Search */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {["all", "open", "in_review", "resolved", "closed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filter === f ? "bg-violet-600 text-white shadow" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {f === "in_review" ? "In Review" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
                placeholder="Search by name, email, subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Inquiries List + Detail Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* List */}
            <div className="xl:col-span-2 space-y-3">
              {loading ? (
                <div className="text-center py-20 text-slate-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 animate-pulse" />
                  <p>Loading inquiries...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-bold text-slate-600">No inquiries found</p>
                  <p className="text-sm text-slate-400 mt-1">Customers will appear here when they submit help requests</p>
                </div>
              ) : (
                filtered.map((q) => {
                  const statusCfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.open;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <div
                      key={q._id}
                      onClick={() => setSelectedId(selectedId === q._id ? null : q._id)}
                      className={`bg-white rounded-2xl border p-5 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        selectedId === q._id ? "border-violet-400 shadow-violet-100" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-slate-900">{q.fullName}</p>
                            {q.isUrgent && (
                              <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> URGENT
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[q.enquiryType] || TYPE_COLORS.other}`}>
                              {q.enquiryType}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 truncate">{q.subject || q.message.slice(0, 50)}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{q.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Mail className="h-3 w-3" /> {q.email}
                            </span>
                            {q.phone && (
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Phone className="h-3 w-3" /> {q.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${statusCfg.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusCfg.label}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(q.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Detail / Reply Panel */}
            <div className="xl:col-span-1">
              {selected ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-5 space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-black text-slate-900">Inquiry Detail</h2>
                      <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2"><span className="font-bold text-slate-500 w-20">Name:</span><span className="text-slate-800">{selected.fullName}</span></div>
                      <div className="flex gap-2"><span className="font-bold text-slate-500 w-20">Email:</span><span className="text-slate-800 break-all">{selected.email}</span></div>
                      {selected.phone && <div className="flex gap-2"><span className="font-bold text-slate-500 w-20">Phone:</span><span className="text-slate-800">{selected.phone}</span></div>}
                      <div className="flex gap-2"><span className="font-bold text-slate-500 w-20">Type:</span><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${TYPE_COLORS[selected.enquiryType] || TYPE_COLORS.other}`}>{selected.enquiryType}</span></div>
                      {selected.subject && <div className="flex gap-2"><span className="font-bold text-slate-500 w-20">Subject:</span><span className="text-slate-800">{selected.subject}</span></div>}
                      {selected.isUrgent && <div className="bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Marked as URGENT</div>}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 mb-2">MESSAGE</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{selected.message}</p>
                  </div>

                  {selected.adminReply && (
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <p className="text-xs font-bold text-emerald-700 mb-2">YOUR REPLY</p>
                      <p className="text-sm text-emerald-800">{selected.adminReply}</p>
                    </div>
                  )}

                  {/* Reply */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">REPLY TO CUSTOMER</p>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-400 resize-none h-24"
                    />
                  </div>

                  {/* Status Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateStatus(selected._id, "in_review", replyText || undefined)}
                      disabled={updating}
                      className="text-xs font-bold py-2.5 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition disabled:opacity-50"
                    >
                      Mark In Review
                    </button>
                    <button
                      onClick={() => updateStatus(selected._id, "resolved", replyText || undefined)}
                      disabled={updating}
                      className="text-xs font-bold py-2.5 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => updateStatus(selected._id, "closed", replyText || undefined)}
                      disabled={updating}
                      className="text-xs font-bold py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
                    >
                      Close
                    </button>
                    {replyText && (
                      <button
                        onClick={() => updateStatus(selected._id, selected.status, replyText)}
                        disabled={updating}
                        className="text-xs font-bold py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" /> Send Reply
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center sticky top-5">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-bold text-slate-600">Select an inquiry</p>
                  <p className="text-sm text-slate-400 mt-1">Click any inquiry to view details and reply</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
