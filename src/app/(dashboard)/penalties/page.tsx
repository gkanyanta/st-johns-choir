"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks";
import { PageLoading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { AlertTriangle, Search } from "lucide-react";
import {
  PENALTY_TYPE_LABELS,
  PENALTY_STATUS_LABELS,
  PENALTY_STATUS_COLORS,
} from "@/lib/constants";

interface Penalty {
  id: string;
  penaltyType: string;
  amount: string | number;
  amountPaid: string | number;
  balance: string | number;
  status: string;
  reason: string | null;
  createdAt: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface PenaltiesResponse {
  penalties: Penalty[];
  pagination: { total: number };
}

export default function PenaltiesPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  const queryParams = new URLSearchParams();
  if (statusFilter) queryParams.set("status", statusFilter);
  if (typeFilter) queryParams.set("penaltyType", typeFilter);
  if (search) queryParams.set("search", search);

  const { data, loading, error } = useApi<PenaltiesResponse>(
    `/api/penalties?${queryParams.toString()}`,
    [statusFilter, typeFilter, search]
  );

  const totalAmount = data?.penalties.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const totalBalance = data?.penalties.reduce((sum, p) => sum + Number(p.balance), 0) ?? 0;
  const totalPaid = data?.penalties.reduce((sum, p) => sum + Number(p.amountPaid), 0) ?? 0;

  return (
    <div className="space-y-4">
      <PageHeader title="Penalties" description={`${data?.pagination?.total ?? 0} total penalties`} />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-bold">ZMW {totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-gray-500">Paid</p>
            <p className="text-sm font-bold text-green-600">ZMW {totalPaid.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-gray-500">Outstanding</p>
            <p className="text-sm font-bold text-red-600">ZMW {totalBalance.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {Object.entries(PENALTY_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          {Object.entries(PENALTY_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </div>

      {loading && <PageLoading />}
      {error && <div className="p-4 text-red-600 text-sm">Error: {error}</div>}

      {!loading && !error && data && (
        <>
          {data.penalties.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No penalties found"
              description="No penalties match your current filters"
            />
          ) : (
            <div className="space-y-3">
              {data.penalties.map((penalty) => (
                <Card key={penalty.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          {penalty.member.firstName} {penalty.member.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {PENALTY_TYPE_LABELS[penalty.penaltyType] || penalty.penaltyType}
                        </p>
                        {penalty.reason && (
                          <p className="text-xs text-gray-400">{penalty.reason}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {format(new Date(penalty.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-semibold">ZMW {Number(penalty.amount).toFixed(2)}</p>
                        {Number(penalty.amountPaid) > 0 && (
                          <p className="text-xs text-green-600">
                            Paid: ZMW {Number(penalty.amountPaid).toFixed(2)}
                          </p>
                        )}
                        {Number(penalty.balance) > 0 && (
                          <p className="text-xs text-red-600">
                            Balance: ZMW {Number(penalty.balance).toFixed(2)}
                          </p>
                        )}
                        <Badge className={PENALTY_STATUS_COLORS[penalty.status] || ""}>
                          {PENALTY_STATUS_LABELS[penalty.status] || penalty.status}
                        </Badge>
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
