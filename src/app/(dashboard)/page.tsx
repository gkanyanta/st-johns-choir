"use client";

import { useState, useEffect, useCallback } from "react";
import { useApi, useAuth } from "@/lib/hooks";
import { PageLoading } from "@/components/shared/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  Calendar,
  Megaphone,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Music,
  Heart,
  ArrowRight,
  ClipboardCheck,
  BarChart3,
  UserPlus,
  Bell,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { EVENT_TYPE_LABELS } from "@/lib/constants";

interface DashboardData {
  totalMembers: number;
  membersBySection: { name: string; count: number }[];
  attendance: { rate: number; sessions: number };
  outstandingPenalties: { count: number; totalBalance: number };
  paymentsThisMonth: { count: number; totalAmount: number };
  upcomingEvents: { id: string; title: string; date: string; eventType: string }[];
  recentAnnouncements: { id: string; title: string; content: string; isUrgent: boolean; publishDate: string }[];
  recentSessions: { id: string; date: string; eventType: string; presentCount: number; totalCount: number }[];
}

const slides = [
  {
    image: "/images/slides/slide1.svg",
    title: "Angels Church Choir",
    subtitle: "Making a joyful noise unto the Lord",
  },
  {
    image: "/images/slides/slide2.svg",
    title: "Worship in Harmony",
    subtitle: "United voices lifting praises every Sunday",
  },
  {
    image: "/images/slides/slide3.svg",
    title: "Join Our Fellowship",
    subtitle: "Growing together through music and faith",
  },
];

const sectionIcons: Record<string, { bg: string; text: string; border: string }> = {
  Soprano: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
  Alto: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  Tenor: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  Bass: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-xl -mx-4 sm:-mx-6 md:mx-0"
      style={{ aspectRatio: "16/7", minHeight: "220px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: index === current ? 1 : 0 }}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 mb-3 sm:mb-4">
              <Music className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg tracking-tight">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-white/90 mt-2 sm:mt-3 max-w-2xl drop-shadow font-light">
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-1.5 sm:p-2 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-1.5 sm:p-2 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error } = useApi<DashboardData>("/api/dashboard");
  const { user } = useAuth();

  if (loading) return <PageLoading />;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!data) return null;

  const displayName = user?.member
    ? user.member.firstName
    : user?.username || "there";

  const canManage = user && ["SUPER_ADMIN", "SECRETARY", "CHOIR_DIRECTOR"].includes(user.role);

  return (
    <div className="space-y-8">
      {/* Hero Slideshow */}
      <HeroSlideshow />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">
              {getGreeting()}, {displayName}!
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {format(new Date(), "EEEE, MMMM d, yyyy")} &middot; Welcome to Angels Church Choir
            </p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <Link href="/attendance/new">
                <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <ClipboardCheck className="h-4 w-4 mr-1" />
                  Take Attendance
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* At a Glance Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Choir at a Glance
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/members">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <CardContent className="p-4 pl-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 group-hover:bg-blue-100 transition-colors">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Members</p>
                    <p className="text-2xl font-bold text-gray-900">{data.totalMembers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/attendance">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
              <CardContent className="p-4 pl-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-green-50 p-2.5 group-hover:bg-green-100 transition-colors">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Attendance</p>
                    <p className="text-2xl font-bold text-gray-900">{data.attendance.rate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/penalties">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <CardContent className="p-4 pl-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-red-50 p-2.5 group-hover:bg-red-100 transition-colors">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Penalties</p>
                    <p className="text-2xl font-bold text-gray-900">K{Number(data.outstandingPenalties.totalBalance).toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/events">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
              <CardContent className="p-4 pl-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-50 p-2.5 group-hover:bg-purple-100 transition-colors">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Events</p>
                    <p className="text-2xl font-bold text-gray-900">{data.upcomingEvents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* News & Announcements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            News & Announcements
          </h3>
          <Link href="/announcements" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {data.recentAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No announcements at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recentAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className={`h-1.5 ${announcement.isUrgent ? "bg-red-500" : "bg-blue-500"}`} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {announcement.isUrgent && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(announcement.publishDate), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1.5">{announcement.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {announcement.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Two Column: Events & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Upcoming Events
            </h3>
            <Link href="/events" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {data.upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No upcoming events</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.upcomingEvents.map((event) => {
                const eventDate = new Date(event.date);
                return (
                  <Card key={event.id} className="hover:shadow-md transition-all duration-200">
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        <div className="bg-purple-600 text-white rounded-l-lg px-3 sm:px-4 py-3 flex flex-col items-center justify-center min-w-[60px] sm:min-w-[70px]">
                          <span className="text-xs uppercase font-medium opacity-80">
                            {format(eventDate, "MMM")}
                          </span>
                          <span className="text-xl sm:text-2xl font-bold leading-none">
                            {format(eventDate, "d")}
                          </span>
                          <span className="text-xs opacity-80">
                            {format(eventDate, "EEE")}
                          </span>
                        </div>
                        <div className="flex-1 p-3 sm:p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                            </Badge>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Attendance */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-green-600" />
              Recent Attendance
            </h3>
            <Link href="/attendance" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {data.recentSessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardCheck className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent sessions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.recentSessions.map((session) => {
                const rate = session.totalCount > 0
                  ? Math.round((session.presentCount / session.totalCount) * 100)
                  : 0;
                return (
                  <Link key={session.id} href={`/attendance/${session.id}`}>
                    <Card className="hover:shadow-md transition-all duration-200 mb-3">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-green-50 p-1.5">
                              <CalendarCheck className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {EVENT_TYPE_LABELS[session.eventType] || session.eventType}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(session.date), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-700">{rate}%</p>
                            <p className="text-xs text-gray-500">
                              {session.presentCount}/{session.totalCount}
                            </p>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Choir Sections */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Music className="h-5 w-5 text-blue-600" />
            Our Sections
          </h3>
          <Link href="/members" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View members <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {data.membersBySection.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Music className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No sections found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {data.membersBySection.map((section) => {
              const style = sectionIcons[section.name] || {
                bg: "bg-gray-50",
                text: "text-gray-600",
                border: "border-gray-200",
              };
              return (
                <Card
                  key={section.name}
                  className={`hover:shadow-md transition-all duration-200 border ${style.border}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`rounded-full ${style.bg} p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center`}>
                      <Music className={`h-5 w-5 ${style.text}`} />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">{section.name}</h4>
                    <p className={`text-2xl font-bold mt-1 ${style.text}`}>{section.count}</p>
                    <p className="text-xs text-gray-500">members</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {canManage && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/members/new">
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="rounded-full bg-blue-50 p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Add Member</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/attendance/new">
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="rounded-full bg-green-50 p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <ClipboardCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Take Attendance</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/announcements">
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="rounded-full bg-orange-50 p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <Megaphone className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Announcements</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/reports">
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="rounded-full bg-purple-50 p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">View Reports</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <Separator />
      <div className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Music className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">Angels Church Choir</span>
        </div>
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
          <Heart className="h-3 w-3 text-red-400" />
          Singing for the Glory of God
        </p>
      </div>
    </div>
  );
}
