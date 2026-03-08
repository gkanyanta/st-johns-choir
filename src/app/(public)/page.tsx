"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Music, ChevronLeft, ChevronRight, Users, Calendar,
  Award, ArrowRight, Clock,
} from "lucide-react";

const slides = [
  {
    image: "/images/slides/slide-1.jpeg",
    title: "Angels Church Choir",
    subtitle: "Making a joyful noise unto the Lord",
  },
  {
    image: "/images/slides/slide-3.jpeg",
    title: "United in Faith",
    subtitle: "Together in song, united in purpose",
  },
  {
    image: "/images/slides/slide-5.jpeg",
    title: "Worship in Harmony",
    subtitle: "United voices lifting praises every Sunday",
  },
  {
    image: "/images/slides/slide-8.jpeg",
    title: "Praise & Worship",
    subtitle: "Glorifying God through music and fellowship",
  },
  {
    image: "/images/slides/slide-15.jpeg",
    title: "Join Our Family",
    subtitle: "Singing His glory in every season",
  },
];

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: "500px", maxHeight: "800px", height: "80vh" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: index === current ? 1 : 0 }}
        >
          <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-slate-900/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg tracking-tight">
              {slide.title}
            </h1>
            <div className="w-16 h-0.5 bg-amber-400/60 mx-auto my-4" />
            <p className="text-base sm:text-xl text-white/85 max-w-2xl drop-shadow font-light">
              {slide.subtitle}
            </p>
            <div className="flex gap-3 mt-8">
              <Link
                href="/apply"
                className="px-7 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all text-sm shadow-lg shadow-amber-500/20"
              >
                Join the Choir
              </Link>
              <Link
                href="/inquiry"
                className="px-7 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg transition-all text-sm border border-white/20"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button onClick={prev} className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white rounded-full p-2.5 transition-all" aria-label="Previous">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={next} className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white rounded-full p-2.5 transition-all" aria-label="Next">
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-amber-400" : "w-2 bg-white/40"}`} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

interface PublicData {
  totalMembers: number;
  totalSections: number;
  upcomingEvents: { id: string; title: string; date: string; eventType: string; venue: string | null }[];
  recentAnnouncements: { id: string; title: string; content: string; isUrgent: boolean; publishDate: string }[];
  accolades: { id: string; title: string; description: string | null; date: string | null; category: string | null }[];
}

export default function PublicHomePage() {
  const [data, setData] = useState<PublicData | null>(null);

  useEffect(() => {
    fetch("/api/public/home")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div>
      <HeroSlideshow />

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-0.5 bg-amber-400 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-5">Welcome to Our Choir</h2>
          <p className="text-slate-500 leading-relaxed text-lg">
            We are a vibrant community of singers dedicated to glorifying God through music and worship.
            Our choir brings together voices from all walks of life, united in faith and harmony.
            Whether you are a seasoned vocalist or just discovering your voice, there is a place for you here.
          </p>
        </div>
      </section>

      {/* Stats */}
      {data && (
        <section className="py-14 px-4 sm:px-6 bg-slate-900">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <Users className="h-7 w-7 mx-auto mb-2 text-amber-400" />
                <div className="text-3xl sm:text-4xl font-bold text-white">{data.totalMembers}</div>
                <div className="text-sm text-slate-400 mt-1">Choir Members</div>
              </div>
              <div>
                <Music className="h-7 w-7 mx-auto mb-2 text-amber-400" />
                <div className="text-3xl sm:text-4xl font-bold text-white">{data.totalSections}</div>
                <div className="text-sm text-slate-400 mt-1">Voice Sections</div>
              </div>
              <div>
                <Award className="h-7 w-7 mx-auto mb-2 text-amber-400" />
                <div className="text-3xl sm:text-4xl font-bold text-white">{data.accolades?.length || 0}</div>
                <div className="text-sm text-slate-400 mt-1">Accolades</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Announcements */}
      {data && data.recentAnnouncements.length > 0 && (
        <section className="py-20 px-4 sm:px-6 bg-stone-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-12 h-0.5 bg-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Latest News</h2>
              <p className="text-slate-400 mt-2">Stay updated with choir activities</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.recentAnnouncements.map((a) => (
                <div key={a.id} className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden hover:shadow-md transition-all duration-300 group">
                  <div className={`h-1 ${a.isUrgent ? "bg-red-500" : "bg-amber-400"}`} />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {a.isUrgent && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">Urgent</span>}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(a.publishDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">{a.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">{a.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {data && data.upcomingEvents.length > 0 && (
        <section className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-12 h-0.5 bg-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Upcoming Events</h2>
              <p className="text-slate-400 mt-2">Join us at our upcoming events</p>
            </div>
            <div className="space-y-4">
              {data.upcomingEvents.map((event) => {
                const d = new Date(event.date);
                return (
                  <div key={event.id} className="flex items-stretch bg-white rounded-xl border border-stone-200/60 overflow-hidden hover:shadow-md transition-all duration-300 group">
                    <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[85px]">
                      <span className="text-[10px] uppercase tracking-wider font-medium text-amber-400">{format(d, "MMM")}</span>
                      <span className="text-2xl sm:text-3xl font-bold leading-none mt-0.5">{format(d, "d")}</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{format(d, "EEE")}</span>
                    </div>
                    <div className="flex-1 p-4 sm:p-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">{event.title}</h3>
                        {event.venue && <p className="text-sm text-slate-400 mt-0.5">{event.venue}</p>}
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Accolades Preview */}
      {data && data.accolades.length > 0 && (
        <section className="py-20 px-4 sm:px-6 bg-stone-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-12 h-0.5 bg-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Our Achievements</h2>
              <p className="text-slate-400 mt-2">Celebrating God&apos;s faithfulness through our journey</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.accolades.slice(0, 3).map((a) => (
                <div key={a.id} className="bg-white rounded-xl shadow-sm border border-stone-200/60 p-6 text-center hover:shadow-md transition-all duration-300 group">
                  <div className="rounded-full bg-amber-50 p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{a.title}</h3>
                  {a.date && <p className="text-xs text-slate-400 mb-2">{format(new Date(a.date), "MMMM yyyy")}</p>}
                  {a.category && <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full mb-2">{a.category}</span>}
                  {a.description && <p className="text-sm text-slate-400 line-clamp-2">{a.description}</p>}
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/accolades" className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-medium text-sm transition-colors">
                View All Achievements <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full border border-white" />
          <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full border border-white" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="w-12 h-0.5 bg-amber-400 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Join Us?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            We welcome new members who share a passion for worship through music.
            Submit your application today and become part of our choir family.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/apply"
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
            >
              Apply to Join
            </Link>
            <Link
              href="/inquiry"
              className="px-8 py-3 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-all"
            >
              Send an Inquiry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
