"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/shared/loading";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { useApi } from "@/lib/hooks";
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
  PENALTY_TYPE_LABELS,
  PENALTY_STATUS_LABELS,
  PENALTY_STATUS_COLORS,
  PAYMENT_CATEGORY_LABELS,
} from "@/lib/constants";

interface Section {
  id: string;
  name: string;
}

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function AttendanceReport() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [fetching, setFetching] = useState(false);
  const [report, setReport] = useState<{
    summary: { totalSessions: number; present: number; late: number; absent: number; excused: number; attendanceRate: number };
    memberSummary: { name: string; present: number; late: number; absent: number; excused: number; total: number }[];
  } | null>(null);

  const fetchReport = useCallback(async () => {
    setFetching(true);
    try {
      const params = new URLSearchParams({ type: "attendance" });
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const res = await fetch(`/api/reports?${params}`);
      const json = await res.json();
      setReport(json);
    } catch { /* ignore */ } finally {
      setFetching(false);
    }
  }, [dateFrom, dateTo]);

  const exportData = report?.memberSummary.map((m) => ({
    name: m.name,
    present: m.present,
    late: m.late,
    absent: m.absent,
    excused: m.excused,
    total: m.total,
    rate: m.total > 0 ? `${Math.round(((m.present + m.late) / m.total) * 100)}%` : "0%",
  })) || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Label>From</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10" />
        </div>
        <div className="flex-1">
          <Label>To</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10" />
        </div>
        <div className="flex items-end">
          <Button onClick={fetchReport} disabled={fetching} className="h-10">
            {fetching ? "Loading..." : "Generate"}
          </Button>
        </div>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{report.summary.present}</div>
              <div className="text-xs text-gray-500">Present</div>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{report.summary.late}</div>
              <div className="text-xs text-gray-500">Late</div>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{report.summary.absent}</div>
              <div className="text-xs text-gray-500">Absent</div>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{report.summary.attendanceRate}%</div>
              <div className="text-xs text-gray-500">Rate</div>
            </CardContent></Card>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportCSV(exportData, "attendance-report")}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>

          <div className="space-y-2">
            {report.memberSummary.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border text-sm">
                <div>
                  <span className="font-medium">{m.name}</span>
                  <div className="text-xs text-gray-500">
                    P:{m.present} L:{m.late} A:{m.absent} E:{m.excused}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{m.total > 0 ? Math.round(((m.present + m.late) / m.total) * 100) : 0}%</div>
                  <div className="text-xs text-gray-500">{m.total} sessions</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PenaltyReport() {
  const [fetching, setFetching] = useState(false);
  const [report, setReport] = useState<{ data: Record<string, unknown>[]; summary: Record<string, unknown> } | null>(null);

  const fetchReport = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/reports?type=penalties");
      const json = await res.json();
      setReport(json);
    } catch { /* ignore */ } finally {
      setFetching(false);
    }
  }, []);

  return (
    <div className="space-y-4">
      <Button onClick={fetchReport} disabled={fetching}>
        {fetching ? "Loading..." : "Generate Report"}
      </Button>

      {report && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card><CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-red-600">K{String(report.summary.totalOutstanding ?? 0)}</div>
              <div className="text-xs text-gray-500">Outstanding</div>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">K{String(report.summary.totalPaid ?? 0)}</div>
              <div className="text-xs text-gray-500">Collected</div>
            </CardContent></Card>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportCSV(report.data, "penalty-report")}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>

          <div className="space-y-2">
            {report.data.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border text-sm">
                <div>
                  <span className="font-medium">{String(r.memberName)}</span>
                  <div className="text-xs text-gray-500">
                    {PENALTY_TYPE_LABELS[String(r.type)] || String(r.type)} - K{String(r.amount)}
                  </div>
                </div>
                <Badge className={PENALTY_STATUS_COLORS[String(r.status)] || ""}>
                  {PENALTY_STATUS_LABELS[String(r.status)] || String(r.status)}
                </Badge>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PaymentReport() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [fetching, setFetching] = useState(false);
  const [report, setReport] = useState<{ data: Record<string, unknown>[]; summary: Record<string, unknown> } | null>(null);

  const fetchReport = useCallback(async () => {
    setFetching(true);
    try {
      const params = new URLSearchParams({ type: "payments" });
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const res = await fetch(`/api/reports?${params}`);
      const json = await res.json();
      setReport(json);
    } catch { /* ignore */ } finally {
      setFetching(false);
    }
  }, [dateFrom, dateTo]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Label>From</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10" />
        </div>
        <div className="flex-1">
          <Label>To</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10" />
        </div>
        <div className="flex items-end">
          <Button onClick={fetchReport} disabled={fetching} className="h-10">
            {fetching ? "Loading..." : "Generate"}
          </Button>
        </div>
      </div>

      {report && (
        <>
          <Card><CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-600">K{String(report.summary.totalCollected ?? 0)}</div>
            <div className="text-xs text-gray-500">Total Collected</div>
          </CardContent></Card>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportCSV(report.data, "payment-report")}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>

          <div className="space-y-2">
            {report.data.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border text-sm">
                <div>
                  <span className="font-medium">{String(r.memberName)}</span>
                  <div className="text-xs text-gray-500">
                    {PAYMENT_CATEGORY_LABELS[String(r.category)] || String(r.category)} - {String(r.method)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">K{String(r.amountPaid)}</div>
                  <div className="text-xs text-gray-500">{r.date ? format(new Date(String(r.date)), "MMM d") : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MemberReport() {
  const { data, loading } = useApi<{
    data: { id: string; firstName: string; lastName: string; phone: string; status: string; gender: string; section: { name: string } }[];
    summary: { total: number; byStatus: { active: number; inactive: number } };
  }>("/api/reports?type=members");

  if (loading) return <Spinner className="py-8" />;

  const exportData = data?.data.map((m) => ({
    name: `${m.firstName} ${m.lastName}`,
    section: m.section?.name,
    phone: m.phone,
    gender: m.gender,
    status: m.status,
  })) || [];

  return (
    <div className="space-y-4">
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card><CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{data.summary.total}</div>
              <div className="text-xs text-gray-500">Total Members</div>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{data.summary.byStatus?.active ?? 0}</div>
              <div className="text-xs text-gray-500">Active</div>
            </CardContent></Card>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportCSV(exportData, "member-report")}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>

          <div className="space-y-2">
            {data.data.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-white rounded-lg border text-sm">
                <div>
                  <span className="font-medium">{r.firstName} {r.lastName}</span>
                  <span className="text-gray-500 ml-2 text-xs">{r.section?.name}</span>
                </div>
                <span className="text-xs text-gray-500">{r.phone}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Generate and export reports" />

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-10">
          <TabsTrigger value="members" className="text-xs sm:text-sm">Members</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs sm:text-sm">Attend.</TabsTrigger>
          <TabsTrigger value="penalties" className="text-xs sm:text-sm">Penalties</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs sm:text-sm">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="members"><MemberReport /></TabsContent>
        <TabsContent value="attendance"><AttendanceReport /></TabsContent>
        <TabsContent value="penalties"><PenaltyReport /></TabsContent>
        <TabsContent value="payments"><PaymentReport /></TabsContent>
      </Tabs>
    </div>
  );
}
