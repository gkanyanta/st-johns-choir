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
import { Music, Plus, Trash2, ExternalLink, Play } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string | null;
  category: string | null;
  youtubeUrl: string | null;
  description: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function SongsManagePage() {
  const { data, loading, refetch } = useApi<{ songs: Song[] }>("/api/songs");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", artist: "", category: "", youtubeUrl: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleAdd = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          artist: form.artist || undefined,
          category: form.category || undefined,
          youtubeUrl: form.youtubeUrl || undefined,
          description: form.description || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add song");
      setDialogOpen(false);
      setForm({ title: "", artist: "", category: "", youtubeUrl: "", description: "" });
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this song?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/songs/${id}`, { method: "DELETE" });
      refetch();
    } catch {
      alert("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const togglePublish = async (song: Song) => {
    try {
      await fetch(`/api/songs/${song.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !song.isPublished }),
      });
      refetch();
    } catch {
      alert("Failed to update");
    }
  };

  if (loading) return <PageLoading />;

  const songs = data?.songs || [];

  return (
    <div className="space-y-4">
      <PageHeader title="Songs & Media" description="Manage songs and YouTube video links">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Song
        </Button>
      </PageHeader>

      {songs.length === 0 ? (
        <EmptyState
          icon={Music}
          title="No songs"
          description="Add songs with optional YouTube video links"
        />
      ) : (
        <div className="space-y-3">
          {songs.map((song) => {
            const videoId = song.youtubeUrl ? getYouTubeId(song.youtubeUrl) : null;
            return (
              <Card key={song.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {videoId ? (
                        <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg bg-purple-50 p-2.5 flex-shrink-0">
                          <Music className="h-5 w-5 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold">{song.title}</h3>
                          <Badge variant={song.isPublished ? "default" : "secondary"}>
                            {song.isPublished ? "Published" : "Draft"}
                          </Badge>
                          {song.category && <Badge variant="secondary">{song.category}</Badge>}
                        </div>
                        {song.artist && <p className="text-sm text-gray-500 mt-0.5">{song.artist}</p>}
                        {song.description && <p className="text-xs text-gray-400 mt-0.5">{song.description}</p>}
                        {song.youtubeUrl && (
                          <a
                            href={song.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-red-600 hover:text-red-700 mt-1 inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Play className="h-3 w-3" /> Watch on YouTube <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => togglePublish(song)}>
                        {song.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(song.id)}
                        disabled={deleting === song.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Song</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Song title" />
            </div>
            <div>
              <Label>Artist / Composer</Label>
              <Input value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} placeholder="e.g. Traditional, John Smith" />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Hymn, Gospel, Anthem, Worship" />
            </div>
            <div>
              <Label>YouTube URL</Label>
              <Input value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
              <p className="text-xs text-gray-400 mt-1">Paste a YouTube video link to embed the video on the public page</p>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !form.title}>
              {saving ? <Spinner className="mr-2" /> : null}
              Add Song
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
