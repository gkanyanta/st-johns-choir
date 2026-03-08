"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Info, Users, Heart, Music } from "lucide-react";

interface Leader {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  imageUrl: string | null;
}

export default function AboutPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/leaders")
      .then((r) => r.json())
      .then((d) => setLeaders(d.leaders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
            <Info className="h-7 w-7 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">About Us</h1>
          <div className="w-12 h-0.5 bg-amber-400 mx-auto my-4" />
          <p className="text-slate-400 mt-2 max-w-xl mx-auto">
            Learn more about Holy Angels Church Choir and our leadership
          </p>
        </div>
      </div>

      {/* About Section */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 rounded-xl bg-stone-50 border border-stone-200/60">
              <div className="rounded-full bg-amber-50 p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                <Music className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Our Mission</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                To glorify God through music and worship, nurturing spiritual growth and unity among our members.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-stone-50 border border-stone-200/60">
              <div className="rounded-full bg-amber-50 p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Our Values</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Faith, discipline, harmony, fellowship, and excellence in service to God and the Church.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-stone-50 border border-stone-200/60">
              <div className="rounded-full bg-amber-50 p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Our Community</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                A vibrant family of singers from all walks of life, united by faith and a passion for worship.
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-3xl mx-auto text-center">
            <p className="text-slate-500 leading-relaxed text-lg">
              Holy Angels Church Choir, St. Peter&apos;s Congregation, is dedicated to leading worship through
              music within the United Church of Zambia. Our choir brings together voices from all walks of life,
              creating beautiful harmonies that uplift the spirit and glorify God. We are committed to excellence
              in ministry, fellowship, and spiritual growth.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-12 h-0.5 bg-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Our Leadership</h2>
            <p className="text-slate-400 mt-2">Meet the team that guides our choir</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto" />
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-stone-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-400">Leadership info coming soon</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaders.map((leader) => (
                <div
                  key={leader.id}
                  className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden hover:shadow-md transition-all duration-300 group"
                >
                  <div className="aspect-[4/3] relative bg-gradient-to-br from-stone-100 to-stone-50 overflow-hidden">
                    {leader.imageUrl ? (
                      <Image
                        src={leader.imageUrl}
                        alt={leader.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-amber-50 p-6">
                          <Users className="h-12 w-12 text-amber-300" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="font-semibold text-slate-900 text-lg">{leader.name}</h3>
                    <p className="text-amber-600 text-sm font-medium mt-0.5">{leader.position}</p>
                    {leader.bio && (
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed line-clamp-3">{leader.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
