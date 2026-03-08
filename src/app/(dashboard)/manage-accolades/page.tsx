"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks";
import { PageLoading, Spinner } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Award, Plus, Trash2, Calendar } from "lucide-react";

interface Accolade {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  category: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function AccoladesManagePage() {
  const { data, loading, refetch } = useApi<{ accolades: Accolade[] }>("/api/accolades");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", category: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleAdd = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/accolades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          date: form.date || undefined,
          category: form.category || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add accolade");
      setDialogOpen(false);
      setForm({ title: "", description: "", date: "", category: "" });
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this accolade?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/accolades/${id}`, { method: "DELETE" });
      refetch();
    } catch {
      alert("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const togglePublish = async (accolade: Accolade) => {
    try {
      await fetch(`/api/accolades/${accolade.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !accolade.isPublished }),
      });
      refetch();
    } catch {
      alert("Failed to update");
    }
  };

  if (loading) return <PageLoading />;

  const accolades = data?.accolades || [];

  return (
    <div className="space-y-4">
      <PageHeader title="Accolades" description="Manage choir achievements and awards">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Accolade
        </Button>
      </PageHeader>

      {accolades.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No accolades"
          description="Add achievements, awards, and festival wins"
        />
      ) : (
        <div className="space-y-3">
          {accolades.map((accolade) => (
            <Card key={accolade.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-yellow-50 p-2">
                      <Award className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{accolade.title}</h3>
                        <Badge variant={accolade.isPublished ? "default" : "secondary"}>
                          {accolade.isPublished ? "Published" : "Draft"}
                        </Badge>
                        {accolade.category && (
                          <Badge variant="secondary">{accolade.category}</Badge>
                        )}
                      </div>
                      {accolade.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{accolade.description}</p>
                      )}
                      {accolade.date && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(accolade.date), "MMMM yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => togglePublish(accolade)}>
                      {accolade.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(accolade.id)}
                      disabled={deleting === accolade.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Accolade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. National Choir Festival 2024 - Gold" />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Festival, Award, Competition" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the achievement" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !form.title}>
              {saving ? <Spinner className="mr-2" /> : null}
              Add Accolade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
