"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/loading";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PAYMENT_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  PENALTY_TYPE_LABELS,
  PENALTY_STATUS_LABELS,
} from "@/lib/constants";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
}

interface MembersResponse {
  members: Member[];
}

interface Penalty {
  id: string;
  type: string;
  amount: number;
  balance: number;
  status: string;
  reason: string | null;
}

interface PenaltiesResponse {
  penalties: Penalty[];
}

export default function NewPaymentPage() {
  const router = useRouter();
  const { data: membersData } = useApi<MembersResponse>("/api/members?limit=100");

  const [form, setForm] = useState({
    memberId: "",
    category: "PENALTY_PAYMENT",
    amount: "",
    method: "CASH",
    reference: "",
    notes: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  const [selectedPenaltyIds, setSelectedPenaltyIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch penalties when member is selected and category is penalty payment
  const { data: penaltiesData } = useApi<PenaltiesResponse>(
    form.memberId && form.category === "PENALTY_PAYMENT"
      ? `/api/penalties?memberId=${form.memberId}&status=UNPAID,PARTIALLY_PAID`
      : null,
    [form.memberId, form.category]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePenalty = (penaltyId: string) => {
    setSelectedPenaltyIds((prev) =>
      prev.includes(penaltyId)
        ? prev.filter((id) => id !== penaltyId)
        : [...prev, penaltyId]
    );
  };

  // Calculate amount due from selected penalties
  useEffect(() => {
    if (form.category === "PENALTY_PAYMENT" && penaltiesData?.penalties) {
      const total = penaltiesData.penalties
        .filter((p) => selectedPenaltyIds.includes(p.id))
        .reduce((sum, p) => sum + p.balance, 0);
      if (total > 0) {
        setForm((prev) => ({ ...prev, amount: total.toFixed(2) }));
      }
    }
  }, [selectedPenaltyIds, penaltiesData, form.category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          reference: form.reference || undefined,
          notes: form.notes || undefined,
          penaltyIds: selectedPenaltyIds.length > 0 ? selectedPenaltyIds : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to record payment" }));
        throw new Error(data.error || "Failed to record payment");
      }

      router.push("/payments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Record Payment" backHref="/payments" />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="memberId">Member *</Label>
                <Select
                  id="memberId"
                  name="memberId"
                  value={form.memberId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select member</option>
                  {membersData?.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={(e) => {
                    handleChange(e);
                    setSelectedPenaltyIds([]);
                  }}
                  required
                >
                  {Object.entries(PAYMENT_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method *</Label>
                <Select
                  id="method"
                  name="method"
                  value={form.method}
                  onChange={handleChange}
                  required
                >
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (ZMW) *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  name="paymentDate"
                  type="date"
                  value={form.paymentDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  name="reference"
                  value={form.reference}
                  onChange={handleChange}
                  placeholder="Transaction reference"
                />
              </div>
            </div>

            {/* Penalty Selection */}
            {form.category === "PENALTY_PAYMENT" &&
              form.memberId &&
              penaltiesData?.penalties &&
              penaltiesData.penalties.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Penalties to Pay</Label>
                  <div className="space-y-2 border border-gray-200 rounded-lg p-3">
                    {penaltiesData.penalties.map((penalty) => (
                      <label
                        key={penalty.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedPenaltyIds.includes(penalty.id)}
                            onCheckedChange={() => togglePenalty(penalty.id)}
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {PENALTY_TYPE_LABELS[penalty.type] || penalty.type}
                            </p>
                            {penalty.reason && (
                              <p className="text-xs text-gray-500">{penalty.reason}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-red-600">
                          ZMW {penalty.balance.toFixed(2)}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            {form.category === "PENALTY_PAYMENT" &&
              form.memberId &&
              penaltiesData?.penalties?.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  This member has no unpaid penalties.
                </p>
              )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? <Spinner className="mr-2" /> : null}
                {submitting ? "Recording..." : "Record Payment"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
