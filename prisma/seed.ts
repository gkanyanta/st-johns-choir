import { PrismaClient, Role, Gender, MaritalStatus, EventType, AttendanceStatus, PenaltyType, PaymentMethod, PaymentCategory, MemberStatus, PenaltyStatus, EventStatus } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.penalty.deleteMany();
  await prisma.penaltyRule.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  await prisma.member.deleteMany();
  await prisma.section.deleteMany();
  await prisma.setting.deleteMany();

  // Create sections
  const sections = await Promise.all([
    prisma.section.create({ data: { name: "Soprano", sortOrder: 1 } }),
    prisma.section.create({ data: { name: "Alto", sortOrder: 2 } }),
    prisma.section.create({ data: { name: "Tenor", sortOrder: 3 } }),
    prisma.section.create({ data: { name: "Bass", sortOrder: 4 } }),
  ]);
  const [soprano, alto, tenor, bass] = sections;
  console.log("Created sections");

  // Create settings
  await prisma.setting.createMany({
    data: [
      { key: "choir_name", value: "St. John's Cathedral Choir" },
      { key: "church_name", value: "St. John's Anglican Cathedral" },
      { key: "currency", value: "ZMW" },
      { key: "currency_symbol", value: "K" },
      { key: "nrc_mandatory", value: "false" },
      { key: "photo_mandatory", value: "false" },
      { key: "default_grace_period", value: "15" },
    ],
  });
  console.log("Created settings");

  // Create penalty rules
  const lateRule = await prisma.penaltyRule.create({
    data: {
      name: "Late Coming - Rehearsal",
      penaltyType: PenaltyType.LATE_COMING,
      amount: 20.00,
      gracePeriodMin: 15,
      applyAfterGrace: true,
      description: "Penalty for arriving late to rehearsal beyond the 15-minute grace period",
    },
  });
  const absenceRule = await prisma.penaltyRule.create({
    data: {
      name: "Unexcused Absence",
      penaltyType: PenaltyType.ABSENCE,
      amount: 50.00,
      gracePeriodMin: 0,
      description: "Penalty for unexcused absence from rehearsal or service",
    },
  });
  await prisma.penaltyRule.create({
    data: {
      name: "Uniform Fine",
      penaltyType: PenaltyType.UNIFORM_FINE,
      amount: 30.00,
      gracePeriodMin: 0,
      description: "Fine for not wearing proper choir uniform",
    },
  });
  console.log("Created penalty rules");

  // Create members
  const membersData = [
    { firstName: "Grace", lastName: "Mwanza", gender: Gender.FEMALE, phone: "0971234567", email: "grace.mwanza@email.com", sectionId: soprano.id, maritalStatus: MaritalStatus.MARRIED, occupation: "Teacher", dateOfBirth: new Date("1990-05-15"), residentialAddress: "Plot 23, Kabulonga, Lusaka", emergencyContactName: "Joseph Mwanza", emergencyContactPhone: "0961234567", baptismStatus: "Baptised", churchName: "St. John's Anglican Cathedral" },
    { firstName: "Mary", lastName: "Banda", gender: Gender.FEMALE, phone: "0972345678", email: "mary.banda@email.com", sectionId: soprano.id, maritalStatus: MaritalStatus.SINGLE, occupation: "Nurse", dateOfBirth: new Date("1995-03-20"), residentialAddress: "Flat 5, Woodlands, Lusaka", emergencyContactName: "Ruth Banda", emergencyContactPhone: "0962345678" },
    { firstName: "Esther", lastName: "Phiri", gender: Gender.FEMALE, phone: "0973456789", email: "esther.phiri@email.com", sectionId: soprano.id, maritalStatus: MaritalStatus.MARRIED, occupation: "Accountant", dateOfBirth: new Date("1988-11-02") },
    { firstName: "Ruth", lastName: "Tembo", gender: Gender.FEMALE, phone: "0974567890", sectionId: soprano.id, maritalStatus: MaritalStatus.SINGLE, dateOfBirth: new Date("1998-07-10") },
    { firstName: "Priscilla", lastName: "Lungu", gender: Gender.FEMALE, phone: "0975678901", sectionId: soprano.id, dateOfBirth: new Date("1992-01-25") },
    { firstName: "Rebecca", lastName: "Mulenga", gender: Gender.FEMALE, phone: "0976234567", email: "rebecca.m@email.com", sectionId: alto.id, maritalStatus: MaritalStatus.MARRIED, occupation: "Banker", dateOfBirth: new Date("1985-09-18"), residentialAddress: "House 12, Roma, Lusaka", emergencyContactName: "Daniel Mulenga", emergencyContactPhone: "0966234567" },
    { firstName: "Catherine", lastName: "Chanda", gender: Gender.FEMALE, phone: "0977345678", sectionId: alto.id, maritalStatus: MaritalStatus.SINGLE, occupation: "Student", dateOfBirth: new Date("2000-04-12") },
    { firstName: "Joyce", lastName: "Mumba", gender: Gender.FEMALE, phone: "0978456789", sectionId: alto.id, maritalStatus: MaritalStatus.MARRIED, dateOfBirth: new Date("1991-12-30") },
    { firstName: "Charity", lastName: "Zulu", gender: Gender.FEMALE, phone: "0979567890", sectionId: alto.id, dateOfBirth: new Date("1994-06-08") },
    { firstName: "Hope", lastName: "Sakala", gender: Gender.FEMALE, phone: "0970678901", sectionId: alto.id, maritalStatus: MaritalStatus.WIDOWED, dateOfBirth: new Date("1980-02-14") },
    { firstName: "David", lastName: "Musonda", gender: Gender.MALE, phone: "0961234567", email: "david.musonda@email.com", sectionId: tenor.id, maritalStatus: MaritalStatus.MARRIED, occupation: "Engineer", dateOfBirth: new Date("1987-08-22"), residentialAddress: "Plot 45, Chelstone, Lusaka", emergencyContactName: "Sarah Musonda", emergencyContactPhone: "0971234568", baptismStatus: "Baptised", churchName: "St. John's Anglican Cathedral" },
    { firstName: "Peter", lastName: "Kapata", gender: Gender.MALE, phone: "0962345678", sectionId: tenor.id, maritalStatus: MaritalStatus.SINGLE, occupation: "IT Specialist", dateOfBirth: new Date("1993-10-05") },
    { firstName: "James", lastName: "Bwalya", gender: Gender.MALE, phone: "0963456789", email: "james.b@email.com", sectionId: tenor.id, maritalStatus: MaritalStatus.MARRIED, dateOfBirth: new Date("1989-03-17") },
    { firstName: "Samuel", lastName: "Chilufya", gender: Gender.MALE, phone: "0964567890", sectionId: tenor.id, dateOfBirth: new Date("1996-11-28") },
    { firstName: "John", lastName: "Mwale", gender: Gender.MALE, phone: "0951234567", email: "john.mwale@email.com", sectionId: bass.id, maritalStatus: MaritalStatus.MARRIED, occupation: "Lawyer", dateOfBirth: new Date("1982-06-30"), residentialAddress: "House 8, Ibex Hill, Lusaka", emergencyContactName: "Martha Mwale", emergencyContactPhone: "0951234568", baptismStatus: "Baptised" },
    { firstName: "Daniel", lastName: "Zimba", gender: Gender.MALE, phone: "0952345678", sectionId: bass.id, maritalStatus: MaritalStatus.MARRIED, occupation: "Pastor", dateOfBirth: new Date("1978-01-15") },
    { firstName: "Moses", lastName: "Nkandu", gender: Gender.MALE, phone: "0953456789", email: "moses.n@email.com", sectionId: bass.id, maritalStatus: MaritalStatus.SINGLE, dateOfBirth: new Date("1997-09-03") },
    { firstName: "Andrew", lastName: "Mutale", gender: Gender.MALE, phone: "0954567890", sectionId: bass.id, dateOfBirth: new Date("1990-04-20") },
    { firstName: "Paul", lastName: "Kabwe", gender: Gender.MALE, phone: "0955678901", sectionId: bass.id, maritalStatus: MaritalStatus.MARRIED, occupation: "Business Owner", dateOfBirth: new Date("1986-12-12") },
    { firstName: "Elizabeth", lastName: "Njovu", gender: Gender.FEMALE, phone: "0976789012", sectionId: soprano.id, status: MemberStatus.INACTIVE, dateOfBirth: new Date("1975-05-05") },
  ];

  const members = await Promise.all(
    membersData.map((m) => prisma.member.create({ data: m }))
  );
  console.log(`Created ${members.length} members`);

  // Create users
  const passwordHash = await bcrypt.hash("password123", 12);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@choir.com",
      username: "admin",
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  const directorUser = await prisma.user.create({
    data: {
      email: "john.mwale@email.com",
      username: "director",
      passwordHash,
      role: Role.CHOIR_DIRECTOR,
      memberId: members[14].id, // John Mwale
    },
  });

  await prisma.user.create({
    data: {
      email: "grace.mwanza@email.com",
      username: "secretary",
      passwordHash,
      role: Role.SECRETARY,
      memberId: members[0].id, // Grace Mwanza
    },
  });

  const treasurerUser = await prisma.user.create({
    data: {
      email: "rebecca.m@email.com",
      username: "treasurer",
      passwordHash,
      role: Role.TREASURER,
      memberId: members[5].id, // Rebecca Mulenga
    },
  });

  await prisma.user.create({
    data: {
      email: "david.musonda@email.com",
      username: "tenorleader",
      passwordHash,
      role: Role.SECTION_LEADER,
      memberId: members[10].id, // David Musonda
    },
  });

  await prisma.user.create({
    data: {
      email: "peter.k@email.com",
      username: "member1",
      passwordHash,
      role: Role.MEMBER,
      memberId: members[11].id, // Peter Kapata
    },
  });
  console.log("Created users");

  // Create events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: "Sunday Service Ministration",
        eventType: EventType.SUNDAY_SERVICE,
        date: new Date("2026-03-08"),
        time: "08:00",
        venue: "St. John's Cathedral",
        description: "Regular Sunday service choir ministration",
        status: EventStatus.UPCOMING,
      },
    }),
    prisma.event.create({
      data: {
        title: "Weekly Choir Rehearsal",
        eventType: EventType.WEEKLY_REHEARSAL,
        date: new Date("2026-03-07"),
        time: "14:00",
        venue: "Church Hall",
        description: "Regular Saturday rehearsal",
        status: EventStatus.UPCOMING,
      },
    }),
    prisma.event.create({
      data: {
        title: "Easter Concert Preparation",
        eventType: EventType.SPECIAL_EVENT,
        date: new Date("2026-03-28"),
        time: "09:00",
        venue: "Church Hall",
        description: "Special rehearsal for Easter concert pieces",
        status: EventStatus.UPCOMING,
      },
    }),
    prisma.event.create({
      data: {
        title: "Midweek Practice",
        eventType: EventType.MIDWEEK_PRACTICE,
        date: new Date("2026-03-04"),
        time: "17:30",
        venue: "Church Hall",
        description: "Wednesday evening practice session",
        status: EventStatus.COMPLETED,
      },
    }),
    prisma.event.create({
      data: {
        title: "Wedding Ministration - Lungu Family",
        eventType: EventType.WEDDING_MINISTRATION,
        date: new Date("2026-03-14"),
        time: "10:00",
        venue: "St. John's Cathedral",
        description: "Wedding ceremony choir ministration",
        status: EventStatus.UPCOMING,
      },
    }),
  ]);
  console.log("Created events");

  // Create attendance sessions with records
  const activeMembers = members.filter((m) => m.status === "ACTIVE");

  // Session 1 - Last week rehearsal
  const session1 = await prisma.attendanceSession.create({
    data: {
      date: new Date("2026-02-28"),
      eventType: EventType.WEEKLY_REHEARSAL,
      venue: "Church Hall",
      startTime: "14:00",
      reportingTime: "13:45",
      isFinalized: true,
      createdById: directorUser.id,
    },
  });

  const session1Records = activeMembers.map((m, i) => {
    let status: AttendanceStatus = AttendanceStatus.PRESENT;
    let minutesLate: number | null = null;
    let checkInTime: string | null = "13:40";
    if (i % 5 === 0) { status = AttendanceStatus.LATE; minutesLate = 25; checkInTime = "14:10"; }
    if (i % 7 === 0) { status = AttendanceStatus.ABSENT; minutesLate = null; checkInTime = null; }
    if (i === 3) { status = AttendanceStatus.EXCUSED; checkInTime = null; }
    return {
      sessionId: session1.id,
      memberId: m.id,
      status,
      minutesLate,
      checkInTime,
    };
  });
  await prisma.attendanceRecord.createMany({ data: session1Records });

  // Session 2 - Sunday service
  const session2 = await prisma.attendanceSession.create({
    data: {
      date: new Date("2026-03-01"),
      eventType: EventType.SUNDAY_SERVICE,
      venue: "St. John's Cathedral",
      startTime: "08:00",
      reportingTime: "07:30",
      isFinalized: true,
      createdById: directorUser.id,
    },
  });

  const session2Records = activeMembers.map((m, i) => {
    let status: AttendanceStatus = AttendanceStatus.PRESENT;
    let minutesLate: number | null = null;
    let checkInTime: string | null = "07:25";
    if (i % 4 === 0) { status = AttendanceStatus.LATE; minutesLate = 20; checkInTime = "07:50"; }
    if (i % 6 === 0) { status = AttendanceStatus.ABSENT; minutesLate = null; checkInTime = null; }
    return {
      sessionId: session2.id,
      memberId: m.id,
      status,
      minutesLate,
      checkInTime,
    };
  });
  await prisma.attendanceRecord.createMany({ data: session2Records });

  // Session 3 - Recent midweek
  const session3 = await prisma.attendanceSession.create({
    data: {
      date: new Date("2026-03-04"),
      eventType: EventType.MIDWEEK_PRACTICE,
      venue: "Church Hall",
      startTime: "17:30",
      reportingTime: "17:15",
      isFinalized: true,
      createdById: directorUser.id,
      eventId: events[3].id,
    },
  });

  const session3Records = activeMembers.map((m, i) => {
    let status: AttendanceStatus = AttendanceStatus.PRESENT;
    let minutesLate: number | null = null;
    if (i % 3 === 0) { status = AttendanceStatus.LATE; minutesLate = 30; }
    if (i % 8 === 0) { status = AttendanceStatus.ABSENT; minutesLate = null; }
    return {
      sessionId: session3.id,
      memberId: m.id,
      status,
      minutesLate,
    };
  });
  await prisma.attendanceRecord.createMany({ data: session3Records });
  console.log("Created attendance sessions and records");

  // Create penalties
  const penaltiesData = [];
  for (const record of session1Records) {
    if (record.status === AttendanceStatus.LATE) {
      penaltiesData.push({
        memberId: record.memberId,
        penaltyRuleId: lateRule.id,
        penaltyType: PenaltyType.LATE_COMING,
        amount: 20.00,
        amountPaid: 0,
        balance: 20.00,
        status: PenaltyStatus.UNPAID,
        reason: "Late to weekly rehearsal",
        sessionDate: new Date("2026-02-28"),
      });
    }
    if (record.status === AttendanceStatus.ABSENT) {
      penaltiesData.push({
        memberId: record.memberId,
        penaltyRuleId: absenceRule.id,
        penaltyType: PenaltyType.ABSENCE,
        amount: 50.00,
        amountPaid: 0,
        balance: 50.00,
        status: PenaltyStatus.UNPAID,
        reason: "Unexcused absence from weekly rehearsal",
        sessionDate: new Date("2026-02-28"),
      });
    }
  }

  // Add some paid penalties
  penaltiesData.push({
    memberId: members[1].id,
    penaltyRuleId: lateRule.id,
    penaltyType: PenaltyType.LATE_COMING,
    amount: 20.00,
    amountPaid: 20.00,
    balance: 0,
    status: PenaltyStatus.PAID,
    reason: "Late to rehearsal - Feb 21",
    sessionDate: new Date("2026-02-21"),
  });

  penaltiesData.push({
    memberId: members[3].id,
    penaltyRuleId: absenceRule.id,
    penaltyType: PenaltyType.ABSENCE,
    amount: 50.00,
    amountPaid: 25.00,
    balance: 25.00,
    status: PenaltyStatus.PARTIALLY_PAID,
    reason: "Absence from Sunday service - Feb 22",
    sessionDate: new Date("2026-02-22"),
  });

  const penalties = await Promise.all(
    penaltiesData.map((p) => prisma.penalty.create({ data: p }))
  );
  console.log(`Created ${penalties.length} penalties`);

  // Create payments
  const paidPenalty = penalties.find((p) => p.status === PenaltyStatus.PAID);
  const partialPenalty = penalties.find((p) => p.status === PenaltyStatus.PARTIALLY_PAID);

  const paymentsData = [];
  if (paidPenalty) {
    paymentsData.push({
      memberId: paidPenalty.memberId,
      category: PaymentCategory.PENALTY_PAYMENT,
      penaltyId: paidPenalty.id,
      amountDue: 20.00,
      amountPaid: 20.00,
      balance: 0,
      paymentMethod: PaymentMethod.MOBILE_MONEY,
      reference: "MM-20260225-001",
      recordedById: treasurerUser.id,
      paymentDate: new Date("2026-02-25"),
    });
  }
  if (partialPenalty) {
    paymentsData.push({
      memberId: partialPenalty.memberId,
      category: PaymentCategory.PENALTY_PAYMENT,
      penaltyId: partialPenalty.id,
      amountDue: 50.00,
      amountPaid: 25.00,
      balance: 25.00,
      paymentMethod: PaymentMethod.CASH,
      reference: "CASH-20260226-001",
      recordedById: treasurerUser.id,
      paymentDate: new Date("2026-02-26"),
    });
  }

  // Add some contribution payments
  paymentsData.push({
    memberId: members[0].id,
    category: PaymentCategory.MEMBERSHIP_FEE,
    amountDue: 100.00,
    amountPaid: 100.00,
    balance: 0,
    paymentMethod: PaymentMethod.MOBILE_MONEY,
    reference: "MM-20260201-002",
    notes: "Annual membership fee - 2026",
    recordedById: treasurerUser.id,
    paymentDate: new Date("2026-02-01"),
  });

  paymentsData.push({
    memberId: members[5].id,
    category: PaymentCategory.UNIFORM_CONTRIBUTION,
    amountDue: 250.00,
    amountPaid: 250.00,
    balance: 0,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    reference: "BT-20260215-001",
    notes: "Choir robe contribution",
    recordedById: treasurerUser.id,
    paymentDate: new Date("2026-02-15"),
  });

  paymentsData.push({
    memberId: members[10].id,
    category: PaymentCategory.WELFARE_CONTRIBUTION,
    amountDue: 50.00,
    amountPaid: 50.00,
    balance: 0,
    paymentMethod: PaymentMethod.CASH,
    reference: "CASH-20260220-003",
    notes: "Monthly welfare contribution",
    recordedById: treasurerUser.id,
    paymentDate: new Date("2026-02-20"),
  });

  await Promise.all(
    paymentsData.map((p) => prisma.payment.create({ data: p }))
  );
  console.log(`Created ${paymentsData.length} payments`);

  // Create announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: "Easter Concert Rehearsal Schedule",
        content: "Dear choir members, please note the special rehearsal schedule for our Easter concert preparation. Extra rehearsals will be held every Wednesday and Saturday starting March 11th. Attendance is mandatory for all sections. Please come prepared with your music scores.",
        audience: "ALL",
        isUrgent: true,
        createdById: directorUser.id,
        publishDate: new Date("2026-03-05"),
        expiryDate: new Date("2026-04-06"),
      },
      {
        title: "Choir Uniform Collection",
        content: "New choir robes are ready for collection. Please see the Treasurer after Sunday service to collect yours. Outstanding uniform contributions must be paid before collection.",
        audience: "ALL",
        createdById: treasurerUser.id,
        publishDate: new Date("2026-03-03"),
        expiryDate: new Date("2026-03-31"),
      },
      {
        title: "Wedding Ministration - March 14",
        content: "We have been invited to minister at the Lungu family wedding on March 14th at 10:00 AM. All Soprano and Alto members are required. Please confirm your availability with the Secretary.",
        audience: "SECTION",
        createdById: directorUser.id,
        publishDate: new Date("2026-03-04"),
        expiryDate: new Date("2026-03-14"),
      },
      {
        title: "Monthly Welfare Contributions Due",
        content: "Reminder: Monthly welfare contributions of K50 are due by the 15th of each month. Please make payments to the Treasurer or via Mobile Money.",
        audience: "ALL",
        createdById: treasurerUser.id,
        publishDate: new Date("2026-03-01"),
        expiryDate: new Date("2026-03-15"),
      },
    ],
  });
  console.log("Created announcements");

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      { userId: adminUser.id, action: "CREATE", entity: "SECTION", details: "Created sections: Soprano, Alto, Tenor, Bass" },
      { userId: adminUser.id, action: "CREATE", entity: "PENALTY_RULE", details: "Created late coming penalty rule: K20" },
      { userId: adminUser.id, action: "CREATE", entity: "USER", details: "Created director user account" },
      { userId: directorUser.id, action: "CREATE", entity: "ATTENDANCE_SESSION", entityId: session1.id, details: "Created rehearsal attendance session for Feb 28" },
      { userId: directorUser.id, action: "FINALIZE", entity: "ATTENDANCE_SESSION", entityId: session1.id, details: "Finalized rehearsal attendance" },
    ],
  });
  console.log("Created audit logs");

  console.log("\n--- Seed Complete ---");
  console.log("Demo accounts (all use password: password123):");
  console.log("  admin     - Super Admin");
  console.log("  director  - Choir Director (John Mwale)");
  console.log("  secretary - Secretary (Grace Mwanza)");
  console.log("  treasurer - Treasurer (Rebecca Mulenga)");
  console.log("  tenorleader - Section Leader (David Musonda)");
  console.log("  member1   - Member (Peter Kapata)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
