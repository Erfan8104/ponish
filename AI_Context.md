فاز ۱ — زیرساخت پنل ادمین (Foundation)

هدف: پنل قابل توسعه شود.

1. Layout

ابتدا Layout پنل را بساز.

AdminLayout
│
├── Sidebar
├── Header
│ ├── Search
│ ├── Notification
│ ├── Admin Avatar
│
└── Router View 2. Routing

مثلاً

/admin

/admin/dashboard

/admin/users

/admin/projects

/admin/contracts

/admin/payments

/admin/categories

/admin/skills

/admin/reviews

/admin/messages

/admin/reports

/admin/settings 3. Permission

الان فقط admin داری.

بعداً بتوانی اضافه کنی

Super Admin

Support

Finance

Moderator

حتی اگر فعلاً استفاده نشود.

4. Component Library

همین اول کامپوننت‌های مشترک را بساز.

مثلاً

AdminTable

AdminCard

AdminStatCard

AdminFilter

AdminSearch

DeleteModal

ConfirmModal

StatusBadge

Pagination

DatePicker

اگر این‌ها اول ساخته شوند بعداً همه صفحات یکدست می‌شوند.

فاز ۲ — Dashboard

اولین صفحه‌ای که مدیر بعد از ورود می‌بیند.

مثلاً

تعداد کاربران

تعداد پروژه‌ها

پروژه‌های فعال

قراردادهای فعال

پرداخت‌های امروز

کاربران جدید

درآمد سایت

کارت‌ها

Users

Projects

Contracts

Revenue

Pending Reviews

Pending Reports

پایین صفحه

دو جدول

آخرین کاربران

آخرین پروژه‌ها

بعد

نمودارها

ثبت نام روزانه

ثبت پروژه

پرداخت‌ها

فاز ۳ — مدیریت کاربران

به نظر من مهم‌ترین قسمت پنل.

جدول کاربران داری.

حالا امکاناتش را کامل کن.

Search
نام

شماره

ایمیل
Filter
Employer

Freelancer

Both

Admin

Filter
Active

Inactive

Verified

Not Verified

Sort
Newest

Oldest

Projects Count

User Detail

وقتی روی کاربر کلیک شد

صفحه

Profile

Employer Profile

Freelancer Profile

Projects

Contracts

Reviews

Messages

Payments

اکشن‌ها

Deactivate

Activate

Verify

Delete

Reset Password

Change Role

فاز ۴ — مدیریت پروژه‌ها

تقریباً مهم‌ترین قسمت سایت.

جدول

Title

Employer

Budget

Status

Created At

Province

اکشن‌ها

View

Edit

Delete

Publish

Close

Feature

داخل جزئیات پروژه

همه اطلاعات پروژه

Polygon

GeoJson

Proposalها

Contract

Attachments

Skills

همچنین

تعداد بازدید

تعداد پیشنهادها

فاز ۵ — مدیریت Proposal

تو مدل Proposal داری.

پس پنل هم لازم دارد.

جدول

Freelancer

Project

Amount

Delivery

Status

اکشن

Accept

Reject

Delete

فاز ۶ — مدیریت قراردادها

از روی Contract.

جدول

Employer

Freelancer

Project

Amount

Status

Started

داخل هر قرارداد

Milestones

Payments

Messages

Reviews

Amendments

اکشن‌ها

Cancel

Complete

Resolve dispute
فاز ۷ — مدیریت پرداخت‌ها

مدل Payment داری.

صفحه لازم دارد.

جدول

Amount

Gateway

Tracking

Status

Paid At

فیلتر

Pending

Paid

Refunded

Failed
فاز ۸ — مدیریت دسته‌بندی‌ها

Category

CRUD کامل

Create

Edit

Delete

Parent

Slug

Description
فاز ۹ — مدیریت مهارت‌ها

Skill

Create

Delete

Edit

Merge Skills
فاز ۱۰ — مدیریت پیام‌ها

از مدل Message.

امکان مشاهده گفتگوها

Contract

Sender

Receiver

Date

و مشاهده کل Conversation.

فاز ۱۱ — مدیریت Review

جدول

Reviewer

Reviewed

Rating

Comment

اگر لازم شد

Delete Review

Hide Review
فاز ۱۲ — مدیریت فایل‌ها

تمام فایل‌های

Avatar

Project Attachments

نمایش داده شوند.

امکان

Preview

Download

Delete

من تا فاز یازدهم پروژه رو با یک هوش مصنوعی دیگه جلو بردم و الان از تو میخواهم فاز دوازدهم رو واسم انجام بدی .
اما قبل از اینکه از تو چیزی بخواهم اطلاعات پروژه رو کامل در اختیارت میزارم بعد بریم فاز دوازدهم رو انجام بدیم

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
}

// ======================
// ENUMS موجود (بدون تغییر)
// ======================
enum UserRole {
employer
freelancer
both
admin // ← این را نگه می‌داریم برای سازگاری با کد فعلی
}

enum ProjectStatus {
draft
open
in_progress
completed
cancelled
disputed
}

enum BudgetType {
fixed
hourly
negotiable
}

enum ProposalStatus {
pending
accepted
rejected
withdrawn
}

enum ContractStatus {
active
completed
cancelled
disputed
}

enum MilestoneStatus {
pending
in_progress
submitted
approved
rejected
paid
}

enum PaymentStatus {
pending
paid
failed
refunded
}

enum MessageType {
text
file
system
}

enum ReviewTarget {
employer
freelancer
}

enum AmendmentStatus {
pending
accepted
rejected
}

// ======================
// ENUMS جدید برای سیستم Permission
// ======================
enum AdminRoleName {
SUPER_ADMIN
ADMIN
SUPPORT
FINANCE
MODERATOR
}

// ======================
// مدل‌های موجود (با تغییرات حداقلی)
// ======================
model User {
id Int @id @default(autoincrement())
phone String @unique
email String? @unique
password String?
isVerified Boolean @default(false)
isActive Boolean @default(true)
profileCompleted Boolean @default(false)
role UserRole @default(employer) // ← بدون تغییر

name String?
avatar String?
bio String?
province String?
city String?

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?

// روابط موجود
employerProfile EmployerProfile?
freelancerProfile FreelancerProfile?
projects Project[] @relation("EmployerProjects")
proposals Proposal[]
contractsAsEmployer Contract[] @relation("EmployerContracts")
contractsAsFreelancer Contract[] @relation("FreelancerContracts")
sentMessages Message[] @relation("SentMessages")
receivedMessages Message[] @relation("ReceivedMessages")
reviewsGiven Review[] @relation("ReviewsGiven")
reviewsReceived Review[] @relation("ReviewsReceived")
otps OTP[]

// 🌟 روابط جدید برای سیستم Permission
adminRoles UserAdminRole[]

@@index([phone])
@@index([email])
@@index([role])
@@index([province, city])
@@index([isActive])
}

// ======================
// مدل‌های جدید Permission System
// ======================

model AdminRole {
id Int @id @default(autoincrement())
name AdminRoleName @unique
displayName String // مثلاً "سوپر ادمین"
description String?
isSystem Boolean @default(false) // نقش‌های سیستمی قابل حذف نباشند
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

permissions UserAdminRole[]
rolePermissions RolePermission[]

@@index([name])
}

model Permission {
id Int @id @default(autoincrement())
key String @unique // مثلاً "users.view", "projects.delete", "payments.refund"
name String // نام فارسی
description String?
group String? // گروه‌بندی: users, projects, contracts, payments, ...
createdAt DateTime @default(now())

rolePermissions RolePermission[]

@@index([key])
@@index([group])
}

model RolePermission {
id Int @id @default(autoincrement())
roleId Int
permissionId Int

role AdminRole @relation(fields: [roleId], references: [id], onDelete: Cascade)
permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

@@unique([roleId, permissionId])
@@index([roleId])
@@index([permissionId])
}

model UserAdminRole {
id Int @id @default(autoincrement())
userId Int
roleId Int
assignedAt DateTime @default(now())
assignedBy Int? // کی این نقش را داده

user User @relation(fields: [userId], references: [id], onDelete: Cascade)
role AdminRole @relation(fields: [roleId], references: [id], onDelete: Cascade)

@@unique([userId, roleId])
@@index([userId])
@@index([roleId])
}

// ======================
// بقیه مدل‌ها (بدون تغییر)
// ======================
model EmployerProfile {
id Int @id @default(autoincrement())
userId Int @unique
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
companyName String?
companyType String?
website String?
address String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model FreelancerProfile {
id Int @id @default(autoincrement())
userId Int @unique
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
birthDate String?
birthPlace String?
education String?
experience String?
portfolioUrl String?
hourlyRate Decimal? @db.Decimal(12, 2)
rating Float @default(0)
completedJobs Int @default(0)
skills FreelancerSkill[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Category {
id Int @id @default(autoincrement())
name String
slug String @unique
description String?
parentId Int?
parent Category? @relation("CategoryChildren", fields: [parentId], references: [id])
children Category[] @relation("CategoryChildren")
projects Project[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([slug])
@@index([parentId])
}

model Skill {
id Int @id @default(autoincrement())
name String
slug String @unique
freelancers FreelancerSkill[]
projects ProjectSkill[]
createdAt DateTime @default(now())

@@index([slug])
}

model FreelancerSkill {
id Int @id @default(autoincrement())
freelancerProfileId Int
freelancerProfile FreelancerProfile @relation(fields: [freelancerProfileId], references: [id], onDelete: Cascade)
skillId Int
skill Skill @relation(fields: [skillId], references: [id], onDelete: Cascade)
level String?

@@unique([freelancerProfileId, skillId])
@@index([skillId])
}

model Project {
id Int @id @default(autoincrement())
employerId Int
employer User @relation("EmployerProjects", fields: [employerId], references: [id], onDelete: Cascade)
categoryId Int?
category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
title String?
slug String? @unique
description String?

terrainTypes Json? @default("[]")
status ProjectStatus @default(draft)
province String?
city String?
address String?
corridorLength Float?
mappingType String?
calculatedArea Float?

utmZone String?
requiredAccuracy String?
mapScale String?
deliveryTime String?
budgetType BudgetType @default(fixed)
minBudget Decimal? @db.Decimal(14, 2)
maxBudget Decimal? @db.Decimal(14, 2)

surveyMethod String?
specificSurveys Json? @default("[]")
requiredEquipment Json? @default("[]")
groundTechnicalSpecs Json? @default("[]")
aerialTechnicalSpecs Json? @default("[]")
aerialScaleOption String?
gisTechnicalSpecs Json? @default("[]")
contourInterval String?

groundDescription String?
aerialDescription String?
gisDescription String?
polygonCoordinates Json?
geoJson Json?
isFeatured Boolean @default(false)
viewCount Int @default(0)
skills ProjectSkill[]
attachments ProjectAttachment[]
proposals Proposal[]
contract Contract?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
publishedAt DateTime?
closedAt DateTime?
deletedAt DateTime?
techType Json?
outputFormats Json?
areaSelectionMethod String?

@@index([employerId])
@@index([categoryId])
@@index([status])
@@index([province, city])
@@index([createdAt])
}

model ProjectSkill {
id Int @id @default(autoincrement())
projectId Int
project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
skillId Int
skill Skill @relation(fields: [skillId], references: [id], onDelete: Cascade)

@@unique([projectId, skillId])
@@index([skillId])
}

model ProjectAttachment {
id Int @id @default(autoincrement())
projectId Int
project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
fileName String
fileUrl String
fileType String?
fileSize Int?
createdAt DateTime @default(now())

@@index([projectId])
}

model Proposal {
id Int @id @default(autoincrement())
projectId Int
project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
freelancerId Int
freelancer User @relation(fields: [freelancerId], references: [id], onDelete: Cascade)
amount Decimal @db.Decimal(14, 2)
deliveryDays Int
coverLetter String
status ProposalStatus @default(pending)
contract Contract?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@unique([projectId, freelancerId])
@@index([projectId])
@@index([freelancerId])
@@index([status])
}

model Contract {
id Int @id @default(autoincrement())
amendments ContractAmendment[]
projectId Int @unique
project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
proposalId Int @unique
proposal Proposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)
employerId Int
employer User @relation("EmployerContracts", fields: [employerId], references: [id], onDelete: Cascade)
freelancerId Int
freelancer User @relation("FreelancerContracts", fields: [freelancerId], references: [id], onDelete: Cascade)
totalAmount Decimal @db.Decimal(14, 2)
status ContractStatus @default(active)
milestones Milestone[]
payments Payment[]
messages Message[]
reviews Review[]
startedAt DateTime @default(now())
completedAt DateTime?
cancelledAt DateTime?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([employerId])
@@index([freelancerId])
@@index([status])
}

model Milestone {
id Int @id @default(autoincrement())
contractId Int
contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
title String
description String?
amount Decimal @db.Decimal(14, 2)
dueDate DateTime?
status MilestoneStatus @default(pending)
payments Payment[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([contractId])
@@index([status])
}

model Payment {
id Int @id @default(autoincrement())
contractId Int
contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
milestoneId Int?
milestone Milestone? @relation(fields: [milestoneId], references: [id], onDelete: SetNull)
amount Decimal @db.Decimal(14, 2)
status PaymentStatus @default(pending)
gateway String?
trackingCode String?
paidAt DateTime?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([contractId])
@@index([milestoneId])
@@index([status])
}

model Message {
id Int @id @default(autoincrement())
contractId Int?
contract Contract? @relation(fields: [contractId], references: [id], onDelete: Cascade)
senderId Int
sender User @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
receiverId Int
receiver User @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
type MessageType @default(text)
content String?
fileUrl String?
readAt DateTime?
createdAt DateTime @default(now())

@@index([contractId])
@@index([senderId])
@@index([receiverId])
@@index([createdAt])
}

model Review {
id Int @id @default(autoincrement())
contractId Int
contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
reviewerId Int
reviewer User @relation("ReviewsGiven", fields: [reviewerId], references: [id], onDelete: Cascade)
reviewedId Int
reviewed User @relation("ReviewsReceived", fields: [reviewedId], references: [id], onDelete: Cascade)
target ReviewTarget
rating Int
comment String?
createdAt DateTime @default(now())

@@unique([contractId, reviewerId, reviewedId])
@@index([reviewerId])
@@index([reviewedId])
@@index([rating])
}

model OTP {
id Int @id @default(autoincrement())
phone String
code String
expiresAt DateTime
usedAt DateTime?
createdAt DateTime @default(now())
userId Int?
user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([phone])
@@index([userId])
@@index([expiresAt])
}

model ContractAmendment {
id Int @id @default(autoincrement())
contractId Int
contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
proposed_area Float?
proposed_length Float?
proposed_amount Decimal? @db.Decimal(14, 2)
proposed_delivery_time Int?
notes String?
status AmendmentStatus @default(pending)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([contractId])
@@index([status])
}

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
console.log("🌱 در حال درج اطلاعات اولیه...");

// ============================================================
// ۱. دسته‌بندی‌های پیش‌فرض
// ============================================================
const categories = [
{
name: "نقشه‌برداری زمینی",
slug: "mapping",
description: "برداشت با توتال استیشن و GPS",
},
{
name: "عکس‌برداری هوایی",
slug: "drone",
description: "تصویربرداری هوایی و تهیه ارتوفتو",
},
{
name: "خدمات GIS",
slug: "gis",
description: "تحلیل داده، ژئورفرنس و پایگاه داده",
},
{
name: "ترسیم و کارتوگرافی",
slug: "drafting",
description: "امور ثبتی، نقشه‌کشی و کارتوگرافی",
},
];

for (const cat of categories) {
await prisma.category.upsert({
where: { slug: cat.slug },
update: {},
create: cat,
});
}
console.log("✅ دسته‌بندی‌ها با موفقیت اضافه شدند.");

// ============================================================
// ۲. نقش‌های ادمین (Admin Roles)
// ============================================================
const adminRoles = [
{
name: "SUPER_ADMIN" as const,
displayName: "سوپر ادمین",
description: "دسترسی کامل به تمام بخش‌های سیستم",
isSystem: true,
},
{
name: "ADMIN" as const,
displayName: "ادمین",
description: "مدیریت کاربران، پروژه‌ها و تنظیمات عمومی",
isSystem: true,
},
{
name: "SUPPORT" as const,
displayName: "پشتیبانی",
description: "پاسخگویی به تیکت‌ها و مدیریت پیام‌ها",
isSystem: false,
},
{
name: "FINANCE" as const,
displayName: "مالی",
description: "مدیریت پرداخت‌ها، بازگشت وجه و گزارش‌های مالی",
isSystem: false,
},
{
name: "MODERATOR" as const,
displayName: "ناظر",
description: "بررسی و مدیریت محتوای کاربران و نظرات",
isSystem: false,
},
];

for (const role of adminRoles) {
await prisma.adminRole.upsert({
where: { name: role.name },
update: {
displayName: role.displayName,
description: role.description,
isSystem: role.isSystem,
},
create: role,
});
}
console.log("✅ نقش‌های ادمین با موفقیت اضافه شدند.");

// ============================================================
// ۳. دسترسی‌ها (Permissions)
// ============================================================
const permissions = [
// Users
{ key: "users.view", name: "مشاهده کاربران", group: "users" },
{ key: "users.create", name: "ایجاد کاربر", group: "users" },
{ key: "users.edit", name: "ویرایش کاربران", group: "users" },
{ key: "users.delete", name: "حذف کاربران", group: "users" },
{ key: "users.ban", name: "مسدود کردن کاربران", group: "users" },

    // Projects
    { key: "projects.view", name: "مشاهده پروژه‌ها", group: "projects" },
    { key: "projects.edit", name: "ویرایش پروژه‌ها", group: "projects" },
    { key: "projects.delete", name: "حذف پروژه‌ها", group: "projects" },
    { key: "projects.feature", name: "ویژه کردن پروژه", group: "projects" },

    // Proposals
    { key: "proposals.view", name: "مشاهده پیشنهادها", group: "proposals" },
    {
      key: "proposals.manage",
      name: "مدیریت پیشنهادها (تایید/رد/حذف)",
      group: "proposals",
    },

    // Contracts
    { key: "contracts.view", name: "مشاهده قراردادها", group: "contracts" },
    { key: "contracts.edit", name: "ویرایش قراردادها", group: "contracts" },
    { key: "contracts.cancel", name: "لغو قرارداد", group: "contracts" },

    // Payments
    { key: "payments.view", name: "مشاهده پرداخت‌ها", group: "payments" },
    { key: "payments.refund", name: "بازگشت وجه", group: "payments" },
    { key: "payments.export", name: "خروجی گزارش مالی", group: "payments" },

    // Categories & Skills
    {
      key: "categories.manage",
      name: "مدیریت دسته‌بندی‌ها",
      group: "categories",
    },
    { key: "skills.manage", name: "مدیریت مهارت‌ها", group: "skills" },

    // Reviews
    { key: "reviews.view", name: "مشاهده نظرات", group: "reviews" },
    { key: "reviews.delete", name: "حذف نظرات", group: "reviews" },

    // Messages
    { key: "messages.view", name: "مشاهده پیام‌ها", group: "messages" },
    { key: "messages.delete", name: "حذف پیام‌ها", group: "messages" },

    // Reports
    { key: "reports.view", name: "مشاهده گزارش‌ها", group: "reports" },
    { key: "reports.export", name: "خروجی گزارش‌ها", group: "reports" },

    // Settings
    { key: "settings.view", name: "مشاهده تنظیمات", group: "settings" },
    { key: "settings.manage", name: "مدیریت تنظیمات", group: "settings" },

    // Roles & Permissions
    { key: "roles.manage", name: "مدیریت نقش‌ها و دسترسی‌ها", group: "roles" },

];

for (const perm of permissions) {
await prisma.permission.upsert({
where: { key: perm.key },
update: {
name: perm.name,
group: perm.group,
},
create: perm,
});
}
console.log("✅ دسترسی‌ها با موفقیت اضافه شدند.");

// ============================================================
// ۴. اختصاص دسترسی‌ها به نقش‌ها (RolePermissions)
// ============================================================
const allPermissions = await prisma.permission.findMany();
const allRoles = await prisma.adminRole.findMany();

const roleMap = Object.fromEntries(allRoles.map((r) => [r.name, r.id]));
const permMap = Object.fromEntries(allPermissions.map((p) => [p.key, p.id]));

const rolePermissionMap: Record<string, string[]> = {
SUPER_ADMIN: allPermissions.map((p) => p.key),

    ADMIN: [
      "users.view",
      "users.create",
      "users.edit",
      "users.ban",
      "projects.view",
      "projects.edit",
      "projects.delete",
      "projects.feature",
      "proposals.view",
      "proposals.manage",
      "contracts.view",
      "contracts.edit",
      "contracts.cancel",
      "payments.view",
      "categories.manage",
      "skills.manage",
      "reviews.view",
      "reviews.delete",
      "messages.view",
      "reports.view",
      "reports.export",
      "settings.view",
      "settings.manage",
    ],

    SUPPORT: [
      "users.view",
      "users.edit",
      "projects.view",
      "proposals.view",
      "contracts.view",
      "messages.view",
      "messages.delete",
      "reviews.view",
    ],

    FINANCE: [
      "users.view",
      "projects.view",
      "proposals.view",
      "contracts.view",
      "payments.view",
      "payments.refund",
      "payments.export",
      "reports.view",
      "reports.export",
    ],

    MODERATOR: [
      "users.view",
      "users.ban",
      "projects.view",
      "projects.delete",
      "proposals.view",
      "reviews.view",
      "reviews.delete",
      "messages.view",
      "messages.delete",
    ],

};

for (const [roleName, permKeys] of Object.entries(rolePermissionMap)) {
const roleId = roleMap[roleName];
if (!roleId) continue;

    for (const key of permKeys) {
      const permissionId = permMap[key];
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }

}
console.log("✅ دسترسی‌ها به نقش‌ها اختصاص داده شدند.");

// ============================================================
// ۵. ایجاد کاربران ادمین برای همه نقش‌ها
// ============================================================
const adminUsers = [
{
phone: "09120000000",
password: "AdminSecretPassword123",
name: "مدیر کل سیستم",
roleName: "SUPER_ADMIN" as const,
},
{
phone: "09121111111",
password: "AdminPass123",
name: "ادمین سیستم",
roleName: "ADMIN" as const,
},
{
phone: "09122222222",
password: "SupportPass123",
name: "پشتیبان سیستم",
roleName: "SUPPORT" as const,
},
{
phone: "09123333333",
password: "FinancePass123",
name: "مدیر مالی",
roleName: "FINANCE" as const,
},
{
phone: "09124444444",
password: "ModPass123",
name: "ناظر محتوا",
roleName: "MODERATOR" as const,
},
];

for (const item of adminUsers) {
const hashedPassword = await bcrypt.hash(item.password, 10);

    const user = await prisma.user.upsert({
      where: { phone: item.phone },
      update: {
        role: "admin",
        password: hashedPassword,
        name: item.name,
        isVerified: true,
        profileCompleted: true,
        isActive: true,
      },
      create: {
        phone: item.phone,
        password: hashedPassword,
        role: "admin",
        name: item.name,
        profileCompleted: true,
        isVerified: true,
        isActive: true,
      },
    });

    const role = await prisma.adminRole.findUnique({
      where: { name: item.roleName },
    });

    if (role) {
      await prisma.userAdminRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }

    console.log(
      `✅ کاربر ${item.roleName} → شماره: ${item.phone} | رمز: ${item.password}`,
    );

}

console.log("🎉 Seed با موفقیت کامل شد.");
}

main()
.catch((e) => {
console.error(e);
process.exit(1);
})
.finally(async () => {
await prisma.$disconnect();
await pool.end();
});

xmart@xmart-HP-255-G8-Notebook-PC:~/Desktop/ponisha-clone$ tree -I node_modules
.
├── AI_Context.md
├── backend
│ ├── Dockerfile
│ ├── package.json
│ ├── package-lock.json
│ ├── prisma
│ │ ├── migrations
│ │ │ ├── 20260608095647_firstinit
│ │ │ │ └── migration.sql
│ │ │ ├── 20260608102118_add_otp
│ │ │ │ └── migration.sql
│ │ │ ├── 20260614080826_add_model_project
│ │ │ │ └── migration.sql
│ │ │ ├── 20260616062659_add_user_project_relation
│ │ │ │ └── migration.sql
│ │ │ ├── 20260620063443_add_profile_fields_to_user
│ │ │ │ └── migration.sql
│ │ │ ├── 20260627092621_init_real_schema
│ │ │ │ └── migration.sql
│ │ │ ├── 20260629081215_fixed_problem
│ │ │ │ └── migration.sql
│ │ │ ├── 20260629085034_make_project_field_optional
│ │ │ │ └── migration.sql
│ │ │ ├── 20260714070009_add_contract_amendment
│ │ │ │ └── migration.sql
│ │ │ ├── 20260718090039_add_mapping_fields_and_amendments
│ │ │ │ └── migration.sql
│ │ │ ├── 20260720072845_remove_coordinate_system_field
│ │ │ │ └── migration.sql
│ │ │ ├── 20260721114436_add_map_scale
│ │ │ │ └── migration.sql
│ │ │ ├── 20260805084041_add_permission_system
│ │ │ │ └── migration.sql
│ │ │ └── migration_lock.toml
│ │ ├── schema.prisma
│ │ └── seed.ts
│ ├── prisma.config.ts
│ ├── src
│ │ ├── controllers
│ │ │ ├── admin.controller.ts
│ │ │ ├── auth.controller.ts
│ │ │ ├── contract.controller.ts
│ │ │ ├── message.controller.ts
│ │ │ ├── profile.controller.ts
│ │ │ └── project.controller.ts
│ │ ├── lib
│ │ │ └── prisma.ts
│ │ ├── middleware
│ │ │ ├── admin.middleware.ts
│ │ │ ├── auth.middleware.ts
│ │ │ ├── avatarUpload.middleware.ts
│ │ │ ├── upload.middleware.ts
│ │ │ └── validation.middleware.ts
│ │ ├── routes
│ │ │ ├── admin.routes.ts
│ │ │ ├── auth.routes.ts
│ │ │ ├── contract.routes.ts
│ │ │ ├── message.routes.ts
│ │ │ ├── profile.routes.ts
│ │ │ └── project.routes.ts
│ │ ├── server.ts
│ │ ├── services
│ │ │ └── socket.service.ts
│ │ ├── types
│ │ │ ├── contract.types.ts
│ │ │ └── project.interface.ts
│ │ └── validators
│ │ ├── auth.validator.ts
│ │ ├── profile.validator.ts
│ │ └── project.validator.ts
│ ├── tsconfig.json
│ └── uploads
│ ├── avatars
│ └── projects
│ ├── 1784456941251-38929b022ce77c57.jpeg
│ ├── 1784532988998-2c29c3d0b8f5dc64.jpeg
│ └── 1784538209348-d967c5d3b331db24.jpeg
├── docker-compose.yml
└── frontend
├── env.d.ts
├── eslint.config.ts
├── index.html
├── package.json
├── package-lock.json
├── public
│ ├── favicon.ico
│ ├── favicon.svg
│ └── images
│ ├── default-avatarl.png
│ └── default-avatar.png
├── README.md
├── src
│ ├── App.vue
│ ├── assets
│ │ ├── cta-bg-map.png
│ │ ├── geokar-logo-horizontal.svg
│ │ ├── homepage.mp4
│ │ ├── logo
│ │ │ └── geokar-logo-mark.svg
│ │ └── main.css
│ ├── components
│ │ ├── admin
│ │ │ ├── AdminLayout
│ │ │ │ ├── AdminHeader.vue
│ │ │ │ ├── AdminLayout.vue
│ │ │ │ └── AdminSidebar.vue
│ │ │ └── ui
│ │ │ ├── AdminBoundaryMapView.vue
│ │ │ ├── AdminCard.vue
│ │ │ ├── AdminFilter.vue
│ │ │ ├── AdminProjectPdfExporter.vue
│ │ │ ├── AdminSearch.vue
│ │ │ ├── AdminStatCard.vue
│ │ │ ├── AdminTable.vue
│ │ │ ├── CategoryFormModal.vue
│ │ │ ├── ConfirmModal.vue
│ │ │ ├── ConversationDrawer.vue
│ │ │ ├── DatePicker.vue
│ │ │ ├── DeleteModal.vue
│ │ │ ├── MergeSkillsModal.vue
│ │ │ ├── Pagination.vue
│ │ │ ├── SkillFormModal.vue
│ │ │ └── StatusBadge.vue
│ │ ├── common
│ │ │ └── ProjectTriggerButton.vue
│ │ ├── dashboard
│ │ │ ├── ActiveFreelancerProject.vue
│ │ │ ├── ProfileCard.vue
│ │ │ ├── ProjectCard.vue
│ │ │ ├── ProjectList.vue
│ │ │ └── UserEmployerProject.vue
│ │ ├── home
│ │ │ ├── EmployerCard.vue
│ │ │ ├── ExpertCard.vue
│ │ │ ├── FeaturesSection.vue
│ │ │ ├── HomeHero.vue
│ │ │ ├── HomeStats.vue
│ │ │ ├── PlatformSection.vue
│ │ │ └── ServicesGrid.vue
│ │ ├── layouts
│ │ │ ├── footer.vue
│ │ │ └── header.vue
│ │ ├── map
│ │ │ ├── LeafletBoundaryMap.vue
│ │ │ └── mapTab
│ │ │ ├── index.ts
│ │ │ ├── LeafletBoundaryMap.vue
│ │ │ ├── LeafletGeoJson.vue
│ │ │ ├── LeafletMap.vue
│ │ │ └── LeafletMarkerMap.vue
│ │ ├── modal
│ │ │ ├── ProfileImage.vue
│ │ │ ├── ProfileModal.vue
│ │ │ ├── ProjectDetailModal
│ │ │ │ ├── componentcontract
│ │ │ │ │ ├── AmendmentDetailModal.vue
│ │ │ │ │ ├── AmendmentFreelancerActions.vue
│ │ │ │ │ └── AmendmentStatusBanner.vue
│ │ │ │ ├── ContractUpdateWizard.vue
│ │ │ │ ├── ProjectChatTab.vue
│ │ │ │ ├── ProjectContractTab.vue
│ │ │ │ ├── ProjectFooter.vue
│ │ │ │ ├── ProjectHeader.vue
│ │ │ │ ├── ProjectInfoTab.vue
│ │ │ │ ├── ProjectMapTab.vue
│ │ │ │ ├── ProjectPdfExporter.vue
│ │ │ │ ├── ProjectProposalTab.vue
│ │ │ │ └── ProjectTabs.vue
│ │ │ ├── ProjectDetailModal.vue
│ │ │ ├── ProjectOptionsModal.vue
│ │ │ ├── ProposalModal.vue
│ │ │ ├── QuickProjectModal.vue
│ │ │ └── SearchModal.vue
│ │ └── stepProjectForm
│ │ ├── FileUploader.vue
│ │ ├── StepBasicInfo.vue
│ │ ├── StepInvoice.vue
│ │ ├── StepMapBoundary.vue
│ │ ├── StepTechnicalSpecs.vue
│ │ ├── StepTimingBudget.vue
│ │ └── SuccessCreateProject.vue
│ ├── main.ts
│ ├── pages
│ │ ├── AdminCategoryPage.vue
│ │ ├── AdminContractDetailPage.vue
│ │ ├── AdminContractPage.vue
│ │ ├── AdminDashboardPage.vue
│ │ ├── AdminLoginPage.vue
│ │ ├── AdminMessagePage.vue
│ │ ├── AdminPaymentPage.vue
│ │ ├── AdminProjectDetailPage.vue
│ │ ├── AdminProjectPage.vue
│ │ ├── AdminProposalPage.vue
│ │ ├── AdminReviewPage.vue
│ │ ├── AdminSkillPage.vue
│ │ ├── AdminUserDetailPage.vue
│ │ ├── AdminUserPage.vue
│ │ ├── consultationPage.vue
│ │ ├── CreateProjectPage.vue
│ │ ├── CreateUsername.vue
│ │ ├── DashboardPage.vue
│ │ ├── HomePage.vue
│ │ ├── LoginPage.vue
│ │ ├── OtpPage.vue
│ │ ├── PasswordPage.vue
│ │ ├── profilePage.vue
│ │ ├── SignupPage.vue
│ │ └── WelcomePage.vue
│ ├── router
│ │ └── index.ts
│ ├── schemas
│ │ ├── login.schema.ts
│ │ └── signup.schemas.ts
│ ├── services
│ │ ├── admin.service.ts
│ │ ├── api.ts
│ │ ├── auth.service.ts
│ │ ├── contract.service.ts
│ │ ├── message.service.ts
│ │ ├── profile.service.ts
│ │ └── project.service.ts
│ ├── stores
│ │ ├── admin.store.ts
│ │ ├── auth.store.ts
│ │ ├── buttoncreateproject.store.ts
│ │ ├── chat.store.ts
│ │ ├── contract.store.ts
│ │ ├── profile.modal.store.ts
│ │ ├── project.store.ts
│ │ ├── proposal.store.ts
│ │ ├── QuickProject.modal.store.ts
│ │ ├── role.store.ts
│ │ └── ui.store.ts
│ └── types
│ ├── auth.ts
│ ├── leaflet.d.ts
│ ├── project.ts
│ └── RoleUser.ts
├── text.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

54 directories, 190 files
xmart@xmart-HP-255-G8-Notebook-PC:~/Desktop/ponisha-clone$

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";

import crypto from "crypto";

// جایگزین getAllUsersForAdmin فعلی بشه
export const getAllUsersForAdmin = async (req: Request, res: Response) => {
try {
const {
search = "",
role,
status,
verified,
sortBy = "newest",
page = "1",
limit = "10",
} = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (status) where.isActive = status === "active";
    if (verified) where.isVerified = verified === "verified";

    const baseSelect = {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      profileCompleted: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      _count: { select: { projects: true } },
    };

    let orderBy: any = { createdAt: sortBy === "oldest" ? "asc" : "desc" };
    if (sortBy === "projectsCount") orderBy = { projects: { _count: "desc" } };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: baseSelect,
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });

} catch (error) {
console.error("Get Users Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت لیست کاربران" });
}
};

export const getProjectDetailForAdmin = async (req: Request, res: Response) => {
try {
const projectId = Number(req.params.id);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        employer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        category: true,
        _count: {
          select: { proposals: true },
        },
        proposals: {
          include: {
            freelancer: {
              select: { id: true, name: true, phone: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        contract: {
          include: {
            freelancer: {
              select: { id: true, name: true, phone: true },
            },
            milestones: true,
          },
        },
        attachments: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!project || project.deletedAt) {
      return res
        .status(404)
        .json({ success: false, message: "پروژه یافت نشد" });
    }

    return res.json({ success: true, project });

} catch (error) {
console.error("Get Project Detail Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت جزئیات پروژه" });
}
};

export const getAllProjectsForAdmin = async (req: Request, res: Response) => {
try {
const {
search = "",
status,
sortBy = "newest",
page = "1",
limit = "10",
} = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { employer: { name: { contains: search, mode: "insensitive" } } },
        { employer: { phone: { contains: search } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    if (sortBy === "budget") orderBy = { maxBudget: "desc" };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          province: true,
          minBudget: true,
          maxBudget: true,
          budgetType: true,
          isFeatured: true,

          createdAt: true,
          employer: {
            select: { name: true, phone: true },
          },
        },
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.project.count({ where }),
    ]);

    return res.json({
      success: true,
      projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });

} catch (error) {
console.error("Get All Projects Error:", error);
return res.status(500).json({
success: false,
message: "خطا در دریافت لیست پروژه‌ها",
});
}
};
// جزئیات کامل یک کاربر
export const getUserDetail = async (req: Request, res: Response) => {
try {
const userId = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employerProfile: true,
        freelancerProfile: {
          include: { skills: { include: { skill: true } } },
        },
        projects: {
          select: { id: true, title: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
        contractsAsEmployer: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            freelancer: { select: { name: true, phone: true } },
          },
        },
        contractsAsFreelancer: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            employer: { select: { name: true, phone: true } },
          },
        },
        reviewsGiven: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewed: { select: { name: true } },
          },
        },
        reviewsReceived: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: { select: { name: true } },
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "کاربر یافت نشد" });
    }

    const contractIds = [
      ...user.contractsAsEmployer.map((c) => c.id),
      ...user.contractsAsFreelancer.map((c) => c.id),
    ];

    const payments = contractIds.length
      ? await prisma.payment.findMany({
          where: { contractId: { in: contractIds } },
          orderBy: { createdAt: "desc" },
        })
      : [];

    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        content: true,
        type: true,
        createdAt: true,
        senderId: true,
        receiverId: true,
      },
    });

    const { password, ...safeUser } = user;
    return res.json({ success: true, user: safeUser, payments, messages });

} catch (error) {
console.error("Get User Detail Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت جزئیات کاربر" });
}
};

export const verifyUser = async (req: Request, res: Response) => {
try {
const user = await prisma.user.update({
where: { id: Number(req.params.id) },
data: { isVerified: true },
select: { id: true, isVerified: true },
});
return res.json({ success: true, message: "کاربر تایید شد", user });
} catch (error) {
return res
.status(500)
.json({ success: false, message: "خطا در تایید کاربر" });
}
};

// Soft delete
export const deleteUser = async (req: Request, res: Response) => {
try {
const user = await prisma.user.update({
where: { id: Number(req.params.id) },
data: { deletedAt: new Date(), isActive: false },
select: { id: true, deletedAt: true },
});
return res.json({ success: true, message: "کاربر حذف شد", user });
} catch (error) {
return res
.status(500)
.json({ success: false, message: "خطا در حذف کاربر" });
}
};

export const resetUserPassword = async (req: Request, res: Response) => {
try {
const newPassword = crypto.randomBytes(4).toString("hex");
const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { password: hashed },
    });

    // این رمز فقط همین یک بار در پاسخ برمی‌گردد و جایی ذخیره نمی‌شود
    return res.json({
      success: true,
      message: "رمز عبور بازنشانی شد",
      newPassword,
    });

} catch (error) {
return res
.status(500)
.json({ success: false, message: "خطا در بازنشانی رمز عبور" });
}
};

export const changeUserRole = async (req: Request, res: Response) => {
try {
const { role } = req.body;
const allowedRoles = ["employer", "freelancer", "both", "admin"];
if (!allowedRoles.includes(role)) {
return res
.status(400)
.json({ success: false, message: "نقش نامعتبر است" });
}

    // فقط سوپر ادمین بتواند نقش admin بدهد
    // ⚠️ فرض شده req.user.permissions توسط authMiddleware ست می‌شود — چک کن با middleware واقعی‌ات هماهنگ باشد
    if (role === "admin") {
      const requesterPermissions = (req as any).user?.permissions || [];
      if (!requesterPermissions.includes("*")) {
        return res.status(403).json({
          success: false,
          message: "فقط سوپر ادمین می‌تواند نقش ادمین اختصاص دهد",
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role },
      select: { id: true, role: true },
    });

    return res.json({ success: true, message: "نقش کاربر تغییر یافت", user });

} catch (error) {
return res
.status(500)
.json({ success: false, message: "خطا در تغییر نقش" });
}
};
export const adminLogin = async (req: Request, res: Response) => {
try {
const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "شماره تلفن و رمز عبور الزامی هستند",
      });
    }

    // کاربر را همراه با نقش‌های ادمین و دسترسی‌ها پیدا کن
    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        adminRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // یا role === "admin" باشد، یا حداقل یک نقش ادمین داشته باشد
    const hasAdminRole =
      user?.role === "admin" ||
      (user?.adminRoles && user.adminRoles.length > 0);

    if (!user || !hasAdminRole) {
      return res.status(401).json({
        success: false,
        message: "اطلاعات ورود نامعتبر است یا دسترسی ادمین ندارید",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "حساب کاربری شما غیرفعال شده است",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "رمز عبور برای این حساب تنظیم نشده است",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "رمز عبور اشتباه است",
      });
    }

    // استخراج نقش‌ها و دسترسی‌ها
    const adminRoles = user.adminRoles.map((ur) => ({
      name: ur.role.name,
      displayName: ur.role.displayName,
    }));

    const permissionsSet = new Set<string>();
    user.adminRoles.forEach((ur) => {
      ur.role.rolePermissions.forEach((rp) => {
        permissionsSet.add(rp.permission.key);
      });
    });
    const permissions = Array.from(permissionsSet);

    // اگر نقش SUPER_ADMIN داشت، همه دسترسی‌ها را بده (اختیاری ولی مفید)
    const isSuperAdmin = adminRoles.some((r) => r.name === "SUPER_ADMIN");

    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role,
        adminRoles: adminRoles.map((r) => r.name),
        permissions: isSuperAdmin ? ["*"] : permissions, // * یعنی همه دسترسی‌ها
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        adminRoles,
        permissions: isSuperAdmin ? ["*"] : permissions,
      },
    });

} catch (error) {
console.error("Admin Login Error:", error);
return res.status(500).json({
success: false,
message: "خطای سرور در ورود ادمین",
});
}
};

export const toggleUserStatus = async (req: Request, res: Response) => {
try {
const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "کاربر مورد نظر یافت نشد",
      });
    }

    // جلوگیری از غیرفعال کردن خود ادمین (اختیاری)
    // if (user.role === "admin") { ... }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        isActive: !user.isActive,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
      },
    });

    return res.json({
      success: true,
      message: `حساب کاربری با موفقیت ${updatedUser.isActive ? "فعال" : "غیرفعال"} شد`,
      user: updatedUser,
    });

} catch (error) {
console.error("Toggle User Status Error:", error);
return res.status(500).json({
success: false,
message: "خطا در تغییر وضعیت کاربر",
});
}
};

export const getDashboardStats = async (req: Request, res: Response) => {
try {
const now = new Date();
const startOfToday = new Date(
now.getFullYear(),
now.getMonth(),
now.getDate(),
);
const last7Days = new Date(now);
last7Days.setDate(last7Days.getDate() - 6);
last7Days.setHours(0, 0, 0, 0);

    // ---- آمار کلی ----
    const [
      usersCount,
      projectsCount,
      activeProjects,
      activeContracts,
      todayPaymentsCount,
      newUsersToday,
      revenueAgg,
      pendingReviews,
      latestUsers,
      latestProjects,
    ] = await Promise.all([
      prisma.user.count({
        where: { deletedAt: null, role: { not: "admin" } },
      }),
      prisma.project.count({
        where: { deletedAt: null },
      }),
      prisma.project.count({
        where: {
          deletedAt: null,
          status: { in: ["open", "in_progress"] },
        },
      }),
      prisma.contract.count({
        where: { status: "active" },
      }),
      prisma.payment.count({
        where: {
          status: "paid",
          paidAt: { gte: startOfToday },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: startOfToday },
          role: { not: "admin" },
        },
      }),
      prisma.payment.aggregate({
        where: { status: "paid" },
        _sum: { amount: true },
      }),
      prisma.review.count(),
      prisma.user.findMany({
        where: { role: { not: "admin" }, deletedAt: null },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.project.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          status: true,
          province: true,
          city: true,
          createdAt: true,
          employer: {
            select: { name: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // ---- داده نمودار ۷ روز اخیر ----
    const days: { date: string; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("fa-IR", {
          month: "short",
          day: "numeric",
        }),
      });
    }

    const [usersInRange, projectsInRange, paymentsInRange] = await Promise.all([
      prisma.user.findMany({
        where: {
          createdAt: { gte: last7Days },
          role: { not: "admin" },
        },
        select: { createdAt: true },
      }),
      prisma.project.findMany({
        where: {
          createdAt: { gte: last7Days },
          deletedAt: null,
        },
        select: { createdAt: true },
      }),
      prisma.payment.findMany({
        where: {
          status: "paid",
          paidAt: { gte: last7Days },
        },
        select: { paidAt: true, amount: true },
      }),
    ]);

    const countByDay = (
      items: { createdAt?: Date | null; paidAt?: Date | null }[],
      field: "createdAt" | "paidAt",
    ) => {
      return days.map((day) => {
        const count = items.filter((item) => {
          const dateVal = field === "createdAt" ? item.createdAt : item.paidAt;
          if (!dateVal) return false;
          return dateVal.toISOString().slice(0, 10) === day.date;
        }).length;
        return { date: day.date, label: day.label, value: count };
      });
    };

    const revenueByDay = days.map((day) => {
      const sum = paymentsInRange
        .filter(
          (p) => p.paidAt && p.paidAt.toISOString().slice(0, 10) === day.date,
        )
        .reduce((acc, p) => acc + Number(p.amount), 0);
      return { date: day.date, label: day.label, value: sum };
    });

    return res.json({
      success: true,
      stats: {
        usersCount,
        projectsCount,
        activeProjects,
        activeContracts,
        todayPayments: todayPaymentsCount,
        newUsersToday,
        revenue: Number(revenueAgg._sum.amount || 0),
        pendingReviews,
        pendingReports: 0, // مدل Report هنوز نداریم
      },
      latestUsers,
      latestProjects,
      charts: {
        dailyRegistrations: countByDay(usersInRange, "createdAt"),
        dailyProjects: countByDay(projectsInRange, "createdAt"),
        dailyPayments: revenueByDay,
      },
    });

} catch (error) {
console.error("Dashboard Stats Error:", error);
return res.status(500).json({
success: false,
message: "خطا در دریافت آمار داشبورد",
});
}
};

export const publishProject = async (req: Request, res: Response) => {
try {
const project = await prisma.project.update({
where: { id: Number(req.params.id) },
data: { status: "open", publishedAt: new Date() },
select: { id: true, status: true, publishedAt: true },
});
return res.json({ success: true, message: "پروژه منتشر شد", project });
} catch (error) {
console.error("Publish Project Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در انتشار پروژه" });
}
};

export const closeProject = async (req: Request, res: Response) => {
try {
const project = await prisma.project.update({
where: { id: Number(req.params.id) },
data: { status: "completed", closedAt: new Date() },
select: { id: true, status: true, closedAt: true },
});
return res.json({ success: true, message: "پروژه بسته شد", project });
} catch (error) {
console.error("Close Project Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در بستن پروژه" });
}
};

export const toggleFeatureProject = async (req: Request, res: Response) => {
try {
const current = await prisma.project.findUnique({
where: { id: Number(req.params.id) },
select: { isFeatured: true },
});

    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "پروژه یافت نشد" });
    }

    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: { isFeatured: !current.isFeatured },
      select: { id: true, isFeatured: true },
    });

    return res.json({
      success: true,
      message: project.isFeatured
        ? "پروژه ویژه شد"
        : "پروژه از حالت ویژه خارج شد",
      project,
    });

} catch (error) {
console.error("Toggle Feature Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در تغییر وضعیت ویژه" });
}
};

// Soft delete
export const deleteProjectByAdmin = async (req: Request, res: Response) => {
try {
const project = await prisma.project.update({
where: { id: Number(req.params.id) },
data: { deletedAt: new Date(), status: "cancelled" },
select: { id: true, deletedAt: true },
});
return res.json({ success: true, message: "پروژه حذف شد", project });
} catch (error) {
console.error("Delete Project Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در حذف پروژه" });
}
};

export const getAllProposalsForAdmin = async (req: Request, res: Response) => {
try {
const proposals = await prisma.proposal.findMany({
select: {
id: true,
amount: true,
deliveryDays: true,
status: true,
createdAt: true,
freelancer: {
select: { id: true, name: true, phone: true },
},
project: {
select: { id: true, title: true },
},
},
orderBy: { createdAt: "desc" },
});

    return res.json({
      success: true,
      proposals,
    });

} catch (error) {
console.error("Get All Proposals Error:", error);
return res.status(500).json({
success: false,
message: "خطا در دریافت لیست پیشنهادها",
});
}
};

// تایید پیشنهاد → ساخت قرارداد + رد خودکار بقیه پیشنهادهای همون پروژه
export const acceptProposalForAdmin = async (req: Request, res: Response) => {
try {
const proposalId = Number(req.params.id);

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { project: true },
    });

    if (!proposal) {
      return res
        .status(404)
        .json({ success: false, message: "پیشنهاد یافت نشد" });
    }

    if (proposal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "فقط پیشنهادهای در انتظار قابل تایید هستند",
      });
    }

    const existingContract = await prisma.contract.findUnique({
      where: { projectId: proposal.projectId },
    });
    if (existingContract) {
      return res.status(400).json({
        success: false,
        message: "برای این پروژه قبلاً قرارداد ثبت شده است",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProposal = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: "accepted" },
      });

      await tx.proposal.updateMany({
        where: {
          projectId: proposal.projectId,
          id: { not: proposalId },
          status: "pending",
        },
        data: { status: "rejected" },
      });

      const contract = await tx.contract.create({
        data: {
          projectId: proposal.projectId,
          proposalId: proposal.id,
          employerId: proposal.project.employerId,
          freelancerId: proposal.freelancerId,
          totalAmount: proposal.amount,
          status: "active",
        },
      });

      await tx.project.update({
        where: { id: proposal.projectId },
        data: { status: "in_progress" },
      });

      return { updatedProposal, contract };
    });

    return res.json({
      success: true,
      message: "پیشنهاد تایید شد و قرارداد ایجاد شد",
      proposal: result.updatedProposal,
      contract: result.contract,
    });

} catch (error) {
console.error("Accept Proposal Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در تایید پیشنهاد" });
}
};

// رد پیشنهاد
export const rejectProposalForAdmin = async (req: Request, res: Response) => {
try {
const proposal = await prisma.proposal.findUnique({
where: { id: Number(req.params.id) },
});

    if (!proposal) {
      return res
        .status(404)
        .json({ success: false, message: "پیشنهاد یافت نشد" });
    }

    if (proposal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "فقط پیشنهادهای در انتظار قابل رد هستند",
      });
    }

    const updated = await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: "rejected" },
      select: { id: true, status: true },
    });

    return res.json({
      success: true,
      message: "پیشنهاد رد شد",
      proposal: updated,
    });

} catch (error) {
console.error("Reject Proposal Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در رد پیشنهاد" });
}
};

// حذف پیشنهاد (Proposal مدل soft-delete نداره، حذف واقعیه)
export const deleteProposalForAdmin = async (req: Request, res: Response) => {
try {
const proposal = await prisma.proposal.findUnique({
where: { id: Number(req.params.id) },
});

    if (!proposal) {
      return res
        .status(404)
        .json({ success: false, message: "پیشنهاد یافت نشد" });
    }

    // Contract.proposalId → onDelete: Cascade
    // یعنی اگه پیشنهاد accepted حذف بشه، قرارداد فعالش هم پاک می‌شه
    if (proposal.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "پیشنهاد تاییدشده (دارای قرارداد) قابل حذف نیست",
      });
    }

    await prisma.proposal.delete({ where: { id: proposal.id } });

    return res.json({ success: true, message: "پیشنهاد حذف شد" });

} catch (error) {
console.error("Delete Proposal Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در حذف پیشنهاد" });
}
};

// لیست قراردادها با search/filter/pagination
export const getAllContractsForAdmin = async (req: Request, res: Response) => {
try {
const {
search = "",
status,
sortBy = "newest",
page = "1",
limit = "10",
} = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);

    const where: any = {};

    if (search) {
      where.OR = [
        { employer: { name: { contains: search, mode: "insensitive" } } },
        { employer: { phone: { contains: search } } },
        { freelancer: { name: { contains: search, mode: "insensitive" } } },
        { freelancer: { phone: { contains: search } } },
        { project: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) where.status = status;

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    if (sortBy === "amount") orderBy = { totalAmount: "desc" };

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        select: {
          id: true,
          totalAmount: true,
          status: true,
          startedAt: true,
          completedAt: true,
          cancelledAt: true,
          project: { select: { id: true, title: true } },
          employer: { select: { id: true, name: true, phone: true } },
          freelancer: { select: { id: true, name: true, phone: true } },
        },
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.contract.count({ where }),
    ]);

    return res.json({
      success: true,
      contracts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });

} catch (error) {
console.error("Get All Contracts Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت لیست قراردادها" });
}
};

// جزئیات کامل یک قرارداد
export const getContractDetailForAdmin = async (
req: Request,
res: Response,
) => {
try {
const contractId = Number(req.params.id);

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: {
          select: { id: true, title: true, status: true, description: true },
        },
        employer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        freelancer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        milestones: { orderBy: { createdAt: "asc" } },
        payments: { orderBy: { createdAt: "desc" } },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true } },
            reviewed: { select: { id: true, name: true } },
          },
        },
        amendments: { orderBy: { createdAt: "desc" } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            id: true,
            content: true,
            type: true,
            fileUrl: true,
            createdAt: true,
            senderId: true,
            receiverId: true,
          },
        },
      },
    });

    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "قرارداد یافت نشد" });
    }

    return res.json({ success: true, contract });

} catch (error) {
console.error("Get Contract Detail Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت جزئیات قرارداد" });
}
};

// لغو قرارداد — فقط از حالت active
export const cancelContractByAdmin = async (req: Request, res: Response) => {
try {
const contract = await prisma.contract.findUnique({
where: { id: Number(req.params.id) },
});

    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "قرارداد یافت نشد" });
    }

    if (contract.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "فقط قرارداد فعال قابل لغو است",
      });
    }

    const [updatedContract] = await prisma.$transaction([
      prisma.contract.update({
        where: { id: contract.id },
        data: { status: "cancelled", cancelledAt: new Date() },
        select: { id: true, status: true, cancelledAt: true },
      }),
      prisma.project.update({
        where: { id: contract.projectId },
        data: { status: "cancelled", closedAt: new Date() },
      }),
    ]);

    return res.json({
      success: true,
      message: "قرارداد لغو شد",
      contract: updatedContract,
    });

} catch (error) {
console.error("Cancel Contract Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در لغو قرارداد" });
}
};

// تکمیل قرارداد — فقط از حالت active
export const completeContractByAdmin = async (req: Request, res: Response) => {
try {
const contract = await prisma.contract.findUnique({
where: { id: Number(req.params.id) },
});

    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "قرارداد یافت نشد" });
    }

    if (contract.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "فقط قرارداد فعال قابل تکمیل است",
      });
    }

    const [updatedContract] = await prisma.$transaction([
      prisma.contract.update({
        where: { id: contract.id },
        data: { status: "completed", completedAt: new Date() },
        select: { id: true, status: true, completedAt: true },
      }),
      prisma.project.update({
        where: { id: contract.projectId },
        data: { status: "completed", closedAt: new Date() },
      }),
    ]);

    return res.json({
      success: true,
      message: "قرارداد تکمیل شد",
      contract: updatedContract,
    });

} catch (error) {
console.error("Complete Contract Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در تکمیل قرارداد" });
}
};

// رفع اختلاف — فقط از حالت disputed، ادمین تصمیم نهایی رو مشخص می‌کند
export const resolveContractDisputeByAdmin = async (
req: Request,
res: Response,
) => {
try {
const { resolution } = req.body as {
resolution: "active" | "completed" | "cancelled";
};
const allowedResolutions = ["active", "completed", "cancelled"];

    if (!allowedResolutions.includes(resolution)) {
      return res.status(400).json({
        success: false,
        message: "نتیجه رفع اختلاف نامعتبر است",
      });
    }

    const contract = await prisma.contract.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "قرارداد یافت نشد" });
    }

    if (contract.status !== "disputed") {
      return res.status(400).json({
        success: false,
        message: "فقط قرارداد در وضعیت اختلاف قابل رفع است",
      });
    }

    const contractData: any = { status: resolution };
    const projectData: any = {};

    if (resolution === "completed") {
      contractData.completedAt = new Date();
      projectData.status = "completed";
      projectData.closedAt = new Date();
    } else if (resolution === "cancelled") {
      contractData.cancelledAt = new Date();
      projectData.status = "cancelled";
      projectData.closedAt = new Date();
    } else {
      // بازگشت به حالت عادی، پروژه در حال انجام باقی می‌ماند
      projectData.status = "in_progress";
    }

    const [updatedContract] = await prisma.$transaction([
      prisma.contract.update({
        where: { id: contract.id },
        data: contractData,
        select: {
          id: true,
          status: true,
          completedAt: true,
          cancelledAt: true,
        },
      }),
      prisma.project.update({
        where: { id: contract.projectId },
        data: projectData,
      }),
    ]);

    return res.json({
      success: true,
      message: "اختلاف قرارداد رفع شد",
      contract: updatedContract,
    });

} catch (error) {
console.error("Resolve Contract Dispute Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در رفع اختلاف قرارداد" });
}
};

export const getAllPaymentsForAdmin = async (req: Request, res: Response) => {
try {
const {
status,
sortBy = "newest",
page = "1",
limit = "10",
} = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);

    const where: any = {};
    if (status) where.status = status;

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    if (sortBy === "amount") orderBy = { amount: "desc" };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          amount: true,
          gateway: true,
          trackingCode: true,
          status: true,
          paidAt: true,
          createdAt: true,
          contractId: true,
          contract: {
            select: {
              id: true,
              project: { select: { id: true, title: true } },
              employer: { select: { id: true, name: true, phone: true } },
              freelancer: { select: { id: true, name: true, phone: true } },
            },
          },
        },
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.payment.count({ where }),
    ]);

    return res.json({
      success: true,
      payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });

} catch (error) {
console.error("Get All Payments Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت لیست پرداخت‌ها" });
}
};

// ---------- کمکی: پیدا کردن همه‌ی فرزندان یک دسته (برای جلوگیری از حلقه) ----------
async function getDescendantCategoryIds(categoryId: number): Promise<number[]> {
const directChildren = await prisma.category.findMany({
where: { parentId: categoryId },
select: { id: true },
});

let result: number[] = directChildren.map((c) => c.id);

for (const child of directChildren) {
const nested = await getDescendantCategoryIds(child.id);
result = result.concat(nested);
}

return result;
}

// لیست دسته‌بندی‌ها (فلت، همراه با نام والد و تعداد پروژه/فرزند)
export const getAllCategoriesForAdmin = async (req: Request, res: Response) => {
try {
const categories = await prisma.category.findMany({
include: {
parent: { select: { id: true, name: true } },
\_count: { select: { children: true, projects: true } },
},
orderBy: { createdAt: "asc" },
});

    return res.json({ success: true, categories });

} catch (error) {
console.error("Get All Categories Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت لیست دسته‌بندی‌ها" });
}
};

// ایجاد دسته‌بندی
export const createCategoryByAdmin = async (req: Request, res: Response) => {
try {
const { name, slug, description, parentId } = req.body as {
name?: string;
slug?: string;
description?: string;
parentId?: number | null;
};

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "نام و اسلاگ الزامی هستند",
      });
    }

    if (parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: Number(parentId) },
        select: { id: true },
      });
      if (!parentExists) {
        return res.status(400).json({
          success: false,
          message: "دسته‌بندی والد یافت نشد",
        });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId ? Number(parentId) : null,
      },
    });

    return res.json({
      success: true,
      message: "دسته‌بندی ایجاد شد",
      category,
    });

} catch (error: any) {
if (error?.code === "P2002") {
return res.status(400).json({
success: false,
message: "این اسلاگ قبلاً استفاده شده است",
});
}
console.error("Create Category Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در ایجاد دسته‌بندی" });
}
};

// ویرایش دسته‌بندی
export const updateCategoryByAdmin = async (req: Request, res: Response) => {
try {
const categoryId = Number(req.params.id);
const { name, slug, description, parentId } = req.body as {
name?: string;
slug?: string;
description?: string;
parentId?: number | null;
};

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "دسته‌بندی یافت نشد" });
    }

    // جلوگیری از حلقه: دسته نمی‌تواند والد خودش یا یکی از نوادگانش باشد
    if (parentId) {
      const newParentId = Number(parentId);

      if (newParentId === categoryId) {
        return res.status(400).json({
          success: false,
          message: "دسته‌بندی نمی‌تواند والد خودش باشد",
        });
      }

      const descendantIds = await getDescendantCategoryIds(categoryId);
      if (descendantIds.includes(newParentId)) {
        return res.status(400).json({
          success: false,
          message: "دسته‌بندی نمی‌تواند زیرمجموعه‌ی خودش قرار بگیرد",
        });
      }

      const parentExists = await prisma.category.findUnique({
        where: { id: newParentId },
        select: { id: true },
      });
      if (!parentExists) {
        return res.status(400).json({
          success: false,
          message: "دسته‌بندی والد یافت نشد",
        });
      }
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        parentId: parentId ? Number(parentId) : null,
      },
    });

    return res.json({
      success: true,
      message: "دسته‌بندی ویرایش شد",
      category,
    });

} catch (error: any) {
if (error?.code === "P2002") {
return res.status(400).json({
success: false,
message: "این اسلاگ قبلاً استفاده شده است",
});
}
console.error("Update Category Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در ویرایش دسته‌بندی" });
}
};

// حذف دسته‌بندی — اگر زیرمجموعه دارد، حذف مسدود می‌شود
export const deleteCategoryByAdmin = async (req: Request, res: Response) => {
try {
const categoryId = Number(req.params.id);

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { children: true } } },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "دسته‌بندی یافت نشد" });
    }

    if (existing._count.children > 0) {
      return res.status(400).json({
        success: false,
        message:
          "این دسته‌بندی دارای زیرمجموعه است. ابتدا زیرمجموعه‌ها را حذف یا جابه‌جا کنید",
      });
    }

    // پروژه‌های مرتبط با این دسته به‌خاطر onDelete: SetNull خودکار categoryId=null می‌شوند
    await prisma.category.delete({ where: { id: categoryId } });

    return res.json({ success: true, message: "دسته‌بندی حذف شد" });

} catch (error) {
console.error("Delete Category Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در حذف دسته‌بندی" });
}
};

// لیست مهارت‌ها همراه با تعداد استفاده
export const getAllSkillsForAdmin = async (req: Request, res: Response) => {
try {
const { search = "" } = req.query as Record<string, string>;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const skills = await prisma.skill.findMany({
      where,
      include: {
        _count: { select: { freelancers: true, projects: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json({ success: true, skills });

} catch (error) {
console.error("Get All Skills Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت لیست مهارت‌ها" });
}
};

// ایجاد مهارت
export const createSkillByAdmin = async (req: Request, res: Response) => {
try {
const { name, slug } = req.body as { name?: string; slug?: string };

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "نام و اسلاگ الزامی هستند",
      });
    }

    const skill = await prisma.skill.create({ data: { name, slug } });

    return res.json({ success: true, message: "مهارت ایجاد شد", skill });

} catch (error: any) {
if (error?.code === "P2002") {
return res.status(400).json({
success: false,
message: "این اسلاگ قبلاً استفاده شده است",
});
}
console.error("Create Skill Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در ایجاد مهارت" });
}
};

// ویرایش مهارت
export const updateSkillByAdmin = async (req: Request, res: Response) => {
try {
const skillId = Number(req.params.id);
const { name, slug } = req.body as { name?: string; slug?: string };

    const existing = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "مهارت یافت نشد" });
    }

    const skill = await prisma.skill.update({
      where: { id: skillId },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
      },
    });

    return res.json({ success: true, message: "مهارت ویرایش شد", skill });

} catch (error: any) {
if (error?.code === "P2002") {
return res.status(400).json({
success: false,
message: "این اسلاگ قبلاً استفاده شده است",
});
}
console.error("Update Skill Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در ویرایش مهارت" });
}
};

// حذف مهارت — روابط FreelancerSkill/ProjectSkill به‌خاطر onDelete: Cascade خودکار حذف می‌شوند
export const deleteSkillByAdmin = async (req: Request, res: Response) => {
try {
const skillId = Number(req.params.id);

    const existing = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "مهارت یافت نشد" });
    }

    await prisma.skill.delete({ where: { id: skillId } });

    return res.json({ success: true, message: "مهارت حذف شد" });

} catch (error) {
console.error("Delete Skill Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در حذف مهارت" });
}
};

// ادغام چند مهارت در یک مهارت مقصد
export const mergeSkillsByAdmin = async (req: Request, res: Response) => {
try {
const { sourceSkillIds, targetSkillId } = req.body as {
sourceSkillIds?: number[];
targetSkillId?: number;
};

    if (
      !Array.isArray(sourceSkillIds) ||
      sourceSkillIds.length === 0 ||
      !targetSkillId
    ) {
      return res.status(400).json({
        success: false,
        message: "لیست مهارت‌های مبدأ و مهارت مقصد الزامی هستند",
      });
    }

    const cleanSourceIds = sourceSkillIds
      .map((id) => Number(id))
      .filter((id) => id !== Number(targetSkillId));

    if (cleanSourceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "مهارت مقصد نمی‌تواند در لیست مبدأها باشد",
      });
    }

    const allIds = [...cleanSourceIds, Number(targetSkillId)];
    const foundSkills = await prisma.skill.findMany({
      where: { id: { in: allIds } },
      select: { id: true },
    });

    if (foundSkills.length !== allIds.length) {
      return res.status(400).json({
        success: false,
        message: "یک یا چند مهارت انتخاب‌شده یافت نشد",
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const sourceId of cleanSourceIds) {
        // ---- انتقال FreelancerSkill ----
        const freelancerLinks = await tx.freelancerSkill.findMany({
          where: { skillId: sourceId },
        });

        for (const link of freelancerLinks) {
          const alreadyHasTarget = await tx.freelancerSkill.findUnique({
            where: {
              freelancerProfileId_skillId: {
                freelancerProfileId: link.freelancerProfileId,
                skillId: Number(targetSkillId),
              },
            },
          });

          if (alreadyHasTarget) {
            // فریلنسر از قبل مهارت مقصد را دارد → رکورد تکراری مبدأ حذف می‌شود
            await tx.freelancerSkill.delete({ where: { id: link.id } });
          } else {
            await tx.freelancerSkill.update({
              where: { id: link.id },
              data: { skillId: Number(targetSkillId) },
            });
          }
        }

        // ---- انتقال ProjectSkill ----
        const projectLinks = await tx.projectSkill.findMany({
          where: { skillId: sourceId },
        });

        for (const link of projectLinks) {
          const alreadyHasTarget = await tx.projectSkill.findUnique({
            where: {
              projectId_skillId: {
                projectId: link.projectId,
                skillId: Number(targetSkillId),
              },
            },
          });

          if (alreadyHasTarget) {
            await tx.projectSkill.delete({ where: { id: link.id } });
          } else {
            await tx.projectSkill.update({
              where: { id: link.id },
              data: { skillId: Number(targetSkillId) },
            });
          }
        }

        // ---- حذف مهارت مبدأ ----
        await tx.skill.delete({ where: { id: sourceId } });
      }
    });

    return res.json({
      success: true,
      message: "مهارت‌ها با موفقیت ادغام شدند",
    });

} catch (error) {
console.error("Merge Skills Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در ادغام مهارت‌ها" });
}
};

// لیست مکالمات (هر مکالمه = یک قرارداد یا یک جفت کاربر بدون قرارداد)
export const getAllConversationsForAdmin = async (
req: Request,
res: Response,
) => {
try {
// برای جلوگیری از فشار زیاد روی دیتابیس، آخرین چند هزار پیام را می‌گیریم
// (برای پروژه‌های خیلی بزرگ بعداً باید با raw query/pagination بهینه شود)
const messages = await prisma.message.findMany({
orderBy: { createdAt: "desc" },
take: 5000,
select: {
id: true,
contractId: true,
senderId: true,
receiverId: true,
content: true,
type: true,
createdAt: true,
sender: { select: { id: true, name: true, phone: true } },
receiver: { select: { id: true, name: true, phone: true } },
contract: {
select: {
id: true,
project: { select: { id: true, title: true } },
},
},
},
});

    const seen = new Map<string, any>();

    for (const m of messages) {
      const key = m.contractId
        ? `contract-${m.contractId}`
        : `direct-${Math.min(m.senderId, m.receiverId)}-${Math.max(m.senderId, m.receiverId)}`;

      // چون پیام‌ها از جدید به قدیم مرتب شدند، اولین باری که هر کلید دیده می‌شود همان آخرین پیام است
      if (!seen.has(key)) {
        seen.set(key, {
          key,
          contractId: m.contractId,
          projectTitle: m.contract?.project?.title || null,
          userA: m.sender,
          userB: m.receiver,
          lastMessagePreview:
            m.type === "text"
              ? m.content
              : m.type === "file"
                ? "📎 فایل پیوست"
                : "پیام سیستمی",
          lastMessageAt: m.createdAt,
        });
      }
    }

    const conversations = Array.from(seen.values());

    return res.json({ success: true, conversations });

} catch (error) {
console.error("Get All Conversations Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت لیست مکالمات" });
}
};

// دریافت کل پیام‌های یک مکالمه (یا با contractId، یا با جفت userA/userB)
export const getConversationThreadForAdmin = async (
req: Request,
res: Response,
) => {
try {
const { contractId, userAId, userBId } = req.query as Record<
string,
string >;

    let where: any;

    if (contractId) {
      where = { contractId: Number(contractId) };
    } else if (userAId && userBId) {
      where = {
        contractId: null,
        OR: [
          { senderId: Number(userAId), receiverId: Number(userBId) },
          { senderId: Number(userBId), receiverId: Number(userAId) },
        ],
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "شناسه مکالمه نامعتبر است",
      });
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        type: true,
        fileUrl: true,
        readAt: true,
        createdAt: true,
        senderId: true,
        receiverId: true,
        sender: { select: { id: true, name: true, phone: true } },
        receiver: { select: { id: true, name: true, phone: true } },
      },
    });

    return res.json({ success: true, messages });

} catch (error) {
console.error("Get Conversation Thread Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت مکالمه" });
}
};
export const getAllReviewsForAdmin = async (req: Request, res: Response) => {
try {
const {
search = "",
rating,
page = "1",
limit = "10",
} = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);

    const where: any = {};

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: "insensitive" } },
        { reviewer: { name: { contains: search, mode: "insensitive" } } },
        { reviewed: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (rating) {
      where.rating = Number(rating);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          comment: true,
          target: true,
          createdAt: true,
          reviewer: { select: { id: true, name: true, phone: true } },
          reviewed: { select: { id: true, name: true, phone: true } },
          contract: {
            select: {
              id: true,
              project: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.review.count({ where }),
    ]);

    return res.json({
      success: true,
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });

} catch (error) {
console.error("Get All Reviews Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت لیست نظرات" });
}
};

// حذف واقعی — مدل Review فیلد soft-delete ندارد
export const deleteReviewByAdmin = async (req: Request, res: Response) => {
try {
const review = await prisma.review.findUnique({
where: { id: Number(req.params.id) },
});

    if (!review) {
      return res.status(404).json({ success: false, message: "نظر یافت نشد" });
    }

    await prisma.review.delete({ where: { id: review.id } });

    return res.json({ success: true, message: "نظر حذف شد" });

} catch (error) {
console.error("Delete Review Error:", error);
return res.status(500).json({ success: false, message: "خطا در حذف نظر" });
}
};

طراحی معماری فاز یازدهم و شناسایی محدودیت مدل موجود
برای فاز ۱۱، یه نکته‌ی مهم هست که باید قبل از کد اطلاعت بدم:

مشکل: مدل Review فیلدی برای «مخفی‌کردن» نداره
تو schema.prisma که قبلاً دیدیم، مدل Review این فیلدها رو داره:

prisma
model Review {
id, contractId, contract, reviewerId, reviewer,
reviewedId, reviewed, target, rating, comment, createdAt
}
هیچ فیلدی مثل isHidden یا visible نداره. یعنی اکشن Delete رو می‌تونم همین الان بسازم (چون reviews.delete هم از قبل تو seed هست)، ولی Hide نیاز به یه migration جدید داره (اضافه کردن فیلد isHidden Boolean @default(false) به مدل).

چون خودت نوشتی «اگه لازم شد»، فعلاً فقط جدول + Delete رو می‌سازم. اگه بعداً Hide رو هم خواستی، جدا بهش می‌رسیم (نیاز به migration داره).

بک‌اند — اضافه به admin.controller.ts
typescript
export const getAllReviewsForAdmin = async (req: Request, res: Response) => {
try {
const {
search = "",
rating,
page = "1",
limit = "10",
} = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);

    const where: any = {};

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: "insensitive" } },
        { reviewer: { name: { contains: search, mode: "insensitive" } } },
        { reviewed: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (rating) {
      where.rating = Number(rating);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          comment: true,
          target: true,
          createdAt: true,
          reviewer: { select: { id: true, name: true, phone: true } },
          reviewed: { select: { id: true, name: true, phone: true } },
          contract: {
            select: {
              id: true,
              project: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.review.count({ where }),
    ]);

    return res.json({
      success: true,
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });

} catch (error) {
console.error("Get All Reviews Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت لیست نظرات" });
}
};

// حذف واقعی — مدل Review فیلد soft-delete ندارد
export const deleteReviewByAdmin = async (req: Request, res: Response) => {
try {
const review = await prisma.review.findUnique({
where: { id: Number(req.params.id) },
});

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "نظر یافت نشد" });
    }

    await prisma.review.delete({ where: { id: review.id } });

    return res.json({ success: true, message: "نظر حذف شد" });

} catch (error) {
console.error("Delete Review Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در حذف نظر" });
}
};
بک‌اند — اضافه به admin.routes.ts
typescript
import {
getAllReviewsForAdmin,
deleteReviewByAdmin,
} from "../controllers/admin.controller";

router.get(
"/reviews",
authMiddleware,
requirePermission("reviews.view"),
getAllReviewsForAdmin,
);

router.delete(
"/reviews/:id",
authMiddleware,
requirePermission("reviews.delete"),
deleteReviewByAdmin,
);
هردو permission (reviews.view, reviews.delete) از قبل تو seed.ts هستن و به ADMIN, SUPPORT (فقط view), MODERATOR وصل شدن — نیازی به تغییر seed نیست.

فرانت — اضافه به admin.service.ts
typescript
export const getAllReviewsApi = async (params: {
search?: string
rating?: number
page?: number
limit?: number
} = {}) => {
const response = await api.get('/admin/reviews', { params })
return response.data
}

export const deleteReviewApi = async (id: number) => {
const response = await api.delete(`/admin/reviews/${id}`)
return response.data
}
فرانت — فایل جدید AdminReviewPage.vue
vue

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getAllReviewsApi, deleteReviewApi } from '@/services/admin.service'
import AdminSearch from '@/components/admin/ui/AdminSearch.vue'
import AdminFilter from '@/components/admin/ui/AdminFilter.vue'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import Pagination from '@/components/admin/ui/Pagination.vue'
import ConfirmModal from '@/components/admin/ui/ConfirmModal.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'

const reviews = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const ratingFilter = ref<string | number | null>(null)
const page = ref(1)
const limit = 10
const totalItems = ref(0)
const totalPages = ref(1)

const ratingOptions = [
  { label: '⭐ 1', value: 1 },
  { label: '⭐ 2', value: 2 },
  { label: '⭐ 3', value: 3 },
  { label: '⭐ 4', value: 4 },
  { label: '⭐ 5', value: 5 },
]

async function fetchReviews() {
  loading.value = true
  try {
    const data = await getAllReviewsApi({
      search: search.value || undefined,
      rating: ratingFilter.value ? Number(ratingFilter.value) : undefined,
      page: page.value,
      limit,
    } as any)
    if (data?.success) {
      reviews.value = data.reviews || []
      totalItems.value = data.pagination?.total || 0
      totalPages.value = data.pagination?.totalPages || 1
    }
  } catch (error) {
    console.error('خطا در دریافت نظرات:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchReviews)

watch([search, ratingFilter], () => {
  page.value = 1
  fetchReviews()
})
watch(page, fetchReviews)

const showDeleteModal = ref(false)
const deleteTargetId = ref<number | null>(null)

function askDelete(id: number) {
  deleteTargetId.value = id
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deleteTargetId.value) return
  const res = await deleteReviewApi(deleteTargetId.value)
  if (res?.success) fetchReviews()
  showDeleteModal.value = false
}

const columns: TableColumn[] = [
  { key: 'reviewer', label: 'نظردهنده' },
  { key: 'reviewed', label: 'نظرگیرنده' },
  { key: 'rating', label: 'امتیاز', align: 'center' },
  { key: 'comment', label: 'نظر' },
  { key: 'actions', label: 'عملیات', align: 'center' },
]

const rows = computed(() =>
  reviews.value.map((r) => ({
    id: r.id,
    reviewer: r.reviewer?.name || r.reviewer?.phone || '—',
    reviewed: r.reviewed?.name || r.reviewed?.phone || '—',
    rating: '⭐'.repeat(r.rating),
    comment: r.comment || '—',
  })),
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">مدیریت نظرات</h1>
        <p class="text-xs text-gray-400 mt-1">فهرست تمام نظرات ثبت‌شده در پلتفرم</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-3 lg:items-end">
        <div class="lg:w-80">
          <AdminSearch v-model="search" placeholder="جستجو در نظرات یا نام کاربران..." />
        </div>
        <AdminFilter
          v-model="ratingFilter"
          label="امتیاز"
          :options="ratingOptions"
          placeholder="همه امتیازها"
        />
      </div>

      <AdminTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        empty-text="نظری یافت نشد"
      >
        <template #cell-actions="{ row }">
          <div class="flex justify-center" @click.stop>
            <button
              class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[11px] font-medium"
              @click="askDelete(row.id)"
            >
              حذف
            </button>
          </div>
        </template>
      </AdminTable>

      <Pagination
        v-model:page="page"
        :total-pages="totalPages"
        :total-items="totalItems"
        :per-page="limit"
      />
    </div>

    <ConfirmModal
      v-model="showDeleteModal"
      title="حذف نظر"
      message="آیا از حذف این نظر مطمئن هستید؟ این عمل قابل بازگشت نیست."
      confirm-text="حذف کن"
      variant="danger"
      @confirm="confirmDelete"
    />

  </div>
</template>
router/index.ts — اضافه به children ادمین
۱. ایمپورت:

typescript
import AdminReviewPage from '../pages/AdminReviewPage.vue'
۲. روت جدید:

typescript
{
path: 'reviews',
component: AdminReviewPage,
meta: { permission: 'reviews.view' },
},
خلاصه‌ی این قدم
admin.controller.ts → دو تابع (getAllReviewsForAdmin, deleteReviewByAdmin)
admin.routes.ts → دو روت
admin.service.ts → دو تابع API
فایل جدید AdminReviewPage.vue
router/index.ts → یک ایمپورت + یک روت
تست
برو به /admin/reviews (که الان دیگه صفحه‌ی سفید نمی‌بینی) → باید جدولی با نظردهنده، نظرگیرنده، امتیاز (ستاره)، و متن نظر ببینی
فیلتر امتیاز رو امتحان کن
روی «حذف» کلیک کن → مودال تأیید باز بشه، بعد از تأیید نظر از لیست بره
بعد از این، فقط دو لینک سایدبار (reports, settings) بی‌صفحه می‌مونن. تست کن و بگو نتیجه چی شد.

Message collapsed

معماری فایل‌ها و رابط کاربری را تحلیل کرد
معماری فایل‌ها و رابط کاربری را تحلیل کرد
برای فاز ۱۲، قبل از کد زدن، دو چیز لازم دارم:

فایل مورد نیاز
backend/src/server.ts — چون باید ببینم پوشه‌ی uploads چطور static سرو می‌شه (مثلاً app.use('/uploads', express.static(...))) تا بفهمم لینک preview/download باید دقیقاً چه شکلی ساخته بشه (base URL + مسیر).

دو تا نکته‌ی مهم که باید روشن بشه
۱. «Avatar» یه مدل جدا نیست
برخلاف ProjectAttachment که یه جدول کامل داره (fileName, fileUrl, fileType, fileSize, projectId)، آواتار فقط یه فیلد سادۀ avatar: String? رو مدل User هست. یعنی:

لیست «همه‌ی آواتارها» یعنی همه‌ی کاربرانی که avatar غیر خالی دارن
«حذف آواتار» یعنی avatar رو null کنیم (نه حذف یه رکورد جدا)
هیچ‌جا fileSize یا fileType برای آواتار ذخیره نشده — پس تو جدول این ستون‌ها برای ردیف‌های آواتار خالی می‌مونن
۲. حذف فایل از دیسک یا فقط از دیتابیس؟
