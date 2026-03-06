"use client";

import { useState } from "react";
import { useApi, useDebounce } from "@/lib/hooks";
import { PageLoading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Users, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  MEMBER_STATUS_LABELS,
  MEMBER_STATUS_COLORS,
} from "@/lib/constants";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  status: string;
  section: { id: string; name: string } | null;
}

interface MembersResponse {
  members: Member[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
}

interface SectionsResponse {
  sections: { id: string; name: string }[];
}

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const debouncedSearch = useDebounce(search, 300);

  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.set("search", debouncedSearch);
  if (section) queryParams.set("section", section);
  if (status) queryParams.set("status", status);
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));

  const { data, loading, error } = useApi<MembersResponse>(
    `/api/members?${queryParams.toString()}`,
    [debouncedSearch, section, status, page]
  );

  const { data: sectionsData } = useApi<SectionsResponse>("/api/sections");

  return (
    <div className="space-y-4">
      <PageHeader
        title="Members"
        description={`${data?.pagination?.total ?? 0} total members`}
        actionLabel="Add Member"
        actionHref="/members/new"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <select
          value={section}
          onChange={(e) => {
            setSection(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-gray-200 px-3 text-sm bg-white min-w-[130px]"
        >
          <option value="">All Sections</option>
          {sectionsData?.sections?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-gray-200 px-3 text-sm bg-white min-w-[130px]"
        >
          <option value="">All Statuses</option>
          {Object.entries(MEMBER_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && <PageLoading />}

      {/* Error */}
      {error && <div className="p-4 text-red-600 text-sm">Error: {error}</div>}

      {/* Members List */}
      {!loading && !error && data && (
        <>
          {data.members.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No members found"
              description={search ? "Try adjusting your search or filters" : "Add your first choir member to get started"}
              actionLabel={!search ? "Add Member" : undefined}
              actionHref={!search ? "/members/new" : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.members.map((member) => (
                <Link key={member.id} href={`/members/${member.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {member.firstName} {member.lastName}
                          </p>
                          {member.section && (
                            <p className="text-xs text-gray-500">{member.section.name}</p>
                          )}
                          {member.phone && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </p>
                          )}
                        </div>
                        <Badge className={MEMBER_STATUS_COLORS[member.status] || ""}>
                          {MEMBER_STATUS_LABELS[member.status] || member.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page >= data.pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
