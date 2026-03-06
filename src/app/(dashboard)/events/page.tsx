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
import { Calendar, MapPin, Clock } from "lucide-react";
import {
  EVENT_TYPE_LABELS,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_COLORS,
} from "@/lib/constants";

interface Event {
  id: string;
  title: string;
  eventType: string;
  date: string;
  time: string | null;
  venue: string | null;
  status: string;
  description: string | null;
}

interface EventsResponse {
  events: Event[];
  pagination: { total: number };
}

export default function EventsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const queryParams = new URLSearchParams();
  if (statusFilter) queryParams.set("status", statusFilter);
  if (typeFilter) queryParams.set("eventType", typeFilter);

  const { data, loading, error } = useApi<EventsResponse>(
    `/api/events?${queryParams.toString()}`,
    [statusFilter, typeFilter]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Events"
        description={`${data?.pagination?.total ?? 0} events`}
        actionLabel="New Event"
        actionHref="/events/new"
      />

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.entries(EVENT_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </div>

      {loading && <PageLoading />}
      {error && <div className="p-4 text-red-600 text-sm">Error: {error}</div>}

      {!loading && !error && data && (
        <>
          {data.events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No events found"
              description="Create your first event"
              actionLabel="New Event"
              actionHref="/events/new"
            />
          ) : (
            <div className="space-y-3">
              {data.events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="font-medium truncate">{event.title}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">
                            {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                          </Badge>
                          <Badge className={EVENT_STATUS_COLORS[event.status] || ""}>
                            {EVENT_STATUS_LABELS[event.status] || event.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(event.date), "MMM d, yyyy")}
                          </span>
                          {event.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time}
                            </span>
                          )}
                          {event.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.venue}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
