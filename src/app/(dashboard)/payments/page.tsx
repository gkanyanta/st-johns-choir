"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks";
import { PageLoading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CreditCard } from "lucide-react";
import {
  PAYMENT_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants";

interface Payment {
  id: string;
  amount: number;
  category: string;
  method: string;
  reference: string | null;
  notes: string | null;
  paymentDate: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface PaymentsResponse {
  payments: Payment[];
  total: number;
}

export default function PaymentsPage() {
  const [category, setCategory] = useState("");
  const [method, setMethod] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryParams = new URLSearchParams();
  if (category) queryParams.set("category", category);
  if (method) queryParams.set("method", method);
  if (dateFrom) queryParams.set("dateFrom", dateFrom);
  if (dateTo) queryParams.set("dateTo", dateTo);

  const { data, loading, error } = useApi<PaymentsResponse>(
    `/api/payments?${queryParams.toString()}`,
    [category, method, dateFrom, dateTo]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Payments"
        description={`${data?.total ?? 0} total payments`}
        actionLabel="Record Payment"
        actionHref="/payments/new"
      />

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {Object.entries(PAYMENT_CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
        <Select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="">All Methods</option>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
        <div>
          <Label className="sr-only">From</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From"
          />
        </div>
        <div>
          <Label className="sr-only">To</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To"
          />
        </div>
      </div>

      {loading && <PageLoading />}
      {error && <div className="p-4 text-red-600 text-sm">Error: {error}</div>}

      {!loading && !error && data && (
        <>
          {data.payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments found"
              description="Record your first payment to get started"
              actionLabel="Record Payment"
              actionHref="/payments/new"
            />
          ) : (
            <div className="space-y-3">
              {data.payments.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          {payment.member.firstName} {payment.member.lastName}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {PAYMENT_CATEGORY_LABELS[payment.category] || payment.category}
                          </Badge>
                          <Badge variant="outline">
                            {PAYMENT_METHOD_LABELS[payment.method] || payment.method}
                          </Badge>
                        </div>
                        {payment.reference && (
                          <p className="text-xs text-gray-400">Ref: {payment.reference}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {format(new Date(payment.paymentDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-green-700">
                        ZMW {payment.amount.toFixed(2)}
                      </p>
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
