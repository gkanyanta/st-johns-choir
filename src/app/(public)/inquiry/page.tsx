"use client";

import { useState } from "react";
import { Send, CheckCircle, Mail, MessageSquare } from "lucide-react";

export default function InquiryPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/public/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to submit" }));
        throw new Error(data.error || "Failed to submit inquiry");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <div className="bg-slate-900 py-20 px-4 text-center">
          <Mail className="h-10 w-10 mx-auto mb-4 text-amber-400" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Contact Us</h1>
        </div>
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <CheckCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Inquiry Sent!</h2>
          <p className="text-slate-400">Thank you for reaching out. We will get back to you as soon as possible.</p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none transition-all bg-white";

  return (
    <div>
      <div className="bg-slate-900 py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-5 right-20 w-40 h-40 rounded-full border border-white" />
        </div>
        <div className="relative">
          <div className="rounded-full bg-amber-500/10 border border-amber-400/20 p-3 w-14 h-14 mx-auto mb-5 flex items-center justify-center">
            <Mail className="h-7 w-7 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Contact Us</h1>
          <div className="w-12 h-0.5 bg-amber-400 mx-auto my-4" />
          <p className="text-slate-400 mt-2 max-w-xl mx-auto">
            Have a question? We would love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="rounded-lg bg-amber-50 p-2">
              <MessageSquare className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Send us a message</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Email *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="your@email.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="0971234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Subject *</label>
                <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} placeholder="What is this about?" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Message *</label>
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none`} placeholder="Your message..." />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Sending..." : "Send Inquiry"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
