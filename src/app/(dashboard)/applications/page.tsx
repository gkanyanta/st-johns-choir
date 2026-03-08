"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks";
import { PageLoading } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { UserPlus, Clock, CheckCircle, XCircle, Eye } from "lucide-react";

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string | null;
  dateOfBirth: string | null;
  residentialAddress: string | null;
  preferredSection: string | null;
  musicalExperience: string | null;
  message: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

export default function ApplicationsPage() {
  const { data, loading, refetch } = useApi<{
    applications: Application[];
    pagination: { total: number; page: number; totalPages: number };
  }>("/api/applications");

  const [selected, setSelected] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (status: string) => {
    if (!selected) return;
    setUpdating(true);
    try {
      await fetch(`/api/applications/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes || undefined }),
      });
      setSelected(null);
      setNotes("");
      refetch();
    } catch {
      alert("Failed to update application");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <PageLoading />;

  const applications = data?.applications || [];

  return (
    <div className="space-y-4">
      <PageHeader title="Applications" description="Manage membership applications" />

      {applications.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No applications"
          description="Membership applications from the public website will appear here"
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card
              key={app.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelected(app);
                setNotes(app.adminNotes || "");
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {app.firstName} {app.lastName}
                      </h3>
                      <Badge className={STATUS_COLORS[app.status] || ""}>
                        {STATUS_LABELS[app.status] || app.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {app.email} &middot; {app.phone}
                    </p>
                    {app.preferredSection && (
                      <p className="text-xs text-gray-400 mt-0.5">Section: {app.preferredSection}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(app.createdAt), "MMM d")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{selected.firstName} {selected.lastName}</h3>
                  <p className="text-sm text-gray-500">{selected.email} | {selected.phone}</p>
                </div>
                <Badge className={STATUS_COLORS[selected.status] || ""}>
                  {STATUS_LABELS[selected.status] || selected.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {selected.gender && <div><span className="text-gray-500">Gender:</span> {selected.gender}</div>}
                {selected.dateOfBirth && <div><span className="text-gray-500">DOB:</span> {format(new Date(selected.dateOfBirth), "MMM d, yyyy")}</div>}
                {selected.residentialAddress && <div className="col-span-2"><span className="text-gray-500">Address:</span> {selected.residentialAddress}</div>}
                {selected.preferredSection && <div><span className="text-gray-500">Section:</span> {selected.preferredSection}</div>}
              </div>

              {selected.musicalExperience && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Musical Experience</p>
                  <p className="text-sm text-gray-700">{selected.musicalExperience}</p>
                </div>
              )}

              {selected.message && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Additional Message</p>
                  <p className="text-sm text-gray-700">{selected.message}</p>
                </div>
              )}

              <div>
                <Label>Admin Notes</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Internal notes..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleUpdate("REJECTED")} disabled={updating} className="text-red-600">
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button variant="outline" onClick={() => handleUpdate("REVIEWED")} disabled={updating}>
              <Eye className="h-4 w-4 mr-1" /> Mark Reviewed
            </Button>
            <Button onClick={() => handleUpdate("ACCEPTED")} disabled={updating}>
              <CheckCircle className="h-4 w-4 mr-1" /> Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
