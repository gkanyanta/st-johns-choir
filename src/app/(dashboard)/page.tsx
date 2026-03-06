"use client";

import { useApi } from "@/lib/hooks";
import { PageLoading } from "@/components/shared/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  Calendar,
  Megaphone,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  EVENT_TYPE_LABELS,
} from "@/lib/constants";

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

export default function DashboardPage() {
  const { data, loading, error } = useApi<DashboardData>("/api/dashboard");

  if (loading) return <PageLoading />;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!data) return null;

  const maxSectionCount = Math.max(...data.membersBySection.map((s) => s.count), 1);
  const sectionColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-red-500",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of choir activities</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Members</p>
                <p className="text-xl font-bold">{data.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Attendance Rate</p>
                <p className="text-xl font-bold">{data.attendance.rate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Outstanding Penalties</p>
                <p className="text-xl font-bold">K{Number(data.outstandingPenalties.totalBalance).toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Upcoming Events</p>
                <p className="text-xl font-bold">{data.upcomingEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members by Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.membersBySection.map((section, index) => (
              <div key={section.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{section.name}</span>
                  <span className="font-medium">{section.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${sectionColors[index % sectionColors.length]}`}
                    style={{ width: `${(section.count / maxSectionCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {data.membersBySection.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No sections found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Attendance Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Attendance</CardTitle>
              <Link href="/attendance" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/attendance/${session.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <CalendarCheck className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {EVENT_TYPE_LABELS[session.eventType] || session.eventType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(session.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {session.presentCount}/{session.totalCount}
                    </p>
                    <p className="text-xs text-gray-500">present</p>
                  </div>
                </Link>
              ))}
              {data.recentSessions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent sessions</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming Events</CardTitle>
              <Link href="/events" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="rounded-lg bg-purple-50 p-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500">
                        {format(new Date(event.date), "MMM d, yyyy")}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {data.upcomingEvents.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Announcements</CardTitle>
            <Link href="/announcements" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{announcement.title}</p>
                        {announcement.isUrgent && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(announcement.publishDate), "MMM d")}
                  </span>
                </div>
              </div>
            ))}
            {data.recentAnnouncements.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No announcements</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
