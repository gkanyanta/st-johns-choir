# Choir Membership & Attendance Manager

A production-ready, mobile-first web application for managing church choir membership, attendance, penalties, payments, and administration.

Built for St. John's Cathedral Choir (Zambia) but adaptable to any church choir context.

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM 7
- **Auth**: JWT-based with role-based access control
- **PWA**: Installable on phones

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example env file and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/choir_manager"
JWT_SECRET="your-secure-random-secret-key"
```

### 3. Setup Database

```bash
# Create the database
createdb choir_manager

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

All demo accounts use password: **password123**

| Username | Role | Linked Member |
|----------|------|---------------|
| admin | Super Admin | - |
| director | Choir Director | John Mwale (Bass) |
| secretary | Secretary | Grace Mwanza (Soprano) |
| treasurer | Treasurer | Rebecca Mulenga (Alto) |
| tenorleader | Section Leader | David Musonda (Tenor) |
| member1 | Member | Peter Kapata (Tenor) |

## User Roles & Permissions

| Feature | Super Admin | Director | Secretary | Treasurer | Section Leader | Member |
|---------|:-----------:|:--------:|:---------:|:---------:|:--------------:|:------:|
| Dashboard | Full | Full | Full | Financial | Limited | Own |
| Members | CRUD | View | CRUD | View | Own Section | Own |
| Attendance | Full | Full | Full | View | Own Section | Own |
| Penalties | Full | Full | View | View | View | Own |
| Payments | Full | View | View | Full | View | Own |
| Events | Full | Full | Full | View | View | View |
| Announcements | Full | Full | Full | View | View | View |
| Reports | Full | Full | Full | Financial | - | - |
| Settings | Full | - | - | - | - | - |
| User Mgmt | Full | - | - | - | - | - |

## Key Features

### Attendance (Mobile-Optimized)
- One-tap attendance marking per member
- "Mark All Present" bulk action
- Section filtering and member search
- Real-time summary counts
- Session finalization with auto-penalty creation
- Fixed bottom save bar on mobile

### Penalty System
- Configurable penalty rules (late coming, absence, etc.)
- Grace period support
- Auto-penalties on attendance finalization
- Waiver and adjustment with audit trail
- Payment tracking per penalty

### Financial Tracking
- Penalty payments
- Membership fees, uniform contributions, welfare
- Multiple payment methods (Cash, Mobile Money, Bank Transfer)
- Member account statements
- CSV export for reports

### Reports
- Member reports with export
- Attendance reports by date range
- Penalty reports with outstanding totals
- Payment/financial reports
- All reports support CSV export

## Project Structure

```
src/
  app/
    (auth)/login/          # Login page
    (dashboard)/           # Protected dashboard pages
      page.tsx             # Dashboard
      members/             # Member management
      attendance/          # Attendance sessions & marking
      penalties/           # Penalty tracking
      payments/            # Payment recording
      events/              # Event management
      announcements/       # Announcements
      reports/             # Reports & exports
      settings/            # System settings
      users/               # User management
      my-profile/          # Member self-service
    api/                   # API routes
      auth/                # Authentication
      members/             # Member CRUD
      attendance/sessions/ # Attendance management
      penalties/           # Penalty management
      payments/            # Payment recording
      events/              # Event CRUD
      announcements/       # Announcements
      dashboard/           # Dashboard stats
      reports/             # Report generation
      settings/            # System settings
      users/               # User management
      sections/            # Choir sections
      audit/               # Audit logs
  components/
    layout/                # Sidebar, TopBar, MobileNav
    shared/                # PageHeader, EmptyState, Loading
    ui/                    # shadcn/ui components
  lib/
    prisma.ts              # Database client
    auth.ts                # Authentication utilities
    audit.ts               # Audit logging
    api-utils.ts           # API helpers
    validations.ts         # Zod schemas
    hooks.ts               # React hooks
    constants.ts           # UI constants & labels
prisma/
  schema.prisma            # Database schema
  seed.ts                  # Demo data seeder
```

## Database Commands

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:seed        # Seed demo data
npm run db:studio      # Open Prisma Studio
```

## Currency

Default currency is ZMW (Zambian Kwacha, symbol: K). Configurable in Settings.

## PWA Installation

1. Open the app in Chrome/Edge on your phone
2. Tap "Add to Home Screen" when prompted
3. The app will install as a standalone application

## Production Deployment

```bash
npm run build
npm start
```

Ensure your production `.env` has:
- A strong `JWT_SECRET`
- A production `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL` set to your domain
