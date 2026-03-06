import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const memberSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  otherNames: z.string().max(100).optional().nullable(),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().optional().nullable(),
  phone: z.string().min(1, "Phone number is required").max(20),
  altPhone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  residentialAddress: z.string().max(500).optional().nullable(),
  nrcIdNumber: z.string().max(50).optional().nullable(),
  emergencyContactName: z.string().max(200).optional().nullable(),
  emergencyContactPhone: z.string().max(20).optional().nullable(),
  dateJoined: z.string().optional().nullable(),
  sectionId: z.string().min(1, "Section is required"),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "OTHER"]).optional().nullable(),
  occupation: z.string().max(200).optional().nullable(),
  baptismStatus: z.string().max(200).optional().nullable(),
  churchName: z.string().max(200).optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "TRANSFERRED", "ARCHIVED"]).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const attendanceSessionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  eventType: z.enum([
    "WEEKLY_REHEARSAL", "SUNDAY_SERVICE", "MIDWEEK_PRACTICE",
    "WEDDING_MINISTRATION", "FUNERAL_MINISTRATION", "CONFERENCE_CRUSADE",
    "SPECIAL_EVENT", "SECTIONAL_REHEARSAL",
  ]),
  venue: z.string().max(200).optional().nullable(),
  startTime: z.string().optional().nullable(),
  reportingTime: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  sectionIds: z.array(z.string()).optional(),
  eventId: z.string().optional().nullable(),
});

export const attendanceRecordSchema = z.object({
  memberId: z.string().min(1),
  status: z.enum(["PRESENT", "LATE", "ABSENT", "EXCUSED"]),
  checkInTime: z.string().optional().nullable(),
  minutesLate: z.number().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const penaltyRuleSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  penaltyType: z.enum(["LATE_COMING", "ABSENCE", "MISSED_ASSIGNMENT", "UNIFORM_FINE", "DISCIPLINARY", "CUSTOM"]),
  amount: z.number().positive("Amount must be positive"),
  gracePeriodMin: z.number().min(0).default(0),
  applyAfterGrace: z.boolean().default(true),
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional().nullable(),
});

export const penaltySchema = z.object({
  memberId: z.string().min(1),
  penaltyType: z.enum(["LATE_COMING", "ABSENCE", "MISSED_ASSIGNMENT", "UNIFORM_FINE", "DISCIPLINARY", "CUSTOM"]),
  amount: z.number().positive(),
  reason: z.string().max(500).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const paymentSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  category: z.enum(["PENALTY_PAYMENT", "MEMBERSHIP_FEE", "UNIFORM_CONTRIBUTION", "WELFARE_CONTRIBUTION", "EVENT_CONTRIBUTION", "OTHER"]),
  penaltyId: z.string().optional().nullable(),
  amountDue: z.number().min(0),
  amountPaid: z.number().positive("Amount must be positive"),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "OTHER"]),
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  eventType: z.enum([
    "WEEKLY_REHEARSAL", "SUNDAY_SERVICE", "MIDWEEK_PRACTICE",
    "WEDDING_MINISTRATION", "FUNERAL_MINISTRATION", "CONFERENCE_CRUSADE",
    "SPECIAL_EVENT", "SECTIONAL_REHEARSAL",
  ]),
  date: z.string().min(1, "Date is required"),
  endDate: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
  venue: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  requiredSections: z.array(z.string()).optional(),
  status: z.enum(["UPCOMING", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(5000),
  audience: z.string().default("ALL"),
  sectionId: z.string().optional().nullable(),
  role: z.enum(["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY", "TREASURER", "SECTION_LEADER", "MEMBER"]).optional().nullable(),
  publishDate: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
  isUrgent: z.boolean().default(false),
});

export const userSchema = z.object({
  email: z.string().email("Valid email is required"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY", "TREASURER", "SECTION_LEADER", "MEMBER"]),
  memberId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});
