"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/loading";
import { MEMBER_STATUS_LABELS } from "@/lib/constants";

interface MemberDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  residentialAddress: string | null;
  status: string;
  dateJoined: string | null;
  notes: string | null;
  sectionId: string | null;
  section: { id: string; name: string } | null;
}

interface MemberResponse {
  member: MemberDetail;
}

interface SectionsResponse {
  sections: { id: string; name: string }[];
}

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: memberData, loading: memberLoading } = useApi<MemberResponse>(`/api/members/${id}`);
  const member = memberData?.member ?? null;
  const { data: sectionsData } = useApi<SectionsResponse>("/api/sections");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    residentialAddress: "",
    sectionId: "",
    status: "ACTIVE",
    dateJoined: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setForm({
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        email: member.email || "",
        phone: member.phone || "",
        dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split("T")[0] : "",
        gender: member.gender || "",
        residentialAddress: member.residentialAddress || "",
        sectionId: member.sectionId || member.section?.id || "",
        status: member.status || "ACTIVE",
        dateJoined: member.dateJoined ? member.dateJoined.split("T")[0] : "",
        notes: member.notes || "",
      });
    }
  }, [member]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dateOfBirth: form.dateOfBirth || undefined,
          dateJoined: form.dateJoined || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          residentialAddress: form.residentialAddress || undefined,
          notes: form.notes || undefined,
          gender: form.gender || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to update member" }));
        throw new Error(data.error || "Failed to update member");
      }

      router.push(`/members/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (memberLoading) return <PageLoading />;

  return (
    <div className="space-y-4">
      <PageHeader title="Edit Member" backHref={`/members/${id}`} />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select id="gender" name="gender" value={form.gender} onChange={handleChange} required>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sectionId">Section *</Label>
                <Select
                  id="sectionId"
                  name="sectionId"
                  value={form.sectionId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select section</option>
                  {sectionsData?.sections?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" value={form.status} onChange={handleChange}>
                  {Object.entries(MEMBER_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateJoined">Join Date</Label>
                <Input
                  id="dateJoined"
                  name="dateJoined"
                  type="date"
                  value={form.dateJoined}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="residentialAddress">Address</Label>
                <Input
                  id="residentialAddress"
                  name="residentialAddress"
                  value={form.residentialAddress}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? <Spinner className="mr-2" /> : null}
                {submitting ? "Saving..." : "Save Changes"}
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
