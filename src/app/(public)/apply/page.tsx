"use client";

import { useState, useEffect } from "react";
import { UserPlus, CheckCircle, Music } from "lucide-react";

interface Section {
  id: string;
  name: string;
}

export default function ApplyPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", gender: "",
    dateOfBirth: "", residentialAddress: "", preferredSection: "",
    musicalExperience: "", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/public/sections")
      .then((r) => r.json())
      .then((d) => setSections(d.sections || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/public/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to submit" }));
        throw new Error(data.error || "Failed to submit application");
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
          <UserPlus className="h-10 w-10 mx-auto mb-4 text-amber-400" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Join Our Choir</h1>
        </div>
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <CheckCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-400">Thank you for your interest in joining Angels Church Choir. Our team will review your application and get back to you soon.</p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none transition-all bg-white";

  return (
    <div>
      <div className="bg-slate-900 py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute bottom-5 left-10 w-60 h-60 rounded-full border border-white" />
        </div>
        <div className="relative">
          <div className="rounded-full bg-amber-500/10 border border-amber-400/20 p-3 w-14 h-14 mx-auto mb-5 flex items-center justify-center">
            <UserPlus className="h-7 w-7 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Join Our Choir</h1>
          <div className="w-12 h-0.5 bg-amber-400 mx-auto my-4" />
          <p className="text-slate-400 mt-2 max-w-xl mx-auto">
            Fill out the form below to apply for membership
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="rounded-lg bg-amber-50 p-2">
              <Music className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Membership Application</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">First Name *</label>
                <input type="text" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Last Name *</label>
                <input type="text" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Email *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone *</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputClass}>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Date of Birth</label>
                <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Residential Address</label>
              <input type="text" value={form.residentialAddress} onChange={(e) => setForm({ ...form, residentialAddress: e.target.value })} className={inputClass} placeholder="Your address" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Preferred Voice Section</label>
              <select value={form.preferredSection} onChange={(e) => setForm({ ...form, preferredSection: e.target.value })} className={inputClass}>
                <option value="">Select a section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Musical Experience</label>
              <textarea rows={3} value={form.musicalExperience} onChange={(e) => setForm({ ...form, musicalExperience: e.target.value })} className={`${inputClass} resize-none`} placeholder="Describe any musical experience you have..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Additional Message</label>
              <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none`} placeholder="Anything else you would like us to know?" />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
