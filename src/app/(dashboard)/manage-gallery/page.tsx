"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Camera, Plus, Trash2, Eye, EyeOff, X, Upload } from "lucide-react";

interface Photo {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export default function ManageGalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          await fetch("/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: url }),
          });
        }
      }
      fetchPhotos();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    fetchPhotos();
  };

  const togglePublish = async (photo: Photo) => {
    await fetch(`/api/gallery/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !photo.isPublished }),
    });
    fetchPhotos();
  };

  const updateCaption = async (photo: Photo, caption: string) => {
    await fetch(`/api/gallery/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption }),
    });
    fetchPhotos();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">Manage photos displayed on the public gallery page</p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Upload Photos
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-500">No gallery photos yet</h3>
          <p className="text-sm text-gray-400 mt-1">Upload photos to display on the public gallery</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Upload First Photos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
              <div className="relative aspect-square">
                <img src={photo.imageUrl} alt={photo.caption || "Gallery photo"} className="w-full h-full object-cover" />
                {!photo.isPublished && (
                  <div className="absolute top-2 left-2 bg-gray-900/70 text-white text-xs px-2 py-0.5 rounded">Hidden</div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => togglePublish(photo)}
                    className="p-1.5 bg-white rounded-lg shadow text-gray-600 hover:text-blue-600"
                    title={photo.isPublished ? "Hide" : "Show"}
                  >
                    {photo.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-1.5 bg-white rounded-lg shadow text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <input
                  type="text"
                  defaultValue={photo.caption || ""}
                  placeholder="Add caption..."
                  onBlur={(e) => {
                    if (e.target.value !== (photo.caption || "")) {
                      updateCaption(photo, e.target.value);
                    }
                  }}
                  className="w-full text-xs text-gray-600 bg-transparent border-0 outline-none placeholder:text-gray-300 focus:ring-0 p-0"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
