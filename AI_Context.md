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

enum ReportTargetType {
user
project
message
review
proposal
}

enum ReportStatus {
pending
reviewing
resolved
rejected
dismissed
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

enum NotificationType {
new_user
new_project
new_proposal
payment_received
contract_amendment
contract_dispute
new_report
system
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
activityLogs ActivityLog[] @relation("AdminActivityLogs")
otps OTP[]
reportsCreated Report[] @relation("ReportsCreated")
reportsResolvedc Report[] @relation("ReportsResolved")
// 🌟 روابط جدید برای سیستم Permission
adminRoles UserAdminRole[]

@@index([phone])
@@index([email])
@@index([role])
@@index([province, city])
@@index([isActive])
}

model Notification {
id Int @id @default(autoincrement())
type NotificationType
title String // عنوان کوتاه
message String // متن اعلان
link String? // لینک به صفحه مرتبط (مثلاً /admin/users/12)
isRead Boolean @default(false)
metadata Json? // اطلاعات اضافی (userId, projectId و ...)

// اگر بخواهی اعلان فقط برای نقش خاصی باشد (اختیاری)
// targetRole AdminRoleName?

createdAt DateTime @default(now())

@@index([isRead])
@@index([type])
@@index([createdAt])
}

model Setting {
id Int @id @default(autoincrement())
key String @unique
value String
label String?
type String @default("text") // text | number | boolean | email | phone
group String? @default("general")
updatedAt DateTime @updatedAt
updatedBy Int?

@@index([group])
@@index([key])
}

model Report {
id Int @id @default(autoincrement())
reporterId Int
reporter User @relation("ReportsCreated", fields: [reporterId], references: [id], onDelete: Cascade)

// هدف گزارش (یکی از این‌ها پر می‌شود)
targetType ReportTargetType
targetId Int // id کاربر / پروژه / پیام و ...

reason String // دلیل کوتاه (مثلاً "محتوای نامناسب")
description String? // توضیح بیشتر
status ReportStatus @default(pending)

// ادمینی که رسیدگی کرده
resolvedBy Int?
resolver User? @relation("ReportsResolved", fields: [resolvedBy], references: [id], onDelete: SetNull)
resolvedAt DateTime?
adminNote String? // یادداشت ادمین

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([targetType, targetId])
@@index([status])
@@index([reporterId])
@@index([createdAt])
}

model ActivityLog {
id Int @id @default(autoincrement())
adminId Int
admin User @relation("AdminActivityLogs", fields: [adminId], references: [id], onDelete: Cascade)

action String // مثلاً: "user.deactivate", "project.delete", "contract.cancel"
targetType String? // "user" | "project" | "contract" | "proposal" | "payment" | "review" | "report" | ...
targetId Int?

description String // متن خوانا: "ادمین پروژه «نقشه‌برداری X» را حذف کرد"
metadata Json? // اطلاعات اضافی (اختیاری)

ipAddress String?
userAgent String?

createdAt DateTime @default(now())

@@index([adminId])
@@index([action])
@@index([targetType, targetId])
@@index([createdAt])
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

// ============================================================
// ۶. تنظیمات سایت (Settings)
// ============================================================
const defaultSettings = [
{
key: "site_name",
value: "ژئوکار",
label: "نام سایت",
type: "text",
group: "general",
},
{
key: "support_phone",
value: "021-12345678",
label: "تلفن پشتیبانی",
type: "phone",
group: "general",
},
{
key: "support_email",
value: "support@geokar.ir",
label: "ایمیل پشتیبانی",
type: "email",
group: "general",
},
{
key: "default_commission",
value: "10",
label: "کمیسیون پیش‌فرض (درصد)",
type: "number",
group: "financial",
},
{
key: "min_withdrawal",
value: "100000",
label: "حداقل مبلغ برداشت (تومان)",
type: "number",
group: "financial",
},
{
key: "maintenance_mode",
value: "false",
label: "حالت تعمیر و نگهداری",
type: "boolean",
group: "system",
},
];

for (const s of defaultSettings) {
await prisma.setting.upsert({
where: { key: s.key },
update: {},
create: s,
});
}
console.log("✅ تنظیمات پیش‌فرض اضافه شدند.");

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

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { logAdminActivity, getAdminId } from "../utils/activityLog";

// ==============================
// لاگ فعالیت‌ها (فاز ۱۴)
// ==============================

export const getAllActivityLogsForAdmin = async (
req: Request,
res: Response,
) => {
try {
const {
search = "",
action,
targetType,
adminId,
page = "1",
limit = "20",
} = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));

    const where: any = {};

    if (action) where.action = action;
    if (targetType) where.targetType = targetType;
    if (adminId) where.adminId = Number(adminId);

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { admin: { name: { contains: search, mode: "insensitive" } } },
        { admin: { phone: { contains: search } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          targetType: true,
          targetId: true,
          description: true,
          metadata: true,
          ipAddress: true,
          createdAt: true,
          admin: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return res.json({
      success: true,
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });

} catch (error) {
console.error("Get Activity Logs Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت لاگ فعالیت‌ها" });
}
};

// ==============================
// مدیریت فایل‌ها (فاز ۱۲)
// ==============================

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

function tryDeletePhysicalFile(fileUrlOrPath: string | null | undefined) {
if (!fileUrlOrPath) return;
try {
let relative = fileUrlOrPath.replace(/^\/+/, "");
if (relative.startsWith("uploads/")) {
relative = relative.slice("uploads/".length);
}
const fullPath = path.join(UPLOADS_ROOT, relative);
if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
fs.unlinkSync(fullPath);
}
} catch (err) {
console.warn("Could not delete physical file:", fileUrlOrPath, err);
}
}

export const getAllFilesForAdmin = async (req: Request, res: Response) => {
try {
const {
search = "",
type,
page = "1",
limit = "20",
} = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));

    const results: any[] = [];

    // ---- ۱. آواتارها ----
    if (!type || type === "avatar") {
      const whereUser: any = {
        avatar: { not: null },
        deletedAt: null,
      };
      if (search) {
        whereUser.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const users = await prisma.user.findMany({
        where: whereUser,
        select: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      for (const u of users) {
        results.push({
          id: u.id,
          type: "avatar",
          fileName: u.avatar?.split("/").pop() || "avatar",
          fileUrl: u.avatar,
          fileType: null,
          fileSize: null,
          relatedId: u.id,
          relatedTitle: u.name || u.phone || `User #${u.id}`,
          relatedType: "user",
          createdAt: u.createdAt,
        });
      }
    }

    // ---- ۲. پیوست‌های پروژه ----
    if (!type || type === "attachment") {
      const whereAtt: any = {};
      if (search) {
        whereAtt.OR = [
          { fileName: { contains: search, mode: "insensitive" } },
          { project: { title: { contains: search, mode: "insensitive" } } },
        ];
      }

      const attachments = await prisma.projectAttachment.findMany({
        where: whereAtt,
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileType: true,
          fileSize: true,
          createdAt: true,
          project: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      for (const a of attachments) {
        results.push({
          id: a.id,
          type: "attachment",
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileType: a.fileType,
          fileSize: a.fileSize,
          relatedId: a.project?.id,
          relatedTitle: a.project?.title || `Project #${a.project?.id}`,
          relatedType: "project",
          createdAt: a.createdAt,
        });
      }
    }

    results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = results.length;
    const start = (pageNum - 1) * limitNum;
    const paged = results.slice(start, start + limitNum);

    return res.json({
      success: true,
      files: paged,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });

} catch (error) {
console.error("Get All Files Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت لیست فایل‌ها" });
}
};

export const deleteFileByAdmin = async (req: Request, res: Response) => {
try {
const { type, id } = req.params;
const numId = Number(id);

    if (!["avatar", "attachment"].includes(type) || isNaN(numId)) {
      return res
        .status(400)
        .json({ success: false, message: "پارامترهای نامعتبر" });
    }

    if (type === "avatar") {
      const user = await prisma.user.findUnique({
        where: { id: numId },
        select: { id: true, avatar: true, name: true, phone: true },
      });
      if (!user || !user.avatar) {
        return res
          .status(404)
          .json({ success: false, message: "آواتار یافت نشد" });
      }

      tryDeletePhysicalFile(user.avatar);

      await prisma.user.update({
        where: { id: numId },
        data: { avatar: null },
      });

      // لاگ
      const adminId = getAdminId(req);
      if (adminId) {
        await logAdminActivity({
          adminId,
          action: "file.delete",
          targetType: "avatar",
          targetId: numId,
          description: `ادمین آواتار کاربر «${user.name || user.phone}» را حذف کرد`,
          req,
        });
      }

      return res.json({ success: true, message: "آواتار حذف شد" });
    }

    // attachment
    const attachment = await prisma.projectAttachment.findUnique({
      where: { id: numId },
      include: { project: { select: { id: true, title: true } } },
    });
    if (!attachment) {
      return res
        .status(404)
        .json({ success: false, message: "فایل پیوست یافت نشد" });
    }

    tryDeletePhysicalFile(attachment.fileUrl);

    await prisma.projectAttachment.delete({ where: { id: numId } });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "file.delete",
        targetType: "attachment",
        targetId: numId,
        description: `ادمین فایل پیوست «${attachment.fileName}» از پروژه «${attachment.project?.title || attachment.projectId}» را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "فایل پیوست حذف شد" });

} catch (error) {
console.error("Delete File Error:", error);
return res.status(500).json({ success: false, message: "خطا در حذف فایل" });
}
};

// ==============================
// مدیریت کاربران
// ==============================

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
select: { id: true, name: true, phone: true, isVerified: true },
});

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "user.verify",
        targetType: "user",
        targetId: user.id,
        description: `ادمین کاربر «${user.name || user.phone}» را تأیید کرد`,
        req,
      });
    }

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
select: { id: true, name: true, phone: true, deletedAt: true },
});

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "user.delete",
        targetType: "user",
        targetId: user.id,
        description: `ادمین کاربر «${user.name || user.phone}» را حذف کرد`,
        req,
      });
    }

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

    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { password: hashed },
      select: { id: true, name: true, phone: true },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "user.reset_password",
        targetType: "user",
        targetId: user.id,
        description: `ادمین رمز عبور کاربر «${user.name || user.phone}» را بازنشانی کرد`,
        req,
      });
    }

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
      select: { id: true, name: true, phone: true, role: true },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "user.change_role",
        targetType: "user",
        targetId: user.id,
        description: `ادمین نقش کاربر «${user.name || user.phone}» را به «${role}» تغییر داد`,
        metadata: { newRole: role },
        req,
      });
    }

    return res.json({ success: true, message: "نقش کاربر تغییر یافت", user });

} catch (error) {
return res
.status(500)
.json({ success: false, message: "خطا در تغییر نقش" });
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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: updatedUser.isActive ? "user.activate" : "user.deactivate",
        targetType: "user",
        targetId: updatedUser.id,
        description: `ادمین حساب «${updatedUser.name || updatedUser.phone}» را ${updatedUser.isActive ? "فعال" : "غیرفعال"} کرد`,
        req,
      });
    }

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

export const adminLogin = async (req: Request, res: Response) => {
try {
const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "شماره تلفن و رمز عبور الزامی هستند",
      });
    }

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

    const isSuperAdmin = adminRoles.some((r) => r.name === "SUPER_ADMIN");

    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role,
        adminRoles: adminRoles.map((r) => r.name),
        permissions: isSuperAdmin ? ["*"] : permissions,
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

// ==============================
// داشبورد
// ==============================

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

    const [
      usersCount,
      projectsCount,
      activeProjects,
      activeContracts,
      todayPaymentsCount,
      newUsersToday,
      revenueAgg,
      pendingReviews,
      pendingReports,
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
      prisma.report.count({ where: { status: "pending" } }),
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
        pendingReports,
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

// ==============================
// مدیریت پروژه‌ها
// ==============================

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

export const publishProject = async (req: Request, res: Response) => {
try {
const project = await prisma.project.update({
where: { id: Number(req.params.id) },
data: { status: "open", publishedAt: new Date() },
select: { id: true, title: true, status: true, publishedAt: true },
});

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "project.publish",
        targetType: "project",
        targetId: project.id,
        description: `ادمین پروژه «${project.title || project.id}» را منتشر کرد`,
        req,
      });
    }

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
select: { id: true, title: true, status: true, closedAt: true },
});

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "project.close",
        targetType: "project",
        targetId: project.id,
        description: `ادمین پروژه «${project.title || project.id}» را بست`,
        req,
      });
    }

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
select: { id: true, title: true, isFeatured: true },
});

    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "پروژه یافت نشد" });
    }

    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: { isFeatured: !current.isFeatured },
      select: { id: true, title: true, isFeatured: true },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: project.isFeatured ? "project.feature" : "project.unfeature",
        targetType: "project",
        targetId: project.id,
        description: project.isFeatured
          ? `ادمین پروژه «${project.title || project.id}» را ویژه کرد`
          : `ادمین پروژه «${project.title || project.id}» را از حالت ویژه خارج کرد`,
        req,
      });
    }

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
select: { id: true, title: true, deletedAt: true },
});

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "project.delete",
        targetType: "project",
        targetId: project.id,
        description: `ادمین پروژه «${project.title || project.id}» را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "پروژه حذف شد", project });

} catch (error) {
console.error("Delete Project Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در حذف پروژه" });
}
};

// ==============================
// مدیریت پیشنهادها
// ==============================

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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "proposal.accept",
        targetType: "proposal",
        targetId: proposalId,
        description: `ادمین پیشنهاد #${proposalId} را تأیید کرد و قرارداد #${result.contract.id} ایجاد شد`,
        metadata: {
          contractId: result.contract.id,
          projectId: proposal.projectId,
        },
        req,
      });
    }

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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "proposal.reject",
        targetType: "proposal",
        targetId: proposal.id,
        description: `ادمین پیشنهاد #${proposal.id} را رد کرد`,
        req,
      });
    }

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

    if (proposal.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "پیشنهاد تاییدشده (دارای قرارداد) قابل حذف نیست",
      });
    }

    await prisma.proposal.delete({ where: { id: proposal.id } });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "proposal.delete",
        targetType: "proposal",
        targetId: proposal.id,
        description: `ادمین پیشنهاد #${proposal.id} را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "پیشنهاد حذف شد" });

} catch (error) {
console.error("Delete Proposal Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در حذف پیشنهاد" });
}
};

// ==============================
// مدیریت قراردادها
// ==============================

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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "contract.cancel",
        targetType: "contract",
        targetId: contract.id,
        description: `ادمین قرارداد #${contract.id} را لغو کرد`,
        req,
      });
    }

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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "contract.complete",
        targetType: "contract",
        targetId: contract.id,
        description: `ادمین قرارداد #${contract.id} را تکمیل کرد`,
        req,
      });
    }

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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "contract.resolve_dispute",
        targetType: "contract",
        targetId: contract.id,
        description: `ادمین اختلاف قرارداد #${contract.id} را با نتیجه «${resolution}» رفع کرد`,
        metadata: { resolution },
        req,
      });
    }

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

// ==============================
// مدیریت پرداخت‌ها
// ==============================

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

// ==============================
// مدیریت دسته‌بندی‌ها
// ==============================

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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "category.create",
        targetType: "category",
        targetId: category.id,
        description: `ادمین دسته‌بندی «${category.name}» را ایجاد کرد`,
        req,
      });
    }

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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "category.update",
        targetType: "category",
        targetId: category.id,
        description: `ادمین دسته‌بندی «${category.name}» را ویرایش کرد`,
        req,
      });
    }

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

    await prisma.category.delete({ where: { id: categoryId } });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "category.delete",
        targetType: "category",
        targetId: categoryId,
        description: `ادمین دسته‌بندی «${existing.name}» را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "دسته‌بندی حذف شد" });

} catch (error) {
console.error("Delete Category Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در حذف دسته‌بندی" });
}
};

// ==============================
// مدیریت مهارت‌ها
// ==============================

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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "skill.create",
        targetType: "skill",
        targetId: skill.id,
        description: `ادمین مهارت «${skill.name}» را ایجاد کرد`,
        req,
      });
    }

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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "skill.update",
        targetType: "skill",
        targetId: skill.id,
        description: `ادمین مهارت «${skill.name}» را ویرایش کرد`,
        req,
      });
    }

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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "skill.delete",
        targetType: "skill",
        targetId: skillId,
        description: `ادمین مهارت «${existing.name}» را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "مهارت حذف شد" });

} catch (error) {
console.error("Delete Skill Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در حذف مهارت" });
}
};

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
      select: { id: true, name: true },
    });

    if (foundSkills.length !== allIds.length) {
      return res.status(400).json({
        success: false,
        message: "یک یا چند مهارت انتخاب‌شده یافت نشد",
      });
    }

    const targetSkill = foundSkills.find((s) => s.id === Number(targetSkillId));

    await prisma.$transaction(async (tx) => {
      for (const sourceId of cleanSourceIds) {
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
            await tx.freelancerSkill.delete({ where: { id: link.id } });
          } else {
            await tx.freelancerSkill.update({
              where: { id: link.id },
              data: { skillId: Number(targetSkillId) },
            });
          }
        }

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

        await tx.skill.delete({ where: { id: sourceId } });
      }
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "skill.merge",
        targetType: "skill",
        targetId: Number(targetSkillId),
        description: `ادمین ${cleanSourceIds.length} مهارت را در «${targetSkill?.name || targetSkillId}» ادغام کرد`,
        metadata: { sourceSkillIds: cleanSourceIds, targetSkillId },
        req,
      });
    }

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

// ==============================
// مدیریت پیام‌ها
// ==============================

export const getAllConversationsForAdmin = async (
req: Request,
res: Response,
) => {
try {
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

// ==============================
// مدیریت نظرات
// ==============================

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

export const deleteReviewByAdmin = async (req: Request, res: Response) => {
try {
const review = await prisma.review.findUnique({
where: { id: Number(req.params.id) },
});

    if (!review) {
      return res.status(404).json({ success: false, message: "نظر یافت نشد" });
    }

    await prisma.review.delete({ where: { id: review.id } });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "review.delete",
        targetType: "review",
        targetId: review.id,
        description: `ادمین نظر #${review.id} را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "نظر حذف شد" });

} catch (error) {
console.error("Delete Review Error:", error);
return res.status(500).json({ success: false, message: "خطا در حذف نظر" });
}
};

// ==============================
// مدیریت گزارش‌ها (فاز ۱۳)
// ==============================

export const getAllReportsForAdmin = async (req: Request, res: Response) => {
try {
const {
search = "",
status,
targetType,
page = "1",
limit = "10",
} = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);

    const where: any = {};

    if (status) where.status = status;
    if (targetType) where.targetType = targetType;

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { reporter: { name: { contains: search, mode: "insensitive" } } },
        { reporter: { phone: { contains: search } } },
      ];
    }

    const [reports, total, statusCounts] = await Promise.all([
      prisma.report.findMany({
        where,
        select: {
          id: true,
          targetType: true,
          targetId: true,
          reason: true,
          description: true,
          status: true,
          adminNote: true,
          resolvedAt: true,
          createdAt: true,
          reporter: {
            select: { id: true, name: true, phone: true },
          },
          resolver: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.report.count({ where }),
      prisma.report.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const stats = {
      pending: 0,
      reviewing: 0,
      resolved: 0,
      rejected: 0,
      dismissed: 0,
    };
    statusCounts.forEach((item) => {
      stats[item.status as keyof typeof stats] = item._count.status;
    });

    return res.json({
      success: true,
      reports,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });

} catch (error) {
console.error("Get All Reports Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت لیست گزارش‌ها" });
}
};

export const getReportDetailForAdmin = async (req: Request, res: Response) => {
try {
const reportId = Number(req.params.id);

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        resolver: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "گزارش یافت نشد" });
    }

    let targetInfo: any = null;

    if (report.targetType === "user") {
      targetInfo = await prisma.user.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
        },
      });
    } else if (report.targetType === "project") {
      targetInfo = await prisma.project.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          title: true,
          status: true,
          province: true,
          employer: { select: { id: true, name: true, phone: true } },
        },
      });
    } else if (report.targetType === "message") {
      targetInfo = await prisma.message.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          content: true,
          type: true,
          createdAt: true,
          sender: { select: { id: true, name: true, phone: true } },
          receiver: { select: { id: true, name: true, phone: true } },
        },
      });
    } else if (report.targetType === "review") {
      targetInfo = await prisma.review.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          rating: true,
          comment: true,
          reviewer: { select: { id: true, name: true } },
          reviewed: { select: { id: true, name: true } },
        },
      });
    } else if (report.targetType === "proposal") {
      targetInfo = await prisma.proposal.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          amount: true,
          status: true,
          freelancer: { select: { id: true, name: true, phone: true } },
          project: { select: { id: true, title: true } },
        },
      });
    }

    return res.json({
      success: true,
      report: { ...report, targetInfo },
    });

} catch (error) {
console.error("Get Report Detail Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت جزئیات گزارش" });
}
};

export const updateReportStatusByAdmin = async (
req: Request,
res: Response,
) => {
try {
const reportId = Number(req.params.id);
const { status, adminNote } = req.body as {
status?: string;
adminNote?: string;
};

    const allowedStatuses = [
      "pending",
      "reviewing",
      "resolved",
      "rejected",
      "dismissed",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "وضعیت نامعتبر است" });
    }

    const existing = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "گزارش یافت نشد" });
    }

    const adminId = getAdminId(req);

    const data: any = {};
    if (status) data.status = status;
    if (adminNote !== undefined) data.adminNote = adminNote;

    if (
      status &&
      ["resolved", "rejected", "dismissed"].includes(status) &&
      existing.status !== status
    ) {
      data.resolvedBy = adminId;
      data.resolvedAt = new Date();
    }

    if (status === "pending") {
      data.resolvedBy = null;
      data.resolvedAt = null;
    }

    const report = await prisma.report.update({
      where: { id: reportId },
      data,
      select: {
        id: true,
        status: true,
        adminNote: true,
        resolvedAt: true,
        resolvedBy: true,
      },
    });

    // لاگ
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "report.update_status",
        targetType: "report",
        targetId: reportId,
        description: `ادمین وضعیت گزارش #${reportId} را به «${status || existing.status}» تغییر داد`,
        metadata: { newStatus: status, adminNote },
        req,
      });
    }

    return res.json({
      success: true,
      message: "وضعیت گزارش به‌روزرسانی شد",
      report,
    });

} catch (error) {
console.error("Update Report Status Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در به‌روزرسانی گزارش" });
}
};

export const deleteReportByAdmin = async (req: Request, res: Response) => {
try {
const report = await prisma.report.findUnique({
where: { id: Number(req.params.id) },
});

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "گزارش یافت نشد" });
    }

    await prisma.report.delete({ where: { id: report.id } });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "report.delete",
        targetType: "report",
        targetId: report.id,
        description: `ادمین گزارش #${report.id} را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "گزارش حذف شد" });

} catch (error) {
console.error("Delete Report Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در حذف گزارش" });
}
};

// ==============================
// تنظیمات سایت (فاز ۱۵)
// ==============================

export const getAllSettingsForAdmin = async (req: Request, res: Response) => {
try {
const settings = await prisma.setting.findMany({
orderBy: [{ group: "asc" }, { id: "asc" }],
});

    // گروه‌بندی برای فرانت
    const grouped: Record<string, any[]> = {};
    for (const s of settings) {
      const g = s.group || "general";
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(s);
    }

    return res.json({
      success: true,
      settings,
      grouped,
    });

} catch (error) {
console.error("Get Settings Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت تنظیمات" });
}
};

export const updateSettingsByAdmin = async (req: Request, res: Response) => {
try {
const { settings } = req.body as {
settings?: { key: string; value: string }[];
};

    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "لیست تنظیمات الزامی است",
      });
    }

    const adminId = getAdminId(req);
    const updatedKeys: string[] = [];

    await prisma.$transaction(async (tx) => {
      for (const item of settings) {
        if (!item.key) continue;

        await tx.setting.upsert({
          where: { key: item.key },
          update: {
            value: String(item.value ?? ""),
            updatedBy: adminId,
          },
          create: {
            key: item.key,
            value: String(item.value ?? ""),
            updatedBy: adminId,
          },
        });

        updatedKeys.push(item.key);
      }
    });

    // لاگ
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "settings.update",
        targetType: "settings",
        description: `ادمین تنظیمات سایت را به‌روزرسانی کرد (${updatedKeys.join(", ")})`,
        metadata: { keys: updatedKeys },
        req,
      });
    }

    // برگرداندن تنظیمات جدید
    const allSettings = await prisma.setting.findMany({
      orderBy: [{ group: "asc" }, { id: "asc" }],
    });

    return res.json({
      success: true,
      message: "تنظیمات با موفقیت ذخیره شد",
      settings: allSettings,
    });

} catch (error) {
console.error("Update Settings Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در ذخیره تنظیمات" });
}
};

// ==============================
// اعلان‌ها (فاز ۱۶)
// ==============================

export const getAllNotificationsForAdmin = async (
req: Request,
res: Response,
) => {
try {
const {
isRead,
type,
page = "1",
limit = "20",
} = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));

    const where: any = {};
    if (isRead === "true") where.isRead = true;
    if (isRead === "false") where.isRead = false;
    if (type) where.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { isRead: false } }),
    ]);

    return res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });

} catch (error) {
console.error("Get Notifications Error:", error);
return res
.status(500)
.json({ success: false, message: "خطا در دریافت اعلان‌ها" });
}
};

export const markNotificationRead = async (req: Request, res: Response) => {
try {
const id = Number(req.params.id);

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
      select: { id: true, isRead: true },
    });

    return res.json({ success: true, notification });

} catch (error) {
return res
.status(500)
.json({ success: false, message: "خطا در علامت‌گذاری اعلان" });
}
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
try {
await prisma.notification.updateMany({
where: { isRead: false },
data: { isRead: true },
});

    return res.json({ success: true, message: "همه اعلان‌ها خوانده شدند" });

} catch (error) {
return res
.status(500)
.json({ success: false, message: "خطا در علامت‌گذاری همه اعلان‌ها" });
}
};

export const deleteNotificationByAdmin = async (
req: Request,
res: Response,
) => {
try {
await prisma.notification.delete({
where: { id: Number(req.params.id) },
});

    return res.json({ success: true, message: "اعلان حذف شد" });

} catch (error) {
return res
.status(500)
.json({ success: false, message: "خطا در حذف اعلان" });
}
};

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth.middleware";

/\*\*

- ارسال رمز یکبار مصرف (OTP)
  \*/
  export const sendOtp = async (req: Request, res: Response) => {
  try {
  const { phone } = req.body;

      // 🌟 1. پاکسازی کدهای قبلی این شماره برای جلوگیری از انباشتگی در دیتابیس
      await prisma.oTP.deleteMany({
        where: { phone },
      });

      // تولید کد ۶ رقمی فرضی (در آینده با پنل پیامکی جایگزین شود)
      const otp = "123456";

      // 🌟 2. ایجاد کد جدید
      await prisma.oTP.create({
        data: {
          phone,
          code: otp,
          expiresAt: new Date(Date.now() + 2 * 60 * 1000), // اعتبار ۲ دقیقه
        },
      });

      return res.json({
        success: true,
        message: "کد تایید ارسال شد",
      });

  } catch (error) {
  console.error("Send OTP Error:", error);
  return res.status(500).json({ success: false, message: "خطای سرور" });
  }
  };

/\*\*

- تایید رمز یکبار مصرف و ورود/ثبت‌نام کاربر
  \*/
  export const verifyOtp = async (req: Request, res: Response) => {
  try {
  const { phone, code } = req.body;

      if (!phone || !code) {
        return res.status(400).json({
          success: false,
          message: "شماره تلفن و کد تایید الزامی هستند",
        });
      }

      const otpRecord = await prisma.oTP.findFirst({
        where: { phone, code },
        orderBy: { createdAt: "desc" },
      });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: "کد تایید نامعتبر است",
        });
      }

      if (otpRecord.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          message: "کد تایید منقضی شده است",
        });
      }

      // بررسی وجود کاربر یا ایجاد کاربر جدید
      let user = await prisma.user.findUnique({
        where: { phone },
      });

      let isNewUser = false;

      if (!user) {
        user = await prisma.user.create({
          data: {
            phone,
            role: "employer", // نقش پیش‌فرض مطابق با استور فرانت
            profileCompleted: false,
          },
        });
        isNewUser = true;
      }

      // تولید توکن JWT
      const token = jwt.sign(
        {
          userId: user.id,
          phone: user.phone,
        },
        process.env.JWT_SECRET || "supersecretkey",
        { expiresIn: "7d" },
      );

      // حذف کدهای OTP مصرف شده برای این شماره
      await prisma.oTP.deleteMany({
        where: { phone },
      });

      // 🌟 خروجی منطبق با ساختار متد setToken در استور فرانت‌اند (auth.store.ts)
      return res.json({
        success: true,
        token,
        isNewUser,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name || "",
          email: user.email || "",
          profileCompleted: user.profileCompleted,
        },
      });

  } catch (error) {
  console.error("Verify OTP Error:", error);
  return res.status(500).json({
  success: false,
  message: "خطای داخلی سرور",
  });
  }
  };

export const completeRegistration = async (req: AuthRequest, res: Response) => {
try {
const { username, role } = req.body;
const userId = req.user!.userId; // دریافت آیدی از روی توکن لاگین شده

    if (!role || !["employer", "freelancer", "both"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "نقش ارسالی نامعتبر است" });
    }

    // آپدیت نقش، نام و تغییر وضعیت تکمیل پروفایل به true
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role,
        name: username,
        profileCompleted: true, // 🌟 این خط کلیدی اضافه شد
      },
    });

    return res.json({
      success: true,
      message: "مشخصات کاربری با موفقیت آپدیت شد",
      user: updatedUser,
    });

} catch (error) {
console.error("Complete Registration Error:", error);
return res
.status(500)
.json({ success: false, message: "خطای سرور در تکمیل ثبت‌نام" });
}
};

/\*\*

- تغییر یا ارتقای نقش کاربر (کارفرما / فریلنسر / هر دو)
  \*/
  export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
  const userId = Number(req.user!.userId);
  const { role } = req.body;

      if (!role || !["employer", "freelancer", "both"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "نقش ارسالی نامعتبر است",
        });
      }

      // ۱. آپدیت نقش در دیتابیس
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
      });

      // مدیریت پروفایل‌ها (مثل کدهای قبلی...)
      if (role === "freelancer" || role === "both") {
        const existing = await prisma.freelancerProfile.findUnique({
          where: { userId },
        });
        if (!existing)
          await prisma.freelancerProfile.create({ data: { userId } });
      }
      if (role === "employer" || role === "both") {
        const existing = await prisma.employerProfile.findUnique({
          where: { userId },
        });
        if (!existing) await prisma.employerProfile.create({ data: { userId } });
      }

      // 🌟 ۲. تولید توکن جدید با اطلاعات به‌روز شده
      const secret = process.env.JWT_SECRET || "supersecretkey";
      const newToken = jwt.sign(
        {
          userId: updatedUser.id,
          phone: updatedUser.phone,
          role: updatedUser.role, // اگر نقش را هم در توکن نگه می‌دارید
        },
        secret,
        { expiresIn: "7d" }, // یا مدت زمان دلخواه شما
      );

      return res.json({
        success: true,
        message: "نقش با موفقیت به‌روزرسانی شد",
        token: newToken, // 👈 ارسال توکن جدید به فرانت‌اند
        role: updatedUser.role,
      });

  } catch (error) {
  console.error("Update Role Error:", error);
  return res.status(500).json({
  success: false,
  message: "خطای سرور در تغییر نقش",
  });
  }
  };
  /\*\*

- دریافت اطلاعات کاربر لاگین شده
  \*/
  export const getMe = async (req: AuthRequest, res: Response) => {
  try {
  const user = await prisma.user.findUnique({
  where: { id: req.user!.userId },
  include: {
  employerProfile: true,
  freelancerProfile: {
  include: {
  skills: {
  include: { skill: true },
  },
  },
  },
  },
  });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "کاربر یافت نشد" });
      }

      // 🌟 جدا کردن پسورد و ارسال بقیه اطلاعات کاربر به امن‌ترین شکل ممکن
      const { password, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        user: userWithoutPassword,
      });

  } catch (error) {
  console.error("Get Me Error:", error);
  return res.status(500).json({ success: false, message: "خطای سرور" });
  }
  };

/\*\*

- ورود با ایمیل/شماره همراه و رمز عبور
  \*/
  export const loginWithPassword = async (req: Request, res: Response) => {
  try {
  const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: "ایمیل/شماره همراه و رمز عبور الزامی هستند",
        });
      }

      const normalizedIdentifier = String(identifier).trim();
      const isPhone = /^09\d{9}$/.test(normalizedIdentifier);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier);

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(isPhone ? [{ phone: normalizedIdentifier }] : []),
            ...(isEmail ? [{ email: normalizedIdentifier }] : []),
            { phone: normalizedIdentifier },
            { email: normalizedIdentifier },
          ],
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "کاربری با این اطلاعات یافت نشد",
        });
      }

      if (!user.password) {
        return res.status(401).json({
          success: false,
          message:
            "برای این حساب هنوز رمز عبور تنظیم نشده است. لطفاً با شماره همراه وارد شوید",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "ایمیل/شماره همراه یا رمز عبور اشتباه است",
        });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          phone: user.phone,
        },
        process.env.JWT_SECRET || "supersecretkey",
        { expiresIn: "7d" },
      );

      return res.json({
        success: true,
        token,
        isNewUser: false,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name || "",
          email: user.email || "",
          profileCompleted: user.profileCompleted,
        },
      });

  } catch (error) {
  console.error("Password Login Error:", error);
  return res.status(500).json({
  success: false,
  message: "خطای داخلی سرور",
  });
  }
  };

/\*\*

- بررسی روش ورود (بر اساس ایمیل یا شماره همراه)
  \*/
  export const checkLoginMethod = async (req: Request, res: Response) => {
  try {
  const { identifier } = req.body;

      if (!identifier) {
        return res
          .status(400)
          .json({ success: false, message: "ورودی الزامی است" });
      }

      const normalizedIdentifier = String(identifier).trim();
      const isPhone = /^09\d{9}$/.test(normalizedIdentifier);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier);

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(isPhone ? [{ phone: normalizedIdentifier }] : []),
            ...(isEmail ? [{ email: normalizedIdentifier }] : []),
            { phone: normalizedIdentifier },
            { email: normalizedIdentifier },
          ],
        },
        select: { password: true },
      });

      if (existingUser?.password) {
        return res.json({ success: true, method: "password" });
      }

      if (isPhone) {
        return res.json({ success: true, method: "otp" });
      }

      if (isEmail) {
        return res.json({ success: true, method: "password" });
      }

      return res.status(400).json({
        success: false,
        message: "فرمت ورودی نامعتبر است (باید شماره همراه یا ایمیل باشد)",
      });

  } catch (error) {
  console.error("Check Login Method Error:", error);
  return res.status(500).json({
  success: false,
  message: "خطای داخلی سرور",
  });
  }
  };

import { Response } from "express";
import { prisma } from "../lib/prisma"; // ⚡ مسیر فایل کانفیگ پریسما شما
import { AuthRequest } from "../middleware/auth.middleware";

export const contractController = {
// ۱. ثبت پیشنهاد الحاقیه توسط کارفرما (پشتیبانی از مساحت یا طول کریدور)
async createAmendment(req: AuthRequest, res: Response): Promise<Response> {
try {
const { contractId } = req.params;
const {
proposed_area,
proposed_length, // 🌟 دریافت طول پیشنهادی برای پروژه‌های کریدوری
proposed_amount,
proposed_delivery_time,
notes,
} = req.body;
const loggedInUserId = req.user?.userId;

      if (!loggedInUserId) {
        return res
          .status(401)
          .json({ success: false, message: "کاربر احراز هویت نشده است." });
      }

      // پیدا کردن قرارداد به همراه اطلاعات پروژه متصل به آن با پریسما
      const contract = await prisma.contract.findUnique({
        where: { id: Number(contractId) },
        include: { project: true },
      });

      if (!contract) {
        return res
          .status(404)
          .json({ success: false, message: "قرارداد مورد نظر یافت نشد." });
      }

      // بررسی سطح دسترسی: کارفرمای پروژه باید با کاربر لاگین شده برابر باشد
      if (contract.employerId !== loggedInUserId) {
        return res.status(403).json({
          success: false,
          message: "شما دسترسی لازم برای تغییر این قرارداد را ندارید.",
        });
      }

      // بررسی عدم وجود الحاقیه فعال یا منتظر تایید (pending) برای این قرارداد
      const existingPending = await prisma.contractAmendment.findFirst({
        where: {
          contractId: Number(contractId),
          status: "pending",
        },
      });

      if (existingPending) {
        return res.status(400).json({
          success: false,
          message: "یک الحاقیه منتظر تایید برای این قرارداد وجود دارد.",
        });
      }

      // ایجاد الحاقیه جدید در دیتابیس (پشتیبانی از مساحت و طول)
      const amendment = await prisma.contractAmendment.create({
        data: {
          contractId: Number(contractId),
          proposed_area: proposed_area ? Number(proposed_area) : null,
          proposed_length: proposed_length ? Number(proposed_length) : null, // 🌟 ذخیره طول اگر ارسال شده باشد
          proposed_amount: Number(proposed_amount),
          proposed_delivery_time: proposed_delivery_time
            ? Number(proposed_delivery_time)
            : null,
          notes: notes || null,
          status: "pending",
        },
      });

      return res.status(201).json({
        success: true,
        message: "پیشنهاد الحاقیه با موفقیت ثبت و برای فریلنسر ارسال شد.",
        amendment,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "خطا در سرور هنگام ثبت الحاقیه" });
    }

},

// ۲. پاسخ فریلنسر (تایید یا رد الحاقیه)
async respondToAmendment(req: AuthRequest, res: Response): Promise<Response> {
try {
const { amendmentId } = req.params;
const { status } = req.body; // 'accepted' یا 'rejected'
const loggedInUserId = req.user?.userId;

      if (!loggedInUserId) {
        return res
          .status(401)
          .json({ success: false, message: "کاربر احراز هویت نشده است." });
      }

      if (!["accepted", "rejected"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "وضعیت ارسالی نامعتبر است." });
      }

      // پیدا کردن الحاقیه به همراه قرارداد و پروژه مربوطه
      const amendment = await prisma.contractAmendment.findUnique({
        where: { id: Number(amendmentId) },
        include: {
          contract: {
            include: { project: true },
          },
        },
      });

      if (!amendment) {
        return res
          .status(404)
          .json({ success: false, message: "اصلاحیه مورد نظر یافت نشد." });
      }

      // بررسی سطح دسترسی: فقط فریلنسرِ قرارداد می‌تواند تایید یا رد کند
      if (amendment.contract.freelancerId !== loggedInUserId) {
        return res.status(403).json({
          success: false,
          message: "تنها فریلنسر پروژه امکان تایید یا رد این اصلاحیه را دارد.",
        });
      }

      // استفاده از Transaction برای ثبت همزمان تغییرات در دیتابیس
      const updatedAmendment = await prisma.$transaction(async (tx) => {
        // ۱. آپدیت وضعیت الحاقیه
        const updated = await tx.contractAmendment.update({
          where: { id: Number(amendmentId) },
          data: { status: status as "accepted" | "rejected" },
        });

        // ۲. اگر فریلنسر تایید کرد، مقادیر جدید روی پروژه و قرارداد اصلی می‌نشینند
        if (status === "accepted") {
          // آپدیت totalAmount قرارداد
          await tx.contract.update({
            where: {
              id: amendment.contractId,
            },
            data: {
              totalAmount: amendment.proposed_amount,
              status: "completed",
              completedAt: new Date(),
            },
          });

          // آپدیت مقادیر پروژه بر اساس اینکه مساحتی است یا کریدوری (طولی)
          // آپدیت مقادیر پروژه بر اساس اینکه مساحتی است یا کریدوری (طولی)
          await tx.project.update({
            where: { id: amendment.contract.projectId },
            data: {
              status: "completed",
              // اگر مساحت در الحاقیه ثبت شده بود، روی پروژه بنشیند
              ...((amendment as any).proposed_area !== null && {
                calculatedArea: (amendment as any).proposed_area,
              }),
              // اگر طول مسیر کریدور در الحاقیه ثبت شده بود، روی پروژه بنشیند
              ...((amendment as any).proposed_length !== null && {
                corridorLength: (amendment as any).proposed_length,
              }),
              // 🌟 رفع خطا با استفاده از کست کردن به any برای فیلد جدید
              ...((amendment as any).proposed_delivery_time !== null && {
                deliveryTime: String((amendment as any).proposed_delivery_time),
              }),
            },
          });
        }

        return updated;
      });

      return res.json({
        success: true,
        message:
          status === "accepted"
            ? "اصلاحیه تایید، قرارداد بروزرسانی و پروژه خاتمه یافت (Completed)."
            : "اصلاحیه توسط شما رد شد.",
        amendment: updatedAmendment,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "خطا در سرور هنگام ثبت پاسخ الحاقیه",
      });
    }

},

// ۳. دریافت لیست اصلاحیه‌های یک قرارداد خاص
async getAmendments(req: AuthRequest, res: Response): Promise<Response> {
try {
const { contractId } = req.params;
const loggedInUserId = req.user?.userId;

      if (!loggedInUserId) {
        return res
          .status(401)
          .json({ success: false, message: "کاربر احراز هویت نشده است." });
      }

      // بررسی اینکه آیا کاربر لاگین شده اصلاً کارفرما یا فریلنسرِ این قرارداد هست یا خیر
      const contract = await prisma.contract.findUnique({
        where: { id: Number(contractId) },
      });

      if (!contract) {
        return res
          .status(404)
          .json({ success: false, message: "قرارداد مورد نظر یافت نشد." });
      }

      if (
        contract.employerId !== loggedInUserId &&
        contract.freelancerId !== loggedInUserId
      ) {
        return res.status(403).json({
          success: false,
          message: "شما دسترسی لازم برای مشاهده اطلاعات این قرارداد را ندارید.",
        });
      }

      // دریافت تمام اصلاحیه‌ها به ترتیب جدیدترین
      const amendments = await prisma.contractAmendment.findMany({
        where: { contractId: Number(contractId) },
        orderBy: { createdAt: "desc" },
      });

      return res.json({
        success: true,
        amendments,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "خطا در سرور هنگام دریافت اصلاحیه‌ها",
      });
    }

},
};

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { Prisma } from "@prisma/client";
import { createProjectSchema } from "../validators/project.validator";
import { updateProjectSchema } from "../validators/project.validator";

/\*\*

- =========================
- Helper: normalize multipart body
- =========================
  \*/
  const preprocessMultipartData = (body: any) => {
  const processed = { ...body };

Object.keys(processed).forEach((key) => {
if (
processed[key] === "" ||
processed[key] === "null" ||
processed[key] === "undefined"
) {
processed[key] = undefined; // تبدیل به undefined تا Zod فیلدهای optional را رد کند
}
});

if (
processed.calculatedArea !== undefined &&
processed.calculatedArea !== "" &&
processed.calculatedArea !== "null" &&
!isNaN(Number(processed.calculatedArea))
) {
processed.calculatedArea = Number(processed.calculatedArea);
} else {
processed.calculatedArea = undefined;
}

// 🌟 پردازش فاصله منحنی میزان
if (typeof processed.contourInterval === "string") {
if (
processed.contourInterval === "" ||
processed.contourInterval === "null" ||
processed.contourInterval === "undefined"
) {
processed.contourInterval = null;
}
}

// اصلاح CorridorLength
if (
processed.corridorLength !== undefined &&
processed.corridorLength !== "" &&
processed.corridorLength !== "null" &&
!isNaN(Number(processed.corridorLength))
) {
processed.corridorLength = Number(processed.corridorLength);
} else {
processed.corridorLength = undefined;
}

if (typeof processed.techType === "string") {
try {
processed.techType = JSON.parse(processed.techType);
} catch {}
}
if (typeof processed.terrainTypes === "string") {
try {
processed.terrainTypes = JSON.parse(processed.terrainTypes);
} catch {
processed.terrainTypes = [];
}
}

if (typeof processed.outputFormats === "string") {
try {
processed.outputFormats = JSON.parse(processed.outputFormats);
} catch {}
}

if (typeof processed.polygonCoordinates === "string") {
try {
processed.polygonCoordinates = JSON.parse(processed.polygonCoordinates);
} catch {}
}

if (typeof processed.geoJson === "string") {
try {
processed.geoJson = JSON.parse(processed.geoJson);
} catch {}
}

// 🌟 پردازش روش اصلی اجرا
if (typeof processed.surveyMethod === "string") {
if (
processed.surveyMethod === "" ||
processed.surveyMethod === "null" ||
processed.surveyMethod === "undefined"
) {
processed.surveyMethod = null;
}
}

if (typeof processed.specificSurveys === "string") {
try {
processed.specificSurveys = JSON.parse(processed.specificSurveys);
} catch {
processed.specificSurveys = [];
}
}

if (typeof processed.requiredEquipment === "string") {
try {
processed.requiredEquipment = JSON.parse(processed.requiredEquipment);
} catch {
processed.requiredEquipment = [];
}
}

// 🌟 پارس کردن مشخصات فنی مجزا برای هر روش (که به صورت رشته‌ی JSON ارسال می‌شوند)
if (typeof processed.groundTechnicalSpecs === "string") {
try {
processed.groundTechnicalSpecs = JSON.parse(
processed.groundTechnicalSpecs,
);
} catch {
processed.groundTechnicalSpecs = [];
}
}

if (typeof processed.aerialTechnicalSpecs === "string") {
try {
processed.aerialTechnicalSpecs = JSON.parse(
processed.aerialTechnicalSpecs,
);
} catch {
processed.aerialTechnicalSpecs = [];
}
}

if (typeof processed.gisTechnicalSpecs === "string") {
try {
processed.gisTechnicalSpecs = JSON.parse(processed.gisTechnicalSpecs);
} catch {
processed.gisTechnicalSpecs = [];
}
}

// اصلاح بخش تبدیل بودجه‌ها
if (
processed.minBudget !== undefined &&
processed.minBudget !== "" &&
processed.minBudget !== "null"
) {
processed.minBudget = Number(processed.minBudget);
} else {
processed.minBudget = undefined;
}

if (
processed.maxBudget !== undefined &&
processed.maxBudget !== "" &&
processed.maxBudget !== "null"
) {
processed.maxBudget = Number(processed.maxBudget);
} else {
processed.maxBudget = undefined;
}

if (processed.projectId !== undefined) {
processed.projectId = Number(processed.projectId);
}

return processed;
};

/\*\*

- =========================
- 1.  Create Project (WITH FILES)
- =========================
  \*/
  export const createProject = async (req: AuthRequest, res: Response) => {
  let processedBody: any = null; // تعریف متغیر بیرون از try برای دسترسی در catch در صورت خطا

try {
const employerId = Number(req.user!.userId);

    processedBody = preprocessMultipartData(req.body);

    const validation = createProjectSchema.safeParse(processedBody);

    if (!validation.success) {
      console.log("❌ Zod Validation Error Details:");
      console.log(
        JSON.stringify(validation.error.flatten().fieldErrors, null, 2),
      );

      return res.status(400).json({
        success: false,
        message: "خطای اعتبارسنجی داده‌ها",
        errors: validation.error.issues,
      });
    }
    const data = validation.data;

    let categoryId: number | null = null;

    if (data.category) {
      const foundCategory = await prisma.category.findUnique({
        where: { slug: data.category },
      });

      if (foundCategory) {
        categoryId = foundCategory.id;
      }
    }

    /**
     * =========================
     * Transaction (Project + Files)
     * =========================
     */
    const result = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          employerId,
          categoryId,
          title: data.title ?? "",
          description: data.description ?? "",
          status: "open",
          province: data.province ?? null,
          city: data.city ?? null,
          address: data.address ?? null,
          areaSelectionMethod: data.areaSelectionMethod ?? "map",
          mappingType: data.mappingType ?? null,

          // 🌟 ذخیره مشخصات روش‌ها، مقیاس پرواز و فیلدهای توضیحات مجزا در دیتابیس
          surveyMethod: (data as any).surveyMethod ?? null,
          specificSurveys: (data as any).specificSurveys ?? [],
          requiredEquipment: (data as any).requiredEquipment ?? [],

          groundTechnicalSpecs: (data as any).groundTechnicalSpecs ?? [],
          aerialTechnicalSpecs: (data as any).aerialTechnicalSpecs ?? [],
          aerialScaleOption: (data as any).aerialScaleOption ?? null,
          gisTechnicalSpecs: (data as any).gisTechnicalSpecs ?? [],

          groundDescription: (data as any).groundDescription ?? null,
          aerialDescription: (data as any).aerialDescription ?? null,
          gisDescription: (data as any).gisDescription ?? null,
          contourInterval: (data as any).contourInterval ?? null,
          calculatedArea: data.calculatedArea ?? null,
          corridorLength: data.corridorLength ?? null,
          utmZone: data.utmZone ?? null,
          terrainTypes: data.terrainTypes ?? [],
          requiredAccuracy: data.requiredAccuracy ?? null,
          mapScale: data.mapScale ?? null,
          deliveryTime: data.deliveryTime ?? null,
          budgetType: data.budgetType ?? "fixed",
          minBudget: data.minBudget ? new Prisma.Decimal(data.minBudget) : null,
          maxBudget: data.maxBudget ? new Prisma.Decimal(data.maxBudget) : null,
          polygonCoordinates: data.polygonCoordinates ?? "",
          geoJson: data.geoJson ?? null,
          techType: data.techType ?? "",
          outputFormats: data.outputFormats ?? "",
        },
      });

      /**
       * =========================
       * Save attachments (FILES)
       * =========================
       */
      const files = req.files as Express.Multer.File[] | undefined;

      if (files && files.length > 0) {
        for (const file of files) {
          await tx.projectAttachment.create({
            data: {
              projectId: newProject.id,
              fileName: file.originalname,
              fileUrl: `/uploads/projects/${file.filename}`,
              fileType: file.mimetype,
              fileSize: file.size,
            },
          });
        }
      }

      return newProject;
    });

    return res.status(201).json({
      success: true,
      project: result,
    });

} catch (error) {
console.error("❌ createProject error:", error);

    if (processedBody) {
      const validation = createProjectSchema.safeParse(processedBody);
      if (!validation.success) {
        console.log(
          "Validation Errors:",
          validation.error.flatten().fieldErrors,
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "خطا در ثبت پروژه",
    });

}
};

/\*\*

- =========================
- 2.  Get Projects (public feed)
- =========================
  \*/
  export const getProjects = async (req: Request, res: Response) => {
  try {
  const {
  category,
  search,
  province,
  city,
  budgetType,
  page = 1,
  limit = 10,
  } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const whereClause: any = {
        deletedAt: null,
        status: "open",
      };

      if (category) {
        whereClause.category = { slug: String(category) };
      }

      if (province) whereClause.province = String(province);
      if (city) whereClause.city = String(city);
      if (budgetType) whereClause.budgetType = budgetType;

      if (search) {
        whereClause.OR = [
          {
            title: {
              contains: String(search),
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: String(search),
              mode: "insensitive",
            },
          },
        ];
      }

      const [projects, total] = await prisma.$transaction([
        prisma.project.findMany({
          where: whereClause,
          skip,
          take: Number(limit),
          orderBy: { createdAt: "desc" },
          include: {
            category: true,
            employer: {
              select: { name: true, avatar: true },
            },
            attachments: true,
          },
        }),

        prisma.project.count({ where: whereClause }),
      ]);

      return res.json({
        success: true,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
        projects,
      });

  } catch (error) {
  return res.status(500).json({
  success: false,
  message: "خطا در دریافت لیست پروژه‌ها",
  });
  }
  };

/\*\*

- =========================
- 3.  Get Project By ID
- =========================
  \*/
  export const getProjectById = async (req: Request, res: Response) => {
  try {
  const id = Number(req.params.id);

      console.log("Project ID:", id);

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          category: true,

          employer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },

          attachments: true,

          contract: {
            select: {
              id: true,
              status: true,

              employer: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  role: true,
                },
              },

              freelancer: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      console.log("Project Found:", project);

      if (!project || project.deletedAt) {
        return res.status(404).json({
          success: false,
          message: "پروژه یافت نشد",
        });
      }

      const proposalCount = await prisma.proposal.count({
        where: {
          projectId: id,
        },
      });

      await prisma.project.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });

      return res.status(200).json({
        success: true,
        project: {
          ...project,
          canEdit: !project.contract,
          canDelete: !project.contract,
          proposalCount,
          attachmentCount: project.attachments.length,
        },
      });

  } catch (error) {
  console.error("getProjectById error:", error);

      return res.status(500).json({
        success: false,
        message: "خطا در دریافت جزئیات پروژه",
      });

  }
  };

/\*\*

- =========================
- 4.  Update Project
- =========================
  \*/
  export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
  const { id } = req.params;
  const employerId = Number(req.user!.userId);

      const processedBody = { ...req.body };

      const validation = updateProjectSchema.safeParse(processedBody);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          errors: validation.error.issues,
        });
      }

      const project = await prisma.project.findUnique({
        where: { id: Number(id) },
      });

      if (!project || project.deletedAt) {
        return res.status(404).json({
          success: false,
          message: "پروژه یافت نشد",
        });
      }

      if (project.employerId !== employerId) {
        return res.status(403).json({
          success: false,
          message: "دسترسی ندارید",
        });
      }

      if (project.status !== "draft" && project.status !== "open") {
        return res.status(400).json({
          success: false,
          message: "این پروژه قابل ویرایش نیست",
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const updatedProject = await tx.project.update({
          where: { id: Number(id) },
          data: {
            ...validation.data,
            mappingType: validation.data.mappingType,
            calculatedArea:
              validation.data.mappingType === "area"
                ? validation.data.calculatedArea
                : null,
            corridorLength:
              validation.data.mappingType === "corridor"
                ? validation.data.corridorLength
                : null,

            terrainTypes: validation.data.terrainTypes ?? undefined,
            minBudget: validation.data.minBudget
              ? new Prisma.Decimal(validation.data.minBudget)
              : undefined,
            maxBudget: validation.data.maxBudget
              ? new Prisma.Decimal(validation.data.maxBudget)
              : undefined,
          } as any,
        });

        /**
         * =========================
         * ADD NEW FILES (NOT REPLACE)
         * =========================
         */
        const files = req.files as Express.Multer.File[] | undefined;

        if (files && files.length > 0) {
          for (const file of files) {
            await tx.projectAttachment.create({
              data: {
                projectId: updatedProject.id,
                fileName: file.originalname,
                fileUrl: `/uploads/projects/${file.filename}`,
                fileType: file.mimetype,
                fileSize: file.size,
              },
            });
          }
        }

        return updatedProject;
      });

      return res.json({
        success: true,
        message: "پروژه بروزرسانی شد",
        project: updated,
      });

  } catch (error) {
  console.error(error);

      return res.status(500).json({
        success: false,
        message: "خطا در بروزرسانی پروژه",
      });

  }
  };

/\*\*

- =========================
- 5.  DELETE PROJECT (SOFT DELETE)
- =========================
  \*/
  export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
  const { id } = req.params;
  const employerId = Number(req.user!.userId);

      const project = await prisma.project.findUnique({
        where: { id: Number(id) },
      });

      if (!project || project.deletedAt) {
        return res.status(404).json({
          success: false,
          message: "پروژه یافت نشد",
        });
      }

      if (project.employerId !== employerId) {
        return res.status(403).json({
          success: false,
          message: "دسترسی ندارید",
        });
      }

      if (project.status !== "draft" && project.status !== "open") {
        return res.status(400).json({
          success: false,
          message: "امکان حذف این پروژه وجود ندارد",
        });
      }

      await prisma.project.update({
        where: { id: Number(id) },
        data: {
          deletedAt: new Date(),
          status: "cancelled",
        },
      });

      return res.json({
        success: true,
        message: "پروژه حذف شد",
      });

  } catch (error) {
  return res.status(500).json({
  success: false,
  message: "خطا در حذف پروژه",
  });
  }
  };

/\*\*

- =========================
- 6.  SUBMIT PROPOSAL
- =========================
  \*/
  export const submitProposal = async (req: AuthRequest, res: Response) => {
  try {
  const freelancerId = Number(req.user!.userId);

      const { projectId, amount, deliveryDays, coverLetter } = req.body;

      if (!projectId || !amount || !deliveryDays || !coverLetter) {
        return res.status(400).json({
          success: false,
          message: "تمام فیلدها الزامی است",
        });
      }

      const targetProjectId = Number(projectId);

      console.log("Logged User:", req.user);
      console.log("FreelancerId:", freelancerId);

      const project = await prisma.project.findUnique({
        where: {
          id: targetProjectId,
        },
        select: {
          employerId: true,
          deletedAt: true,
          status: true,
        },
      });

      if (!project || project.deletedAt || project.status !== "open") {
        return res.status(404).json({
          success: false,
          message: "پروژه در دسترس نیست",
        });
      }

      if (project.employerId === freelancerId) {
        return res.status(400).json({
          success: false,
          message: "نمی‌توانید برای پروژه خودتان پیشنهاد ثبت کنید.",
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          id: freelancerId,
        },
        select: {
          role: true,
        },
      });
      console.log("User From DB:", user);

      if (!user || (user.role !== "freelancer" && user.role !== "both")) {
        return res.status(403).json({
          success: false,
          message: "فقط فریلنسرها می‌توانند پیشنهاد ثبت کنند.",
        });
      }

      const existing = await prisma.proposal.findUnique({
        where: {
          projectId_freelancerId: {
            projectId: targetProjectId,
            freelancerId,
          },
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "قبلاً پیشنهاد ثبت کرده‌اید",
        });
      }

      const proposal = await prisma.proposal.create({
        data: {
          projectId: targetProjectId,
          freelancerId,
          amount: new Prisma.Decimal(amount),
          deliveryDays: Number(deliveryDays),
          coverLetter: String(coverLetter).trim(),
          status: "pending",
        },
      });

      return res.status(201).json({
        success: true,
        message: "پیشنهاد ثبت شد",
        proposal,
      });

  } catch (error) {
  console.error("submitProposal error:", error);

      return res.status(500).json({
        success: false,
        message: "خطا در ثبت پیشنهاد",
      });

  }
  };

/\*\*

- =========================
- 7.  GET MY PROJECTS
- =========================
  \*/
  export const getMyProjects = async (req: AuthRequest, res: Response) => {
  try {
  const userId = Number(req.user?.userId);

      const projects = await prisma.project.findMany({
        where: {
          employerId: userId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
          attachments: true,

          _count: {
            select: {
              proposals: true,
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        projects,
        count: projects.length,
      });

  } catch (error) {
  return res.status(500).json({
  success: false,
  message: "خطا در دریافت پروژه‌ها",
  });
  }
  };

export const getProjectProposals = async (req: AuthRequest, res: Response) => {
try {
const projectId = Number(req.params.id);
const employerId = Number(req.user!.userId);
const project = await prisma.project.findUnique({
where: {
id: projectId,
},
select: {
id: true,
employerId: true,
deletedAt: true,
},
});
if (!project || project.deletedAt) {
return res.status(404).json({
success: false,
message: "پروژه پیدا نشد",
});
}
if (project.employerId !== employerId) {
return res.status(403).json({
success: false,
message: "دسترسی ندارید",
});
}

    const proposals = await prisma.proposal.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            city: true,
            province: true,
          },
        },
      },
    });
    return res.status(200).json({
      success: true,
      proposals,
      count: proposals.length,
    });

} catch (error) {
console.error(error);

    return res.status(500).json({
      success: false,
      message: "خطا در دریافت پیشنهادها",
    });

}
};

/\*\*

- =========================
- 8.  ACCEPT PROPOSAL & CREATE CONTRACT (SUPPORTING CHAT AGREEMENTS)
- =========================
  \*/
  export const acceptProposal = async (req: AuthRequest, res: Response) => {
  try {
  const proposalId = Number(req.params.id);
  const employerId = Number(req.user!.userId);
  const { finalAmount } = req.body;

      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: { project: true },
      });

      if (!proposal) {
        return res
          .status(404)
          .json({ success: false, message: "پیشنهاد مورد نظر یافت نشد." });
      }

      if (proposal.project.employerId !== employerId) {
        return res
          .status(403)
          .json({ success: false, message: "شما دسترسی لازم را ندارید." });
      }

      // شرط پروژه را منعطف‌تر می‌کنیم تا اگر پروژه دوباره باز شد (وضعیت open)، قابل قبول باشد
      if (proposal.project.status !== "open") {
        return res.status(400).json({
          success: false,
          message: "پروژه در وضعیت مناسبی برای تایید پیشنهاد نیست.",
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        // ۱. آپدیت وضعیت پیشنهاد فعلی
        const updatedProposal = await tx.proposal.update({
          where: { id: proposalId },
          data: { status: "accepted" },
        });

        // ۲. آپدیت وضعیت پروژه
        await tx.project.update({
          where: { id: proposal.projectId },
          data: { status: "in_progress" },
        });

        // ۳. رد کردن سایر پیشنهادها
        await tx.proposal.updateMany({
          where: {
            projectId: proposal.projectId,
            id: { not: proposalId },
            status: "pending",
          },
          data: { status: "rejected" },
        });

        const contractAmount = finalAmount
          ? new Prisma.Decimal(finalAmount)
          : proposal.amount;

        // ۴. 🌟 استفاده از upsert به جای create برای جلوگیری از خطای Unique constraint
        // ۴. استفاده از upsert هوشمند برای پیشگیری از هرگونه خطای تکرار کلید
        const contract = await tx.contract.upsert({
          where: {
            projectId: proposal.projectId, // بررسی یکتا بودن بر اساس کلید projectId
          },
          update: {
            proposalId: proposal.id,
            freelancerId: proposal.freelancerId,
            totalAmount: contractAmount,
            status: "active",
            cancelledAt: null, // پاک کردن تاریخ لغو قبلی در صورت فعال‌سازی مجدد
          },
          create: {
            projectId: proposal.projectId,
            proposalId: proposal.id,
            employerId: employerId,
            freelancerId: proposal.freelancerId,
            totalAmount: contractAmount,
            status: "active",
          },
        });
        return { updatedProposal, contract };
      });

      return res.status(200).json({
        success: true,
        message: "پیشنهاد با موفقیت تایید شد.",
        data: result,
      });

  } catch (error) {
  console.error("❌ acceptProposal error:", error);
  return res
  .status(500)
  .json({ success: false, message: "خطا در تایید پیشنهاد" });
  }
  };
  /\*\*

- =========================
- 9.  GET FREELANCER CONTRACTS (MY PROJECTS AS FREELANCER)
- =========================
  \*/
  export const getFreelancerContracts = async (
  req: AuthRequest,
  res: Response,
  ) => {
  try {
  const freelancerId = Number(req.user!.userId);

      if (!freelancerId) {
        return res.status(401).json({
          success: false,
          message: "کاربر احراز هویت نشده است.",
        });
      }

      const contracts = await prisma.contract.findMany({
        where: {
          freelancerId: freelancerId,
          status: "active",
        },
        include: {
          project: {
            include: {
              category: true,
              attachments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        contracts,
        count: contracts.length,
      });

  } catch (error) {
  console.error("❌ getFreelancerContracts error:", error);
  return res.status(500).json({
  success: false,
  message: "خطا در دریافت پروژه‌های فریلنسر",
  });
  }
  };

/\*\*

- =========================
- 10. GET ACCEPTED PROJECTS FOR FREELANCER
- =========================
  \*/
  export const getAcceptedProjects = async (req: AuthRequest, res: Response) => {
  try {
  const freelancerId = Number(req.user!.userId);

      const status = String(req.query.status || "all");

      let contractWhere: any = {
        freelancerId,
      };

      if (status === "active") {
        contractWhere.status = "active";
      } else if (status === "completed") {
        contractWhere.status = "completed";
      } else {
        contractWhere.status = {
          in: ["active", "completed"],
        };
      }

      const contracts = await prisma.contract.findMany({
        where: contractWhere,
        include: {
          project: {
            include: {
              employer: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const projects = contracts.map((contract) => ({
        ...contract.project,
        contractId: contract.id,
        contractStatus: contract.status,
        totalAmount: contract.totalAmount,
        startedAt: contract.startedAt,
        completedAt: contract.completedAt,
      }));

      return res.status(200).json({
        success: true,
        projects,
        count: projects.length,
      });

  } catch (error) {
  console.error("getAcceptedProjects error:", error);

      return res.status(500).json({
        success: false,
        message: "خطا در دریافت پروژه‌ها",
      });

  }
  };

export const rejectAcceptedProposal = async (
req: AuthRequest,
res: Response,
) => {
try {
// ۱. اطمینان از دریافت پارامترها از req.params یا req.body
// طبق روت شما که :contractId داشت، باید از params بگیرید:
const contractId = Number(req.params.contractId);
const { projectId } = req.body;
const employerId = Number(req.user!.userId);

    // بررسی اینکه آیا IDها معتبر هستند
    if (isNaN(contractId) || isNaN(Number(projectId))) {
      return res
        .status(400)
        .json({ success: false, message: "شناسه نامعتبر است" });
    }

    // ... (بقیه کدهای بررسی مالکیت پروژه)

    await prisma.$transaction(async (tx) => {
      // الف) لغو قرارداد - حتما از متغیری که عدد شده استفاده کنید
      await tx.contract.update({
        where: { id: contractId }, // 👈 اینجا باید عدد باشد
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      });

      // ب) بازگرداندن پروژه به وضعیت open
      await tx.project.update({
        where: { id: Number(projectId) },
        data: { status: "open" },
      });

      // ج) تغییر وضعیت پیشنهاد قبلی به rejected
      await tx.proposal.updateMany({
        where: { projectId: Number(projectId), status: "accepted" },
        data: { status: "rejected" },
      });
    });

    return res.status(200).json({ success: true, message: "توافق لغو شد" });

} catch (error) {
console.error(error); // برای دیدن جزئیات خطا در کنسول سرور
return res
.status(500)
.json({ success: false, message: "خطا در لغو توافق" });
}
};

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
│ │ │ ├── 20260809090834_add_report_model
│ │ │ │ └── migration.sql
│ │ │ ├── 20260809093240_add_activity_log
│ │ │ │ └── migration.sql
│ │ │ ├── 20260810071030_add_settings
│ │ │ │ └── migration.sql
│ │ │ ├── 20260810075020_add_notifications
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
│ │ ├── utils
│ │ │ ├── activityLog.ts
│ │ │ └── notification.ts
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
│ │ ├── AdminActivityLogPage.vue
│ │ ├── AdminCategoryPage.vue
│ │ ├── AdminContractDetailPage.vue
│ │ ├── AdminContractPage.vue
│ │ ├── AdminDashboardPage.vue
│ │ ├── AdminFilePage.vue
│ │ ├── AdminLoginPage.vue
│ │ ├── AdminMessagePage.vue
│ │ ├── AdminPaymentPage.vue
│ │ ├── AdminProjectDetailPage.vue
│ │ ├── AdminProjectPage.vue
│ │ ├── AdminProposalPage.vue
│ │ ├── AdminReportPage.vue
│ │ ├── AdminReviewPage.vue
│ │ ├── AdminSettingPage.vue
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

59 directories, 200 files
xmart@xmart-HP-255-G8-Notebook-PC:~/Desktop/ponisha-clone$

import { api } from './api'

// درخواست لاگین ادمین
export const adminLoginApi = async (phone: string, password: string) => {
const response = await api.post('/admin/login', { phone, password })
return response.data
}

// 🌟 تغییر وضعیت (فعال/غیرفعال) کاربر توسط ادمین
export const toggleUserStatusApi = async (userId: number) => {
const response = await api.patch(`/admin/users/${userId}/toggle-status`)
return response.data
}

export const getDashboardStatsApi = async () => {
const response = await api.get('/admin/dashboard/stats')
return response.data
}
export const getAllUsersApi = async (
params: {
search?: string
role?: string
status?: string
verified?: string
sortBy?: string
page?: number
limit?: number
} = {},
) => {
const response = await api.get('/admin/users', { params })
return response.data
}

export const getUserDetailApi = async (id: number) => {
const response = await api.get(`/admin/users/${id}`)
return response.data
}

export const verifyUserApi = async (id: number) => {
const response = await api.patch(`/admin/users/${id}/verify`)
return response.data
}

export const deleteUserApi = async (id: number) => {
const response = await api.delete(`/admin/users/${id}`)
return response.data
}

export const resetUserPasswordApi = async (id: number) => {
const response = await api.post(`/admin/users/${id}/reset-password`)
return response.data
}

export const changeUserRoleApi = async (id: number, role: string) => {
const response = await api.patch(`/admin/users/${id}/role`, { role })
return response.data
}

export const getAllProjectsApi = async (
params: {
search?: string
status?: string
sortBy?: string
page?: number
limit?: number
} = {},
) => {
const response = await api.get('/admin/projects', { params })
return response.data
}

export const publishProjectApi = async (id: number) => {
const response = await api.patch(`/admin/projects/${id}/publish`)
return response.data
}

export const closeProjectApi = async (id: number) => {
const response = await api.patch(`/admin/projects/${id}/close`)
return response.data
}

export const toggleFeatureProjectApi = async (id: number) => {
const response = await api.patch(`/admin/projects/${id}/feature`)
return response.data
}

export const deleteProjectApi = async (id: number) => {
const response = await api.delete(`/admin/projects/${id}`)
return response.data
}

export const getProjectDetailApi = async (id: number) => {
const response = await api.get(`/admin/projects/${id}`)
return response.data
}

export const getAllProposalsApi = async () => {
const response = await api.get('/admin/proposals')
return response.data
}
export const acceptProposalApi = async (id: number) => {
const response = await api.patch(`/admin/proposals/${id}/accept`)
return response.data
}

export const rejectProposalApi = async (id: number) => {
const response = await api.patch(`/admin/proposals/${id}/reject`)
return response.data
}

export const deleteProposalApi = async (id: number) => {
const response = await api.delete(`/admin/proposals/${id}`)
return response.data
}

export const getAllContractsApi = async (params: Record<string, any> = {}) => {
const response = await api.get('/admin/contracts', { params })
return response.data
}

export const getContractDetailApi = async (id: number) => {
const response = await api.get(`/admin/contracts/${id}`)
return response.data
}

export const cancelContractApi = async (id: number) => {
const response = await api.patch(`/admin/contracts/${id}/cancel`)
return response.data
}

export const completeContractApi = async (id: number) => {
const response = await api.patch(`/admin/contracts/${id}/complete`)
return response.data
}

export const resolveContractDisputeApi = async (
id: number,
resolution: 'active' | 'completed' | 'cancelled',
) => {
const response = await api.patch(`/admin/contracts/${id}/resolve-dispute`, { resolution })
return response.data
}

export const getAllPaymentsApi = async (params: Record<string, any> = {}) => {
const response = await api.get('/admin/payments', { params })
return response.data
}

export const getAllCategoriesApi = async () => {
const response = await api.get('/admin/categories')
return response.data
}

export const createCategoryApi = async (payload: {
name: string
slug: string
description?: string
parentId?: number | null
}) => {
const response = await api.post('/admin/categories', payload)
return response.data
}

export const updateCategoryApi = async (
id: number,
payload: {
name?: string
slug?: string
description?: string
parentId?: number | null
},
) => {
const response = await api.patch(`/admin/categories/${id}`, payload)
return response.data
}

export const deleteCategoryApi = async (id: number) => {
const response = await api.delete(`/admin/categories/${id}`)
return response.data
}

export const getAllSkillsApi = async (params: Record<string, any> = {}) => {
const response = await api.get('/admin/skills', { params })
return response.data
}

export const createSkillApi = async (payload: { name: string; slug: string }) => {
const response = await api.post('/admin/skills', payload)
return response.data
}

export const updateSkillApi = async (id: number, payload: { name?: string; slug?: string }) => {
const response = await api.patch(`/admin/skills/${id}`, payload)
return response.data
}

export const deleteSkillApi = async (id: number) => {
const response = await api.delete(`/admin/skills/${id}`)
return response.data
}

export const mergeSkillsApi = async (payload: {
sourceSkillIds: number[]
targetSkillId: number
}) => {
const response = await api.post('/admin/skills/merge', payload)
return response.data
}

export const getAllConversationsApi = async () => {
const response = await api.get('/admin/messages')
return response.data
}

export const getConversationThreadApi = async (params: {
contractId?: number
userAId?: number
userBId?: number
}) => {
const response = await api.get('/admin/messages/thread', { params })
return response.data
}
export const getAllReviewsApi = async (
params: {
search?: string
rating?: number
page?: number
limit?: number
} = {},
) => {
const response = await api.get('/admin/reviews', { params })
return response.data
}

export const deleteReviewApi = async (id: number) => {
const response = await api.delete(`/admin/reviews/${id}`)
return response.data
}

export const getAllFilesApi = async (
params: {
search?: string
type?: 'avatar' | 'attachment'
page?: number
limit?: number
} = {},
) => {
const response = await api.get('/admin/files', { params })
return response.data
}

export const deleteFileApi = async (type: 'avatar' | 'attachment', id: number) => {
const response = await api.delete(`/admin/files/${type}/${id}`)
return response.data
}

export const getAllReportsApi = async (
params: {
search?: string
status?: string
targetType?: string
page?: number
limit?: number
} = {},
) => {
const response = await api.get('/admin/reports', { params })
return response.data
}

export const getReportDetailApi = async (id: number) => {
const response = await api.get(`/admin/reports/${id}`)
return response.data
}

export const updateReportStatusApi = async (
id: number,
data: { status?: string; adminNote?: string },
) => {
const response = await api.patch(`/admin/reports/${id}`, data)
return response.data
}

export const deleteReportApi = async (id: number) => {
const response = await api.delete(`/admin/reports/${id}`)
return response.data
}

export const getAllActivityLogsApi = async (
params: {
search?: string
action?: string
targetType?: string
adminId?: number
page?: number
limit?: number
} = {},
) => {
const response = await api.get('/admin/activity-logs', { params })
return response.data
}

export const getAllSettingsApi = async () => {
const response = await api.get('/admin/settings')
return response.data
}

export const updateSettingsApi = async (settings: { key: string; value: string }[]) => {
const response = await api.put('/admin/settings', { settings })
return response.data
}

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
adminMiddleware,
requirePermission,
} from "../middleware/admin.middleware";
import {
adminLogin,
getAllUsersForAdmin,
getUserDetail,
toggleUserStatus,
verifyUser,
deleteUser,
resetUserPassword,
changeUserRole,
getAllFilesForAdmin,
getAllSettingsForAdmin,
updateSettingsByAdmin,
deleteFileByAdmin,
getDashboardStats,
getAllProjectsForAdmin,
publishProject,
closeProject,
toggleFeatureProject,
getAllReviewsForAdmin,
deleteReviewByAdmin,
deleteProjectByAdmin,
getAllConversationsForAdmin,
getConversationThreadForAdmin,
getProjectDetailForAdmin,
getAllProposalsForAdmin,
acceptProposalForAdmin,
rejectProposalForAdmin,
deleteProposalForAdmin,
getAllContractsForAdmin,
getAllReportsForAdmin,
getReportDetailForAdmin,
updateReportStatusByAdmin,
deleteReportByAdmin,
getContractDetailForAdmin,
cancelContractByAdmin,
completeContractByAdmin,
resolveContractDisputeByAdmin,
getAllPaymentsForAdmin,
getAllCategoriesForAdmin,
createCategoryByAdmin,
updateCategoryByAdmin,
getAllSkillsForAdmin,
createSkillByAdmin,
updateSkillByAdmin,
deleteSkillByAdmin,
getAllActivityLogsForAdmin,
mergeSkillsByAdmin,
deleteCategoryByAdmin,
} from "../controllers/admin.controller";

const router = Router();

router.get("/test", authMiddleware, adminMiddleware, (req, res) => {
return res.json({
success: true,
message: "خوش آمدید! دسترسی ادمین تایید شد.",
});
});

router.post("/login", adminLogin);

// داشبورد — کلید permission اختصاصی نداریم، فقط عمومی بودن ادمین کافیست
router.get(
"/dashboard/stats",
authMiddleware,
adminMiddleware,
getDashboardStats,
);

// مشاهده — SUPER_ADMIN, ADMIN, SUPPORT, FINANCE, MODERATOR همه دسترسی دارند
router.get(
"/users",
authMiddleware,
requirePermission("users.view"),
getAllUsersForAdmin,
);
router.get(
"/users/:id",
authMiddleware,
requirePermission("users.view"),
getUserDetail,
);

router.get(
"/projects/:id",
authMiddleware,
requirePermission("projects.view"),
getProjectDetailForAdmin,
);

router.get(
"/projects",
authMiddleware,
requirePermission("projects.view"),
getAllProjectsForAdmin,
);

// پیشنهادها — مشاهده با proposals.view (نه projects.view)
router.get(
"/proposals",
authMiddleware,
requirePermission("proposals.view"),
getAllProposalsForAdmin,
);

router.get(
"/messages",
authMiddleware,
requirePermission("messages.view"),
getAllConversationsForAdmin,
);

router.get(
"/messages/thread",
authMiddleware,
requirePermission("messages.view"),
getConversationThreadForAdmin,
);
// مسدود/فعال‌سازی — فقط SUPER_ADMIN, ADMIN, MODERATOR
router.patch(
"/users/:id/toggle-status",
authMiddleware,
requirePermission("users.ban"),
toggleUserStatus,
);

// تایید هویت — SUPER_ADMIN, ADMIN, SUPPORT
router.patch(
"/users/:id/verify",
authMiddleware,
requirePermission("users.edit"),
verifyUser,
);

// حذف — فقط SUPER_ADMIN (طبق rolePermissionMap فقط SUPER_ADMIN کلید users.delete رو داره)
router.delete(
"/users/:id",
authMiddleware,
requirePermission("users.delete"),
deleteUser,
);

// ری‌ست رمز — حساس است، حداقل users.edit لازم است
router.post(
"/users/:id/reset-password",
authMiddleware,
requirePermission("users.edit"),
resetUserPassword,
);

// تغییر نقش — users.edit پایه، ولی تبدیل به admin داخل کنترلر چک اضافه دارد (فقط "\*")
router.patch(
"/users/:id/role",
authMiddleware,
requirePermission("users.edit"),
changeUserRole,
);

router.patch(
"/projects/:id/publish",
authMiddleware,
requirePermission("projects.edit"),
publishProject,
);
router.patch(
"/projects/:id/close",
authMiddleware,
requirePermission("projects.edit"),
closeProject,
);
router.patch(
"/projects/:id/feature",
authMiddleware,
requirePermission("projects.feature"),
toggleFeatureProject,
);
router.delete(
"/projects/:id",
authMiddleware,
requirePermission("projects.delete"),
deleteProjectByAdmin,
);

// پیشنهادها — عملیات نوشتنی (تایید/رد/حذف) با proposals.manage
router.patch(
"/proposals/:id/accept",
authMiddleware,
requirePermission("proposals.manage"),
acceptProposalForAdmin,
);

router.patch(
"/proposals/:id/reject",
authMiddleware,
requirePermission("proposals.manage"),
rejectProposalForAdmin,
);

router.delete(
"/proposals/:id",
authMiddleware,
requirePermission("proposals.manage"),
deleteProposalForAdmin,
);

router.get(
"/contracts",
authMiddleware,
requirePermission("contracts.view"),
getAllContractsForAdmin,
);

router.get(
"/contracts/:id",
authMiddleware,
requirePermission("contracts.view"),
getContractDetailForAdmin,
);

router.patch(
"/contracts/:id/cancel",
authMiddleware,
requirePermission("contracts.cancel"),
cancelContractByAdmin,
);

router.patch(
"/contracts/:id/complete",
authMiddleware,
requirePermission("contracts.edit"),
completeContractByAdmin,
);

router.patch(
"/contracts/:id/resolve-dispute",
authMiddleware,
requirePermission("contracts.edit"),
resolveContractDisputeByAdmin,
);

router.get(
"/payments",
authMiddleware,
requirePermission("payments.view"),
getAllPaymentsForAdmin,
);

router.get(
"/categories",
authMiddleware,
requirePermission("categories.manage"),
getAllCategoriesForAdmin,
);

router.post(
"/categories",
authMiddleware,
requirePermission("categories.manage"),
createCategoryByAdmin,
);

router.patch(
"/categories/:id",
authMiddleware,
requirePermission("categories.manage"),
updateCategoryByAdmin,
);

router.delete(
"/categories/:id",
authMiddleware,
requirePermission("categories.manage"),
deleteCategoryByAdmin,
);

router.get(
"/skills",
authMiddleware,
requirePermission("skills.manage"),
getAllSkillsForAdmin,
);

router.post(
"/skills",
authMiddleware,
requirePermission("skills.manage"),
createSkillByAdmin,
);

router.patch(
"/skills/:id",
authMiddleware,
requirePermission("skills.manage"),
updateSkillByAdmin,
);

router.delete(
"/skills/:id",
authMiddleware,
requirePermission("skills.manage"),
deleteSkillByAdmin,
);

router.post(
"/skills/merge",
authMiddleware,
requirePermission("skills.manage"),
mergeSkillsByAdmin,
);

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

// داخل router:
router.get(
"/files",
authMiddleware,
requirePermission("settings.view"), // یا هر permission مناسب
getAllFilesForAdmin,
);

router.delete(
"/files/:type/:id",
authMiddleware,
requirePermission("settings.manage"),
deleteFileByAdmin,
);

// داخل router:
router.get(
"/reports",
authMiddleware,
requirePermission("reports.view"),
getAllReportsForAdmin,
);

router.get(
"/reports/:id",
authMiddleware,
requirePermission("reports.view"),
getReportDetailForAdmin,
);

router.patch(
"/reports/:id",
authMiddleware,
requirePermission("reports.view"), // یا reports.manage اگر بعداً اضافه کردی
updateReportStatusByAdmin,
);

router.get(
"/activity-logs",
authMiddleware,
requirePermission("settings.view"), // یا permission مناسب
getAllActivityLogsForAdmin,
);

router.delete(
"/reports/:id",
authMiddleware,
requirePermission("reports.view"),
deleteReportByAdmin,
);

router.get(
"/settings",
authMiddleware,
requirePermission("settings.view"),
getAllSettingsForAdmin,
);

router.put(
"/settings",
authMiddleware,
requirePermission("settings.manage"),
updateSettingsByAdmin,
);
export default router;
