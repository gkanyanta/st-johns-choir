"use client";

import { useState, useEffect } from "react";
import { Music, Play, ExternalLink } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string | null;
  category: string | null;
  youtubeUrl: string | null;
  description: string | null;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/public/songs")
      .then((r) => r.json())
      .then((d) => setSongs(d.songs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(songs.map((s) => s.category).filter(Boolean))] as string[];

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 px-4 sm:px-6 text-center text-white">
        <Music className="h-12 w-12 mx-auto mb-4 opacity-90" />
        <h1 className="text-3xl sm:text-4xl font-bold">Songs & Media</h1>
        <p className="text-purple-100 mt-2 max-w-xl mx-auto">
          Listen to our choir performances and worship songs
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No songs yet</h3>
            <p className="text-gray-400 mt-1">Check back later for our music and videos</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured video */}
            {activeVideo && (
              <div className="max-w-3xl mx-auto">
                <div className="relative w-full rounded-xl overflow-hidden shadow-lg" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video player"
                  />
                </div>
              </div>
            )}

            {/* Song grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.map((song) => {
                const videoId = song.youtubeUrl ? getYouTubeId(song.youtubeUrl) : null;
                return (
                  <div
                    key={song.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  >
                    {videoId ? (
                      <button
                        onClick={() => setActiveVideo(videoId)}
                        className="relative w-full aspect-video bg-gray-900 overflow-hidden"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt={song.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-600 rounded-full p-3 group-hover:scale-110 transition-transform shadow-lg">
                            <Play className="h-6 w-6 text-white fill-white" />
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="w-full aspect-video bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                        <Music className="h-12 w-12 text-purple-300" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{song.title}</h3>
                      {song.artist && <p className="text-sm text-gray-500 mt-0.5">{song.artist}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        {song.category && (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                            {song.category}
                          </span>
                        )}
                        {videoId && (
                          <a
                            href={song.youtubeUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 ml-auto"
                          >
                            YouTube <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {song.description && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{song.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
