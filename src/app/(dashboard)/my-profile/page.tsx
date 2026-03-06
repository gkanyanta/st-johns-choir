"use client";

import { useAuth, useApi } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  ROLE_LABELS,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
  PENALTY_STATUS_LABELS,
  PENALTY_STATUS_COLORS,
  PENALTY_TYPE_LABELS,
  PAYMENT_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  MEMBER_STATUS_LABELS,
  MEMBER_STATUS_COLORS,
  EVENT_TYPE_LABELS,
} from "@/lib/constants";
import {
  ClipboardCheck,
  AlertTriangle,
  CreditCard,
  Megaphone,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Music,
  Clock,
} from "lucide-react";

interface MemberDetail {
  id: string;
  firstName: string;
  lastName: string;
  otherNames: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  altPhone: string | null;
  email: string | null;
  residentialAddress: string | null;
  address: string | null;
  dateJoined: string | null;
  joinDate: string | null;
  status: string;
  section: { name: string };
  maritalStatus: string | null;
  occupation: string | null;
  attendanceRecords: {
    id: string;
    status: string;
    session: { date: string; eventType: string };
  }[];
  penalties: {
    id: string;
    penaltyType: string;
    type: string;
    amount: number;
    balance: number;
    status: string;
    createdAt: string;
  }[];
  payments: {
    id: string;
    category: string;
    amountPaid: number;
    amount: number;
    paymentMethod: string;
    method: string;
    paymentDate: string;
  }[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  isUrgent: boolean;
  publishDate: string;
}

export default function MyProfilePage() {
  const { user, loading: authLoading } = useAuth();

  const memberId = user?.memberId;
  const { data: member, loading: memberLoading } = useApi<MemberDetail>(
    memberId ? `/api/members/${memberId}` : null
  );

  const { data: announcementsData } = useApi<{ announcements: Announcement[] }>(
    "/api/announcements"
  );

  if (authLoading || memberLoading) return <PageLoading />;
  if (!user) return null;

  const joinDate = member?.dateJoined || member?.joinDate;
  const memberPhone = member?.phone;
  const memberEmail = member?.email;
  const memberAddress = member?.residentialAddress || member?.address;

  return (
    <div className="space-y-4">
      <PageHeader title="My Profile" />

      {/* Profile Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {member
                  ? `${member.firstName[0]}${member.lastName[0]}`
                  : user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h2 className="text-lg font-semibold">
                  {member ? `${member.firstName} ${member.lastName}` : user.username}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline">{ROLE_LABELS[user.role] || user.role}</Badge>
                  {member && (
                    <>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        {member.section.name}
                      </Badge>
                      <Badge className={MEMBER_STATUS_COLORS[member.status] || ""}>
                        {MEMBER_STATUS_LABELS[member.status] || member.status}
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {member && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {memberPhone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {memberPhone}
                      </div>
                    )}
                    {memberEmail && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {memberEmail}
                      </div>
                    )}
                    {memberAddress && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {memberAddress}
                      </div>
                    )}
                    {joinDate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        Joined {format(new Date(joinDate), "MMM d, yyyy")}
                      </div>
                    )}
                    {member.dateOfBirth && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        Born {format(new Date(member.dateOfBirth), "MMM d, yyyy")}
                      </div>
                    )}
                    {member.occupation && (
                      <div className="flex items-center gap-2 text-gray-600">
                        Occupation: {member.occupation}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      {member && (
        <Tabs defaultValue="attendance">
          <TabsList className="w-full overflow-x-auto justify-start">
            <TabsTrigger value="attendance">
              <ClipboardCheck className="h-3.5 w-3.5 mr-1 hidden sm:block" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="penalties">
              <AlertTriangle className="h-3.5 w-3.5 mr-1 hidden sm:block" />
              Penalties
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-3.5 w-3.5 mr-1 hidden sm:block" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="announcements">
              <Megaphone className="h-3.5 w-3.5 mr-1 hidden sm:block" />
              News
            </TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Attendance History</CardTitle>
              </CardHeader>
              <CardContent>
                {member.attendanceRecords.length === 0 ? (
                  <EmptyState icon={ClipboardCheck} title="No attendance records" />
                ) : (
                  <div className="space-y-2">
                    {member.attendanceRecords.slice(0, 30).map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(r.session.date), "MMM d, yyyy")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {EVENT_TYPE_LABELS[r.session.eventType] ||
                              r.session.eventType.replace(/_/g, " ")}
                          </p>
                        </div>
                        <Badge className={ATTENDANCE_STATUS_COLORS[r.status] || ""}>
                          {ATTENDANCE_STATUS_LABELS[r.status] || r.status}
                        </Badge>
                      </div>
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
                    description="You have a clean record!"
                  />
                ) : (
                  <div className="space-y-2">
                    {member.penalties.map((p) => {
                      const penaltyType = p.penaltyType || p.type;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {PENALTY_TYPE_LABELS[penaltyType] || penaltyType}
                            </p>
                            <p className="text-xs text-gray-500">
                              Amount: ZMW {Number(p.amount).toFixed(2)} | Balance: ZMW{" "}
                              {Number(p.balance).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(p.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge className={PENALTY_STATUS_COLORS[p.status] || ""}>
                            {PENALTY_STATUS_LABELS[p.status] || p.status}
                          </Badge>
                        </div>
                      );
                    })}
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
                  <EmptyState icon={CreditCard} title="No payments" />
                ) : (
                  <div className="space-y-2">
                    {member.payments.map((p) => {
                      const paymentAmount = p.amountPaid || p.amount;
                      const paymentMethod = p.paymentMethod || p.method;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {PAYMENT_CATEGORY_LABELS[p.category] || p.category}
                            </p>
                            <p className="text-xs text-gray-500">
                              {PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod} -{" "}
                              {format(new Date(p.paymentDate), "MMM d, yyyy")}
                            </p>
                          </div>
                          <p className="font-medium text-green-600">
                            ZMW {Number(paymentAmount).toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                {!announcementsData?.announcements?.length ? (
                  <EmptyState icon={Megaphone} title="No announcements" />
                ) : (
                  <div className="space-y-2">
                    {announcementsData.announcements.map((a) => (
                      <div
                        key={a.id}
                        className={`p-3 rounded-lg border ${
                          a.isUrgent ? "border-red-200 bg-red-50/30" : "border-gray-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm">{a.title}</h4>
                          {a.isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{a.content}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(a.publishDate), "MMM d, yyyy")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!member && !memberId && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Your account is not linked to a member profile. Contact an administrator to
              link your account.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
