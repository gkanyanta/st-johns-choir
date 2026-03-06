"use client";

import { useParams } from "next/navigation";
import { useApi } from "@/lib/hooks";
import { PageLoading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Music,
  ClipboardList,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import {
  MEMBER_STATUS_LABELS,
  MEMBER_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
  PENALTY_STATUS_LABELS,
  PENALTY_STATUS_COLORS,
  PENALTY_TYPE_LABELS,
  EVENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_CATEGORY_LABELS,
} from "@/lib/constants";

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
  section: { id: string; name: string } | null;
  attendanceRecords: {
    id: string;
    status: string;
    checkInTime: string | null;
    minutesLate: number | null;
    session: {
      id: string;
      date: string;
      eventType: string;
    };
  }[];
  penalties: {
    id: string;
    penaltyType: string;
    amount: string | number;
    amountPaid: string | number;
    balance: string | number;
    status: string;
    reason: string | null;
    createdAt: string;
  }[];
  payments: {
    id: string;
    amountPaid: string | number;
    category: string;
    paymentMethod: string;
    reference: string | null;
    notes: string | null;
    paymentDate: string;
  }[];
}

interface MemberResponse {
  member: MemberDetail;
}

export default function MemberProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { data, loading, error } = useApi<MemberResponse>(`/api/members/${id}`);
  const member = data?.member ?? null;

  if (loading) return <PageLoading />;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!member) return <div className="p-4 text-gray-500">Member not found</div>;

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${member.firstName} ${member.lastName}`}
        backHref="/members"
        actionLabel="Edit"
        actionHref={`/members/${id}/edit`}
        actionIcon={Edit}
      />

      {/* Profile Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {member.firstName[0]}
                {member.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {member.firstName} {member.lastName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {member.section && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Music className="h-3 w-3" />
                      {member.section.name}
                    </Badge>
                  )}
                  <Badge className={MEMBER_STATUS_COLORS[member.status] || ""}>
                    {MEMBER_STATUS_LABELS[member.status] || member.status}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {member.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {member.email}
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {member.phone}
                  </div>
                )}
                {member.residentialAddress && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {member.residentialAddress}
                  </div>
                )}
                {member.dateJoined && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Joined {format(new Date(member.dateJoined), "MMM d, yyyy")}
                  </div>
                )}
                {member.dateOfBirth && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Born {format(new Date(member.dateOfBirth), "MMM d, yyyy")}
                  </div>
                )}
                {member.gender && (
                  <div className="flex items-center gap-2 text-gray-600">
                    Gender: {member.gender}
                  </div>
                )}
              </div>
              {member.notes && (
                <>
                  <Separator />
                  <p className="text-sm text-gray-500">{member.notes}</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="attendance">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="attendance">
            <ClipboardList className="h-4 w-4 mr-1" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="penalties">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Penalties
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-1" />
            Payments
          </TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {member.attendanceRecords.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="No attendance records"
                  description="Attendance records will appear here once the member is marked in a session"
                />
              ) : (
                <div className="space-y-2">
                  {member.attendanceRecords.map((record) => (
                    <Link
                      key={record.id}
                      href={`/attendance/${record.session.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {EVENT_TYPE_LABELS[record.session.eventType] || record.session.eventType}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(record.session.date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.minutesLate != null && record.minutesLate > 0 && (
                          <span className="text-xs text-gray-400">{record.minutesLate} min late</span>
                        )}
                        <Badge className={ATTENDANCE_STATUS_COLORS[record.status] || ""}>
                          {ATTENDANCE_STATUS_LABELS[record.status] || record.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Penalties Tab */}
        <TabsContent value="penalties">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Penalties</CardTitle>
            </CardHeader>
            <CardContent>
              {member.penalties.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="No penalties"
                  description="This member has no penalties"
                />
              ) : (
                <div className="space-y-2">
                  {member.penalties.map((penalty) => (
                    <div
                      key={penalty.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {PENALTY_TYPE_LABELS[penalty.penaltyType] || penalty.penaltyType}
                        </p>
                        {penalty.reason && (
                          <p className="text-xs text-gray-500">{penalty.reason}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {format(new Date(penalty.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">ZMW {Number(penalty.amount).toFixed(2)}</p>
                        {Number(penalty.balance) > 0 && (
                          <p className="text-xs text-red-500">Balance: ZMW {Number(penalty.balance).toFixed(2)}</p>
                        )}
                        <Badge className={PENALTY_STATUS_COLORS[penalty.status] || ""}>
                          {PENALTY_STATUS_LABELS[penalty.status] || penalty.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {member.payments.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No payments"
                  description="Payment records will appear here"
                />
              ) : (
                <div className="space-y-2">
                  {member.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {PAYMENT_CATEGORY_LABELS[payment.category] || payment.category}
                        </p>
                        <p className="text-xs text-gray-500">
                          {PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                          {payment.reference && ` - ${payment.reference}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(payment.paymentDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-green-700">
                        ZMW {Number(payment.amountPaid).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
