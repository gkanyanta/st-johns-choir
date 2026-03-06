"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks";
import { PageLoading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ClipboardList, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { EVENT_TYPE_LABELS } from "@/lib/constants";

interface Session {
  id: string;
  date: string;
  eventType: string;
  venue: string | null;
  isFinalized: boolean;
  _count: { records: number };
  records: { status: string }[];
}

interface SessionsResponse {
  sessions: Session[];
  total: number;
}

export default function AttendancePage() {
  const [eventType, setEventType] = useState("");

  const queryParams = new URLSearchParams();
  if (eventType) queryParams.set("eventType", eventType);

  const { data, loading, error } = useApi<SessionsResponse>(
    `/api/attendance/sessions?${queryParams.toString()}`,
    [eventType]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Attendance"
        description="Manage attendance sessions"
        actionLabel="New Session"
        actionHref="/attendance/new"
      />

      {/* Filter */}
      <div className="flex gap-3">
        <Select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">All Event Types</option>
          {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {loading && <PageLoading />}
      {error && <div className="p-4 text-red-600 text-sm">Error: {error}</div>}

      {!loading && !error && data && (
        <>
          {data.sessions.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No attendance sessions"
              description="Create your first attendance session to start tracking"
              actionLabel="New Session"
              actionHref="/attendance/new"
            />
          ) : (
            <div className="space-y-3">
              {data.sessions.map((session) => {
                const presentCount = session.records.filter(
                  (r) => r.status === "PRESENT" || r.status === "LATE"
                ).length;
                const totalCount = session._count.records;

                return (
                  <Link key={session.id} href={`/attendance/${session.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {EVENT_TYPE_LABELS[session.eventType] || session.eventType}
                              </p>
                              {session.isFinalized && (
                                <Badge variant="success">Finalized</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {format(new Date(session.date), "EEEE, MMM d, yyyy")}
                            </p>
                            {session.venue && (
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.venue}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Users className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {presentCount}/{totalCount}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">present</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
