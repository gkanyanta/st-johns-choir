"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Music, ChevronLeft, ChevronRight, Users, Calendar,
  TrendingUp, Award, ArrowRight, Megaphone, Clock,
} from "lucide-react";

const slides = [
  {
    image: "/images/slides/slide-photo1.jpeg",
    title: "Angels Church Choir",
    subtitle: "Making a joyful noise unto the Lord",
  },
  {
    image: "/images/slides/slide-photo2.jpeg",
    title: "Worship in Harmony",
    subtitle: "United voices lifting praises every Sunday",
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
      style={{ minHeight: "400px", maxHeight: "550px", height: "60vh" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: index === current ? 1 : 0 }}
        >
          <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-4">
              <Music className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg tracking-tight">
              {slide.title}
            </h1>
            <p className="text-base sm:text-xl text-white/90 mt-3 max-w-2xl drop-shadow font-light">
              {slide.subtitle}
            </p>
            <div className="flex gap-3 mt-6">
              <Link
                href="/apply"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Join the Choir
              </Link>
              <Link
                href="/inquiry"
                className="px-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-lg transition-colors text-sm border border-white/30"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button onClick={prev} className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 transition-colors" aria-label="Previous">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={next} className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 transition-colors" aria-label="Next">
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-white" : "w-2 bg-white/50"}`} aria-label={`Slide ${i + 1}`} />
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
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Welcome to Angels Church Choir</h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            We are a vibrant community of singers dedicated to glorifying God through music and worship.
            Our choir brings together voices from all walks of life, united in faith and harmony.
            Whether you are a seasoned vocalist or just discovering your voice, there is a place for you here.
          </p>
        </div>
      </section>

      {/* Stats */}
      {data && (
        <section className="py-12 px-4 sm:px-6 bg-blue-600">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-6 text-center text-white">
              <div>
                <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl sm:text-4xl font-bold">{data.totalMembers}</div>
                <div className="text-sm text-blue-100 mt-1">Choir Members</div>
              </div>
              <div>
                <Music className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl sm:text-4xl font-bold">{data.totalSections}</div>
                <div className="text-sm text-blue-100 mt-1">Voice Sections</div>
              </div>
              <div>
                <Award className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl sm:text-4xl font-bold">{data.accolades?.length || 0}</div>
                <div className="text-sm text-blue-100 mt-1">Accolades</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Announcements */}
      {data && data.recentAnnouncements.length > 0 && (
        <section className="py-16 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Latest News</h2>
              <p className="text-gray-500 mt-2">Stay updated with choir activities and announcements</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.recentAnnouncements.map((a) => (
                <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`h-1.5 ${a.isUrgent ? "bg-red-500" : "bg-blue-500"}`} />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {a.isUrgent && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">Urgent</span>}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(a.publishDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{a.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-3">{a.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {data && data.upcomingEvents.length > 0 && (
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Upcoming Events</h2>
              <p className="text-gray-500 mt-2">Join us at our upcoming events</p>
            </div>
            <div className="space-y-4">
              {data.upcomingEvents.map((event) => {
                const d = new Date(event.date);
                return (
                  <div key={event.id} className="flex items-stretch bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-blue-600 text-white px-4 sm:px-6 py-4 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[90px]">
                      <span className="text-xs uppercase font-medium opacity-80">{format(d, "MMM")}</span>
                      <span className="text-2xl sm:text-3xl font-bold leading-none">{format(d, "d")}</span>
                      <span className="text-xs opacity-80">{format(d, "EEE")}</span>
                    </div>
                    <div className="flex-1 p-4 sm:p-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        {event.venue && <p className="text-sm text-gray-500 mt-0.5">{event.venue}</p>}
                      </div>
                      <Calendar className="h-5 w-5 text-gray-300" />
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
        <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Achievements</h2>
              <p className="text-gray-500 mt-2">Celebrating God&apos;s faithfulness through our journey</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.accolades.slice(0, 3).map((a) => (
                <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
                  <div className="rounded-full bg-yellow-50 p-3 w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{a.title}</h3>
                  {a.date && <p className="text-xs text-gray-400 mb-2">{format(new Date(a.date), "MMMM yyyy")}</p>}
                  {a.category && <span className="inline-block px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full mb-2">{a.category}</span>}
                  {a.description && <p className="text-sm text-gray-500 line-clamp-2">{a.description}</p>}
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/accolades" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm">
                View All Achievements <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Join Us?</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            We welcome new members who share a passion for worship through music.
            Submit your application today and become part of our choir family.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/apply"
              className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Apply to Join
            </Link>
            <Link
              href="/inquiry"
              className="px-8 py-3 border-2 border-white/50 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Send an Inquiry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
