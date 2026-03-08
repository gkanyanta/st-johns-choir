"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks";
import { PageLoading } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Mail, MessageSquare, Clock, Send, CheckCircle, XCircle } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  RESPONDED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  RESPONDED: "Responded",
  CLOSED: "Closed",
};

export default function InquiriesPage() {
  const { data, loading, refetch } = useApi<{
    inquiries: Inquiry[];
    pagination: { total: number; page: number; totalPages: number };
  }>("/api/inquiries");

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);

  const handleRespond = async (status: string) => {
    if (!selectedInquiry) return;
    setResponding(true);
    try {
      await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, response: responseText || undefined }),
      });
      setSelectedInquiry(null);
      setResponseText("");
      refetch();
    } catch {
      alert("Failed to update inquiry");
    } finally {
      setResponding(false);
    }
  };

  if (loading) return <PageLoading />;

  const inquiries = data?.inquiries || [];

  return (
    <div className="space-y-4">
      <PageHeader title="Inquiries" description="Manage public inquiries and messages" />

      {inquiries.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No inquiries"
          description="Public inquiries will appear here"
        />
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <Card
              key={inquiry.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedInquiry(inquiry);
                setResponseText(inquiry.response || "");
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{inquiry.subject}</h3>
                      <Badge className={STATUS_COLORS[inquiry.status] || ""}>
                        {STATUS_LABELS[inquiry.status] || inquiry.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{inquiry.name} &middot; {inquiry.email}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{inquiry.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(inquiry.createdAt), "MMM d")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{selectedInquiry.name}</span>
                  <Badge className={STATUS_COLORS[selectedInquiry.status] || ""}>
                    {STATUS_LABELS[selectedInquiry.status] || selectedInquiry.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{selectedInquiry.email} {selectedInquiry.phone && `| ${selectedInquiry.phone}`}</p>
                <p className="text-xs text-gray-400">{format(new Date(selectedInquiry.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Subject: {selectedInquiry.subject}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>
              <div>
                <Label>Response / Notes</Label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Add a response or internal notes..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleRespond("CLOSED")} disabled={responding}>
              <XCircle className="h-4 w-4 mr-1" /> Close
            </Button>
            <Button onClick={() => handleRespond("RESPONDED")} disabled={responding}>
              <CheckCircle className="h-4 w-4 mr-1" /> Mark Responded
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
