export const EVENT_TYPE_LABELS: Record<string, string> = {
  WEEKLY_REHEARSAL: "Weekly Rehearsal",
  SUNDAY_SERVICE: "Sunday Service",
  MIDWEEK_PRACTICE: "Midweek Practice",
  WEDDING_MINISTRATION: "Wedding Ministration",
  FUNERAL_MINISTRATION: "Funeral Ministration",
  CONFERENCE_CRUSADE: "Conference/Crusade",
  SPECIAL_EVENT: "Special Event",
  SECTIONAL_REHEARSAL: "Sectional Rehearsal",
};

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  PRESENT: "Present",
  LATE: "Late",
  ABSENT: "Absent",
  EXCUSED: "Excused",
};

export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-800",
  LATE: "bg-yellow-100 text-yellow-800",
  ABSENT: "bg-red-100 text-red-800",
  EXCUSED: "bg-blue-100 text-blue-800",
};

export const MEMBER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
  TRANSFERRED: "Transferred",
  ARCHIVED: "Archived",
};

export const MEMBER_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  SUSPENDED: "bg-red-100 text-red-800",
  TRANSFERRED: "bg-blue-100 text-blue-800",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  CHOIR_DIRECTOR: "Choir Director",
  SECRETARY: "Secretary",
  TREASURER: "Treasurer",
  SECTION_LEADER: "Section Leader",
  MEMBER: "Member",
};

export const PENALTY_TYPE_LABELS: Record<string, string> = {
  LATE_COMING: "Late Coming",
  ABSENCE: "Absence",
  MISSED_ASSIGNMENT: "Missed Assignment",
  UNIFORM_FINE: "Uniform Fine",
  DISCIPLINARY: "Disciplinary",
  CUSTOM: "Custom",
};

export const PENALTY_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  WAIVED: "Waived",
};

export const PENALTY_STATUS_COLORS: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-800",
  PARTIALLY_PAID: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  WAIVED: "bg-gray-100 text-gray-500",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile Money",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

export const PAYMENT_CATEGORY_LABELS: Record<string, string> = {
  PENALTY_PAYMENT: "Penalty Payment",
  MEMBERSHIP_FEE: "Membership Fee",
  UNIFORM_CONTRIBUTION: "Uniform Contribution",
  WELFARE_CONTRIBUTION: "Welfare Contribution",
  EVENT_CONTRIBUTION: "Event Contribution",
  OTHER: "Other",
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  UPCOMING: "Upcoming",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const EVENT_STATUS_COLORS: Record<string, string> = {
  UPCOMING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};
