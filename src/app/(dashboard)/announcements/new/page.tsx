"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/shared/loading";

export default function NewAnnouncementPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    content: "",
    audience: "ALL",
    isUrgent: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to create announcement" }));
        throw new Error(data.error || "Failed to create announcement");
      }

      router.push("/announcements");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="New Announcement" backHref="/announcements" />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Announcement title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                required
                placeholder="Write your announcement here..."
                rows={6}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audience">Audience</Label>
                <Select
                  id="audience"
                  name="audience"
                  value={form.audience}
                  onChange={handleChange}
                >
                  <option value="ALL">All Members</option>
                  <option value="LEADERS">Leaders Only</option>
                  <option value="SOPRANOS">Sopranos</option>
                  <option value="ALTOS">Altos</option>
                  <option value="TENORS">Tenors</option>
                  <option value="BASSES">Basses</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mark as Urgent</Label>
                <div className="flex items-center gap-3 pt-1">
                  <Switch
                    checked={form.isUrgent}
                    onCheckedChange={(checked) => setForm({ ...form, isUrgent: checked })}
                  />
                  <span className="text-sm text-gray-600">
                    {form.isUrgent ? "This is an urgent announcement" : "Normal priority"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? <Spinner className="mr-2" /> : null}
                {submitting ? "Publishing..." : "Publish Announcement"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
