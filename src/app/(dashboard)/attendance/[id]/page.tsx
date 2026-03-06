"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/hooks";
import { PageLoading, Spinner } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  Search,
  Check,
  Clock,
  X,
  Shield,
  CheckCheck,
  Save,
  Lock,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  EVENT_TYPE_LABELS,
  ATTENDANCE_STATUS_LABELS,
} from "@/lib/constants";

type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

interface AttendanceRecord {
  id: string;
  memberId: string;
  status: AttendanceStatus;
  checkInTime: string | null;
  minutesLate: number | null;
  notes: string | null;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    section: { id: string; name: string } | null;
  };
}

interface SessionDetail {
  id: string;
  date: string;
  eventType: string;
  venue: string | null;
  startTime: string | null;
  reportingTime: string | null;
  isFinalized: boolean;
  notes: string | null;
  records: AttendanceRecord[];
}

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; icon: React.ElementType; bg: string; activeBg: string; text: string }
> = {
  PRESENT: {
    label: "P",
    icon: Check,
    bg: "bg-gray-100 text-gray-500",
    activeBg: "bg-green-500 text-white",
    text: "Present",
  },
  LATE: {
    label: "L",
    icon: Clock,
    bg: "bg-gray-100 text-gray-500",
    activeBg: "bg-yellow-500 text-white",
    text: "Late",
  },
  ABSENT: {
    label: "A",
    icon: X,
    bg: "bg-gray-100 text-gray-500",
    activeBg: "bg-red-500 text-white",
    text: "Absent",
  },
  EXCUSED: {
    label: "E",
    icon: Shield,
    bg: "bg-gray-100 text-gray-500",
    activeBg: "bg-blue-500 text-white",
    text: "Excused",
  },
};

export default function MarkAttendancePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: rawData, loading, error, refetch } = useApi<{ session: SessionDetail }>(
    `/api/attendance/sessions/${id}`
  );
  const session = rawData?.session ?? null;

  const [records, setRecords] = useState<
    Record<string, { status: AttendanceStatus; checkInTime?: string; minutesLate?: number; notes?: string }>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Initialize records from session data
  useEffect(() => {
    if (session?.records) {
      const initial: Record<string, { status: AttendanceStatus; checkInTime?: string; minutesLate?: number; notes?: string }> = {};
      session.records.forEach((r) => {
        initial[r.memberId] = {
          status: r.status,
          checkInTime: r.checkInTime || undefined,
          minutesLate: r.minutesLate ?? undefined,
          notes: r.notes || undefined,
        };
      });
      setRecords(initial);
    }
  }, [session]);

  // Get unique sections
  const sections = useMemo(() => {
    if (!session?.records) return [];
    const sectionMap = new Map<string, string>();
    session.records.forEach((r) => {
      if (r.member.section) {
        sectionMap.set(r.member.section.id, r.member.section.name);
      }
    });
    return Array.from(sectionMap.entries()).map(([id, name]) => ({ id, name }));
  }, [session]);

  // Filter members
  const filteredRecords = useMemo(() => {
    if (!session?.records) return [];
    return session.records.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        `${r.member.firstName} ${r.member.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesSection =
        sectionFilter === "all" || r.member.section?.id === sectionFilter;
      return matchesSearch && matchesSection;
    });
  }, [session, searchQuery, sectionFilter]);

  // Group by section
  const groupedRecords = useMemo(() => {
    const groups: Record<string, AttendanceRecord[]> = {};
    filteredRecords.forEach((r) => {
      const sectionName = r.member.section?.name || "No Section";
      if (!groups[sectionName]) groups[sectionName] = [];
      groups[sectionName].push(r);
    });
    // Sort members within each section
    Object.values(groups).forEach((g) =>
      g.sort((a, b) =>
        `${a.member.firstName} ${a.member.lastName}`.localeCompare(
          `${b.member.firstName} ${b.member.lastName}`
        )
      )
    );
    return groups;
  }, [filteredRecords]);

  // Summary counts
  const summary = useMemo(() => {
    const counts = { PRESENT: 0, LATE: 0, ABSENT: 0, EXCUSED: 0 };
    Object.values(records).forEach((r) => {
      if (r.status in counts) counts[r.status]++;
    });
    return counts;
  }, [records]);

  const setMemberStatus = useCallback(
    (memberId: string, status: AttendanceStatus) => {
      if (session?.isFinalized) return;
      setRecords((prev) => ({
        ...prev,
        [memberId]: { ...prev[memberId], status },
      }));
    },
    [session?.isFinalized]
  );

  const markAllPresent = useCallback(() => {
    if (session?.isFinalized) return;
    setRecords((prev) => {
      const updated = { ...prev };
      session?.records.forEach((r) => {
        updated[r.memberId] = { ...updated[r.memberId], status: "PRESENT" };
      });
      return updated;
    });
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const payload = Object.entries(records).map(([memberId, data]) => ({
        memberId,
        status: data.status,
        checkInTime: data.checkInTime || undefined,
        minutesLate: data.minutesLate || undefined,
        notes: data.notes || undefined,
      }));

      const res = await fetch(`/api/attendance/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: payload }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to save" }));
        throw new Error(err.error || "Failed to save");
      }

      setSaveMessage({ type: "success", text: "Attendance saved successfully!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!confirm("Are you sure you want to finalize this session? This action cannot be undone.")) {
      return;
    }

    setFinalizing(true);
    try {
      // Save first
      await handleSave();

      const res = await fetch(`/api/attendance/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFinalized: true }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to finalize" }));
        throw new Error(err.error || "Failed to finalize");
      }

      refetch();
    } catch (err) {
      setSaveMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to finalize",
      });
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) return <PageLoading />;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!session) return null;

  const isFinalized = session.isFinalized;
  const totalMembers = session.records.length;

  return (
    <div className="space-y-4">
      <PageHeader
        title={isFinalized ? "Attendance (Finalized)" : "Mark Attendance"}
        backHref="/attendance"
      />

      {/* Session Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(session.date), "EEEE, MMM d, yyyy")}
            </Badge>
            <Badge variant="secondary">
              {EVENT_TYPE_LABELS[session.eventType] || session.eventType}
            </Badge>
            {session.venue && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {session.venue}
              </Badge>
            )}
            {isFinalized && (
              <Badge variant="success" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Finalized
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Counts */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-green-700">{summary.PRESENT}</p>
          <p className="text-xs text-green-600">Present</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-yellow-700">{summary.LATE}</p>
          <p className="text-xs text-yellow-600">Late</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-red-700">{summary.ABSENT}</p>
          <p className="text-xs text-red-600">Absent</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-blue-700">{summary.EXCUSED}</p>
          <p className="text-xs text-blue-600">Excused</p>
        </div>
      </div>

      {/* Actions Bar */}
      {!isFinalized && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={markAllPresent} variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark All Present
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Spinner className="mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={handleFinalize}
            disabled={finalizing}
            variant="secondary"
            size="sm"
          >
            {finalizing ? <Spinner className="mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
            {finalizing ? "Finalizing..." : "Finalize"}
          </Button>
        </div>
      )}

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`p-3 rounded-lg text-sm ${
            saveMessage.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Section Tabs */}
      <Tabs value={sectionFilter} onValueChange={setSectionFilter}>
        <TabsList className="overflow-x-auto w-full justify-start">
          <TabsTrigger value="all">All ({totalMembers})</TabsTrigger>
          {sections.map((section) => (
            <TabsTrigger key={section.id} value={section.id}>
              {section.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Member List */}
        <TabsContent value={sectionFilter}>
          <div className="space-y-1">
            {Object.entries(groupedRecords).map(([sectionName, sectionRecords]) => (
              <div key={sectionName}>
                <div className="sticky top-0 bg-gray-50 px-3 py-2 rounded-lg mb-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {sectionName} ({sectionRecords.length})
                  </p>
                </div>
                <div className="space-y-1">
                  {sectionRecords.map((record) => {
                    const currentStatus = records[record.memberId]?.status || record.status;

                    return (
                      <div
                        key={record.memberId}
                        className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white border border-gray-100"
                      >
                        {/* Member Name */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {record.member.firstName} {record.member.lastName}
                          </p>
                        </div>

                        {/* Status Buttons - Large touch targets */}
                        <div className="flex gap-1">
                          {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(
                            (status) => {
                              const config = STATUS_CONFIG[status];
                              const isActive = currentStatus === status;
                              const Icon = config.icon;

                              return (
                                <button
                                  key={status}
                                  onClick={() => setMemberStatus(record.memberId, status)}
                                  disabled={isFinalized}
                                  className={`flex items-center justify-center rounded-lg min-w-[40px] h-10 sm:min-w-[48px] sm:h-10 transition-all ${
                                    isActive ? config.activeBg : config.bg
                                  } ${
                                    isFinalized
                                      ? "opacity-75 cursor-not-allowed"
                                      : "active:scale-95"
                                  }`}
                                  title={config.text}
                                >
                                  <Icon className="h-4 w-4" />
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No members found matching your search
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Save Bar - Fixed on mobile */}
      {!isFinalized && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-200 p-3 flex items-center justify-between z-40">
          <div className="text-sm text-gray-500">
            {summary.PRESENT + summary.LATE}/{totalMembers} present
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? <Spinner className="mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
            <Button
              onClick={handleFinalize}
              disabled={finalizing}
              variant="secondary"
              size="sm"
            >
              <Lock className="h-4 w-4 mr-1" />
              Finalize
            </Button>
          </div>
        </div>
      )}

      {/* Spacer for fixed bottom bar */}
      {!isFinalized && <div className="h-16" />}
    </div>
  );
}
