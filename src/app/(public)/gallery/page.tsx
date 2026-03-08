"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  id: string;
  imageUrl: string;
  caption: string | null;
}

// Static fallback photos
const staticPhotos = Array.from({ length: 15 }, (_, i) => ({
  id: `static-${i}`,
  imageUrl: `/images/slides/slide-${i + 1}.jpeg`,
  caption: null,
}));

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/public/gallery")
      .then((r) => r.json())
      .then((d) => {
        const dbPhotos = d.photos || [];
        setPhotos(dbPhotos.length > 0 ? dbPhotos : staticPhotos);
      })
      .catch(() => setPhotos(staticPhotos))
      .finally(() => setLoading(false));
  }, []);

  const openPhoto = (index: number) => setLightbox(index);
  const closePhoto = () => setLightbox(null);
  const prevPhoto = () =>
    setLightbox((p) => (p !== null ? (p - 1 + photos.length) % photos.length : null));
  const nextPhoto = () =>
    setLightbox((p) => (p !== null ? (p + 1) % photos.length : null));

  return (
    <div>
      {/* Hero */}
      <div className="bg-slate-900 py-20 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-5 left-20 w-40 h-40 rounded-full border border-white" />
          <div className="absolute bottom-5 right-10 w-60 h-60 rounded-full border border-white" />
        </div>
        <div className="relative">
          <div className="rounded-full bg-amber-500/10 border border-amber-400/20 p-3 w-14 h-14 mx-auto mb-5 flex items-center justify-center">
            <Camera className="h-7 w-7 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Photo Gallery</h1>
          <div className="w-12 h-0.5 bg-amber-400 mx-auto my-4" />
          <p className="text-slate-400 mt-2 max-w-xl mx-auto">
            Moments captured from our choir journey
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => openPhoto(index)}
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption || `Photo ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-300" />
                {photo.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs">{photo.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closePhoto}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closePhoto(); }}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10"
          >
            <X className="h-7 w-7" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2.5 z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2.5 z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div
            className="relative w-[90vw] h-[80vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightbox].imageUrl}
              alt={photos[lightbox].caption || "Gallery photo"}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
            <div className="text-white/60 text-sm">
              {lightbox + 1} / {photos.length}
            </div>
            {photos[lightbox].caption && (
              <p className="text-white/80 text-sm mt-1">{photos[lightbox].caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
