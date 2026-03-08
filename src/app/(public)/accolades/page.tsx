"use client";

import { useState, useEffect } from "react";
import { Award, Calendar, Trophy, Medal, Star } from "lucide-react";
import { format } from "date-fns";

interface Accolade {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  category: string | null;
  imageUrl: string | null;
}

const categoryIcons: Record<string, typeof Trophy> = {
  Festival: Trophy,
  Award: Award,
  Competition: Medal,
};

export default function AccoladesPage() {
  const [accolades, setAccolades] = useState<Accolade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/accolades")
      .then((r) => r.json())
      .then((d) => setAccolades(d.accolades || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="bg-slate-900 py-20 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-5 right-20 w-40 h-40 rounded-full border border-white" />
          <div className="absolute bottom-5 left-10 w-60 h-60 rounded-full border border-white" />
        </div>
        <div className="relative">
          <div className="rounded-full bg-amber-500/10 border border-amber-400/20 p-3 w-14 h-14 mx-auto mb-5 flex items-center justify-center">
            <Award className="h-7 w-7 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Our Accolades</h1>
          <div className="w-12 h-0.5 bg-amber-400 mx-auto my-4" />
          <p className="text-slate-400 mt-2 max-w-xl mx-auto">
            Celebrating the achievements and milestones of Angels Church Choir
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto" />
          </div>
        ) : accolades.length === 0 ? (
          <div className="text-center py-20">
            <Star className="h-16 w-16 text-stone-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400">No accolades yet</h3>
            <p className="text-slate-400 mt-1">Check back later for our achievements</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accolades.map((accolade) => {
              const Icon = (accolade.category && categoryIcons[accolade.category]) || Award;
              return (
                <div
                  key={accolade.id}
                  className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden hover:shadow-md transition-all duration-300 group"
                >
                  <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="rounded-full bg-amber-50 p-2.5 group-hover:bg-amber-100 transition-colors">
                        <Icon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{accolade.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {accolade.date && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(accolade.date), "MMMM yyyy")}
                            </span>
                          )}
                          {accolade.category && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                              {accolade.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {accolade.description && (
                      <p className="text-sm text-slate-400 leading-relaxed">{accolade.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
