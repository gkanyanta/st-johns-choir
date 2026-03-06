"use client";

import { useApi } from "@/lib/hooks";
import { PageLoading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Megaphone, Clock } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: string | null;
  isUrgent: boolean;
  publishDate: string;
  expiryDate: string | null;
  createdBy: { username: string } | null;
}

interface AnnouncementsResponse {
  announcements: Announcement[];
  total: number;
}

export default function AnnouncementsPage() {
  const { data, loading, error } = useApi<AnnouncementsResponse>("/api/announcements");

  return (
    <div className="space-y-4">
      <PageHeader
        title="Announcements"
        description={`${data?.total ?? 0} announcements`}
        actionLabel="New Announcement"
        actionHref="/announcements/new"
      />

      {loading && <PageLoading />}
      {error && <div className="p-4 text-red-600 text-sm">Error: {error}</div>}

      {!loading && !error && data && (
        <>
          {data.announcements.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No announcements"
              description="Create your first announcement"
              actionLabel="New Announcement"
              actionHref="/announcements/new"
            />
          ) : (
            <div className="space-y-3">
              {data.announcements.map((announcement) => (
                <Card
                  key={announcement.id}
                  className={announcement.isUrgent ? "border-red-200 bg-red-50/30" : ""}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{announcement.title}</h3>
                          {announcement.isUrgent && (
                            <Badge variant="destructive">Urgent</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(announcement.publishDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-3">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {announcement.audience && (
                          <Badge variant="outline" className="text-xs">
                            {announcement.audience}
                          </Badge>
                        )}
                        {announcement.createdBy && (
                          <span>by {announcement.createdBy.username}</span>
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
