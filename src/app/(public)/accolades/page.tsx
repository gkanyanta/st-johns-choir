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
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 py-16 px-4 sm:px-6 text-center text-white">
        <Award className="h-12 w-12 mx-auto mb-4 opacity-90" />
        <h1 className="text-3xl sm:text-4xl font-bold">Our Accolades</h1>
        <p className="text-yellow-100 mt-2 max-w-xl mx-auto">
          Celebrating the achievements and milestones of Angels Church Choir
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : accolades.length === 0 ? (
          <div className="text-center py-16">
            <Star className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No accolades yet</h3>
            <p className="text-gray-400 mt-1">Check back later for our achievements</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accolades.map((accolade) => {
              const Icon = (accolade.category && categoryIcons[accolade.category]) || Award;
              return (
                <div
                  key={accolade.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2" />
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="rounded-full bg-yellow-50 p-2.5 group-hover:bg-yellow-100 transition-colors">
                        <Icon className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{accolade.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {accolade.date && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(accolade.date), "MMMM yyyy")}
                            </span>
                          )}
                          {accolade.category && (
                            <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full">
                              {accolade.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {accolade.description && (
                      <p className="text-sm text-gray-500 leading-relaxed">{accolade.description}</p>
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
