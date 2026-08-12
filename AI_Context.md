میخواهم ابتدا یکسری اطلاعات در مورد پروژم در اختیارت بزارم بعدش به تو میگ که باید چکاری انجام بدی

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
reportsResolved Report[] @relation("ReportsResolved")
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

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { Prisma } from "@prisma/client";
import { createProjectSchema } from "../validators/project.validator";
import { updateProjectSchema } from "../validators/project.validator";
import { createNotification } from "../utils/notification";

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

    await createNotification({
      type: "new_project",
      title: "پروژه جدید ایجاد شد",
      message: `پروژه «${result.title || "بدون عنوان"}» ثبت شد`,
      link: `/admin/projects/${result.id}`,
      metadata: { projectId: result.id, employerId },
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

import { Router } from "express";
import {
getProjectProposals,
getFreelancerContracts,
getMyProjects,
createProject,
getProjects,
getProjectById,
updateProject,
deleteProject,
acceptProposal,
submitProposal,
getAcceptedProjects,
rejectAcceptedProposal, // 👈 این متد را ایمپورت کنید
} from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

/_ ==============================================
۱. روت‌های ثابت و محافظت‌شده
============================================== _/
router.get(
"/freelancer/active-contracts",
authMiddleware,
getFreelancerContracts,
);
router.get("/accepted-projects", authMiddleware, getAcceptedProjects);
router.post("/proposals/submit", authMiddleware, submitProposal);

router.get("/my-projects", authMiddleware, getMyProjects);
router.post(
"/create",
authMiddleware,
upload.array("attachments"),
createProject,
);

/_ ==============================================
۲. روت‌های عمومی
============================================== _/
router.get("/list", getProjects);

/_ ==============================================
۳. روت‌های دارای متغیر پویا (:id)
============================================== _/
router.get("/detail/:id", getProjectById);
router.get("/detail/:id/proposals", authMiddleware, getProjectProposals);
router.put("/update/:id", authMiddleware, updateProject);
router.delete("/delete/:id", authMiddleware, deleteProject);

// تایید پیشنهاد (قبلاً داشتید)
router.patch("/proposals/:id/accept", authMiddleware, acceptProposal);

// 🌟 جدید: رد کردن توافق توسط کارفرما (برگرداندن پروژه به حالت open)
router.patch(
"/proposals/:contractId/reject",
authMiddleware,
rejectAcceptedProposal,
);

export default router;

import { api } from './api'
import axios from 'axios'
import type { Project, ActivityLog, ProjectDetail } from '@/types/project'

/\*\*

- =========================
- Types
- =========================
  \*/
  export interface ProposalPayload {
  projectId: number
  amount: number
  deliveryDays: number
  coverLetter: string
  }

export interface ProjectFormPayload {
// اطلاعات پایه
title: string
category?: string
description?: string

// اطلاعات موقعیت
province?: string
city?: string
address?: string

// اطلاعات نقشه‌برداری و کریدور
mappingType?: 'area' | 'corridor' | null
corridorLength?: number
areaSelectionMethod?: string
calculatedArea?: number
coordinateSystem?: string
utmZone?: string
terrainTypes?: string[]

// روش‌ها، تجهیزات و مشخصات فنی جدید
surveyMethod?: 'ground' | 'aerial' | 'gis' | ''
specificSurveys?: string[]
requiredEquipment?: string[]

// 🌟 مشخصات فنی مجزا و توضیحات هر روش
groundTechnicalSpecs?: string[]
aerialTechnicalSpecs?: string[]
aerialScaleOption?: string
gisTechnicalSpecs?: string[]
groundDescription?: string
aerialDescription?: string
gisDescription?: string
contourInterval?: string | null
// داده‌های جغرافیایی
polygonCoordinates?: any[]
geoJson?: any

// جزئیات فنی و خروجی
techType?: any[]
outputFormats?: any[]
requiredAccuracy?: string
mapScale: string

// زمان‌بندی و مالی
deliveryTime?: string
budgetType?: 'fixed' | 'hourly' | 'negotiable' | string
minBudget?: number | string
maxBudget?: number | string
}

/\*\*

- =========================
- Project Service
- =========================
  \*/
  export const projectService = {
  /\*\*
  - 1.  دریافت لیست پروژه‌های عمومی
        \*/
        async getAllProjects(): Promise<Project[]> {
        const response = await api.get('/projects/list')
        return response.data.projects || []
        },

/\*\*

- 2.  دریافت جزئیات یک پروژه
      \*/
      async getProjectById(id: number): Promise<ProjectDetail> {
      const response = await api.get(`/projects/detail/${id}`)
      return response.data.project
      },

/\*\*

- 3.  ایجاد پروژه (با فایل)
      \*/
      async createProject(formDataRaw: ProjectFormPayload, uploadedFiles: File[]): Promise<Project> {
      const data = new FormData()

  if (formDataRaw.surveyMethod) {
  data.append('surveyMethod', formDataRaw.surveyMethod)
  }
  if (formDataRaw.specificSurveys && formDataRaw.specificSurveys.length > 0) {
  data.append('specificSurveys', JSON.stringify(formDataRaw.specificSurveys))
  }
  if (formDataRaw.requiredEquipment && formDataRaw.requiredEquipment.length > 0) {
  data.append('requiredEquipment', JSON.stringify(formDataRaw.requiredEquipment))
  }

  // 🌟 ارسال مشخصات فنی و توضیحات اختصاصی هر بخش به فرم‌دیتا
  if (formDataRaw.groundTechnicalSpecs && formDataRaw.groundTechnicalSpecs.length > 0) {
  data.append('groundTechnicalSpecs', JSON.stringify(formDataRaw.groundTechnicalSpecs))
  }
  if (formDataRaw.aerialTechnicalSpecs && formDataRaw.aerialTechnicalSpecs.length > 0) {
  data.append('aerialTechnicalSpecs', JSON.stringify(formDataRaw.aerialTechnicalSpecs))
  }
  if (formDataRaw.aerialScaleOption) {
  data.append('aerialScaleOption', formDataRaw.aerialScaleOption)
  }
  if (formDataRaw.gisTechnicalSpecs && formDataRaw.gisTechnicalSpecs.length > 0) {
  data.append('gisTechnicalSpecs', JSON.stringify(formDataRaw.gisTechnicalSpecs))
  }
  if (formDataRaw.groundDescription) {
  data.append('groundDescription', formDataRaw.groundDescription)
  }
  if (formDataRaw.aerialDescription) {
  data.append('aerialDescription', formDataRaw.aerialDescription)
  }
  if (formDataRaw.gisDescription) {
  data.append('gisDescription', formDataRaw.gisDescription)
  }

  data.append('title', formDataRaw.title || '')
  if (formDataRaw.description) data.append('description', formDataRaw.description)

  if (formDataRaw.category && formDataRaw.category !== 'unknown') {
  data.append('category', formDataRaw.category)
  }

  if (formDataRaw.province) data.append('province', formDataRaw.province)
  if (formDataRaw.city) data.append('city', formDataRaw.city)
  if (formDataRaw.address) data.append('address', formDataRaw.address)
  if (formDataRaw.areaSelectionMethod)
  data.append('areaSelectionMethod', formDataRaw.areaSelectionMethod)

  if (formDataRaw.mappingType) {
  data.append('mappingType', formDataRaw.mappingType)
  }
  if (formDataRaw.calculatedArea !== undefined && formDataRaw.calculatedArea !== null) {
  data.append('calculatedArea', String(formDataRaw.calculatedArea))
  }
  if (formDataRaw.corridorLength !== undefined && formDataRaw.corridorLength !== null) {
  data.append('corridorLength', String(formDataRaw.corridorLength))
  }

  if (formDataRaw.contourInterval) {
  data.append('contourInterval', formDataRaw.contourInterval)
  }

  if (formDataRaw.utmZone && formDataRaw.utmZone !== 'auto')
  data.append('utmZone', formDataRaw.utmZone)

  if (formDataRaw.terrainTypes && formDataRaw.terrainTypes.length > 0) {
  data.append('terrainTypes', JSON.stringify(formDataRaw.terrainTypes))
  }

  if (formDataRaw.polygonCoordinates && formDataRaw.polygonCoordinates.length > 0) {
  data.append('polygonCoordinates', JSON.stringify(formDataRaw.polygonCoordinates))
  }
  if (formDataRaw.geoJson) {
  data.append('geoJson', JSON.stringify(formDataRaw.geoJson))
  }

  data.append('techType', JSON.stringify(formDataRaw.techType || []))
  data.append('outputFormats', JSON.stringify(formDataRaw.outputFormats || []))
  if (formDataRaw.requiredAccuracy) data.append('requiredAccuracy', formDataRaw.requiredAccuracy)
  if (formDataRaw.mapScale) {
  data.append('mapScale', formDataRaw.mapScale)
  }
  if (formDataRaw.deliveryTime) data.append('deliveryTime', formDataRaw.deliveryTime)

  data.append('budgetType', formDataRaw.budgetType || 'fixed')

  if (formDataRaw.minBudget && String(formDataRaw.minBudget).trim() !== '') {
  data.append('minBudget', String(formDataRaw.minBudget))
  }
  if (formDataRaw.maxBudget && String(formDataRaw.maxBudget).trim() !== '') {
  data.append('maxBudget', String(formDataRaw.maxBudget))
  }

  if (uploadedFiles?.length) {
  uploadedFiles.forEach((file) => {
  data.append('attachments', file)
  })
  }

  const response = await api.post('/projects/create', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data.project

},

/\*\*

- 3.5. دانلود فایل پیوست پروژه
  \*/
  async downloadAttachment(fileUrl: string): Promise<Blob> {
  // گرفتن آدرس پایه سرور (مثلاً http://localhost:5000) بدون پیشوند /api
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  // درخواست مستقیم به آدرس کامل سرور برای فایل‌های استاتیک
  const response = await axios.get(`${baseURL}${fileUrl}`, {
  responseType: 'blob',
  })
  return response.data

},
/\*\*

- 4.  آپدیت پروژه (با فایل جدید)
      \*/
      async updateProject(
      id: number,
      formDataRaw: Partial<ProjectFormPayload>,
      uploadedFiles: File[] = [],
      ): Promise<Project> {
      const data = new FormData()

  Object.entries(formDataRaw).forEach(([key, value]) => {
  if (value !== undefined && value !== null) {
  if (typeof value === 'object' && key !== 'polygonCoordinates' && key !== 'geoJson') {
  data.append(key, JSON.stringify(value))
  } else {
  data.append(key, String(value))
  }
  }
  })

  if (uploadedFiles.length) {
  uploadedFiles.forEach((file) => {
  data.append('attachments', file)
  })
  }

  const response = await api.put(`/projects/update/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data.project

},

/\*\*

- 5.  حذف پروژه
      \*/
      async deleteProject(id: number): Promise<void> {
      await api.delete(`/projects/delete/${id}`)
      },

/\*\*

- 6.  ارسال پیشنهاد
      \*/
      async sendProposal(payload: ProposalPayload): Promise<any> {
      const response = await api.post('/projects/proposals/submit', payload)
      return response.data
      },

/\*\*

- 7.  پروژه‌های من (کارفرما)
      \*/
      async getMyProjects(): Promise<Project[]> {
      const response = await api.get('/projects/my-projects')
      return response.data.projects || []
      },

/\*\*

- 8.  فعالیت‌ها
      \*/
      async getActivityLogs(): Promise<ActivityLog[]> {
      const response = await api.get('/activity-logs')
      return response.data.logs || []
      },

/\*\*

- دریافت پیشنهادهای یک پروژه (مخصوص کارفرما)
  \*/
  async getProjectProposals(projectId: number) {
  const response = await api.get(`/projects/detail/${projectId}/proposals`)
  return response.data.proposals
  },

/\*\*

- قبول یک پیشنهاد توسط کارفرما و ایجاد قرارداد
  \*/
  async acceptProposal(proposalId: number, finalAmount?: number): Promise<any> {
  const payload = finalAmount ? { finalAmount } : {}
  const response = await api.patch(`/projects/proposals/${proposalId}/accept`, payload)
  return response.data
  },

async getAcceptedProjects(status: 'all' | 'active' | 'completed' = 'all') {
const response = await api.get('/projects/accepted-projects', {
params: {
status,
},
})
return response.data.projects || []
},

rejectProposal: async (contractId: number, projectId: number) => {
const response = await api.patch(`/projects/proposals/${contractId}/reject`, {
projectId,
})
return response.data
},
}

import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { projectService } from '@/services/project.service'
import type {
Project,
ActivityLog,
ProjectDetail,
ProjectStatus,
AcceptedProject,
} from '@/types/project'

export type Coordinate = [number, number]

export const useProjectStore = defineStore('project', () => {
/\*\*

- =========================
- State
- =========================
  \*/
  const projects = ref<Project[]>([])
  const myProjects = ref<Project[]>([])
  const activityLogs = ref<ActivityLog[]>([])
  const acceptedProjects = ref<AcceptedProject[]>([]) // Modal State (Project Details)
  const projectDetails = ref<ProjectDetail | null>(null)
  const isProjectDetailsModalOpen = ref(false)
  const isProjectDetailsLoading = ref(false)
  const isQuickEntry = ref(false)
  const isDownloading = ref(false)

const isLoading = ref(false)
const error = ref<string | null>(null)

/\*\*

- =========================
- Form (Create Project)
- =========================
  \*/

const formData = reactive({
title: '',
category: '',
description: '',
province: '',
city: '',
address: '',
terrainTypes: [] as string[],

    mappingType: null as 'area' | 'corridor' | null,
    calculatedArea: 0,
    corridorLength: 0,

    // 🌟 روش اصلی اجرا (زمینی، هوایی/فتوگرامتری، کارتوگرافی و GIS)
    surveyMethod: '' as 'ground' | 'aerial' | 'gis' | '',

    // 🌟 مشخصات فنی مجزا و اختصاصی برای هر روش بر اساس تصاویر
    groundTechnicalSpecs: [] as string[], // مشخصات فنی نقشه‌برداری زمینی
    aerialTechnicalSpecs: [] as string[], // مشخصات فنی نقشه فتوگرامتری
    aerialScaleOption: '', // مقادیر 0.5، 1، 1.5، 2 مربوط به فتوگرامتری
    gisTechnicalSpecs: [] as string[], // مشخصات فنی کارتوگرافی و GIS

    // 🌟 فیلدهای توضیحات متنی مجزا برای هر بخش
    groundDescription: '',
    aerialDescription: '',
    gisDescription: '',
    contourInterval: '',

    requiredEquipment: [] as string[], // تجهیزات مورد نیاز پیشنهادی

    areaSelectionMethod: 'map',
    polygonCoordinates: [] as Coordinate[],
    geoJson: null as any,
    utmZone: '',
    techType: [] as string[],
    outputFormats: [] as string[],
    requiredAccuracy: '',
    mapScale: '',
    deliveryTime: '',
    budgetType: '',
    minBudget: '',
    maxBudget: '',

})

const uploadedFiles = ref<File[]>([])

/\*\*

- =========================
- Getters
- =========================
  \*/
  const dashboardStats = computed(() => ({
  totalProjects: projects.value.length,
  activeProjects: projects.value.filter((p) => p.status === 'open' || p.status === 'in_progress')
  .length,
  completedProjects: projects.value.filter((p) => p.status === 'completed').length,
  }))

/\*\*

- بررسی معتبر بودن زمان تحویل (مدیریت حالت روزهای دلخواه و گزینه‌های ثابت)
  \*/
  const isDeliveryTimeValid = computed(() => {
  const time = formData.deliveryTime
  if (!time) return false

  const staticOptions = ['urgent', '3-days', '1-week', '2-weeks']
  if (staticOptions.includes(time)) return true

  const match = time.match(/\d+/)
  return match ? Number(match[0]) > 0 : false

})

const openProjects = computed(() => projects.value.filter((p) => p.status === 'open'))

/\*\*

- =========================
- Modal Actions (Project Details)
- =========================
  \*/
  const openProjectDetails = async (id: number) => {
  isProjectDetailsModalOpen.value = true
  isProjectDetailsLoading.value = true
  error.value = null

  try {
  const res = await projectService.getProjectById(id)
  projectDetails.value = res
  } catch (err: any) {
  error.value = err.response?.data?.message || 'خطا در دریافت جزئیات پروژه'
  projectDetails.value = null
  } finally {
  isProjectDetailsLoading.value = false
  }

}

const closeProjectDetails = () => {
isProjectDetailsModalOpen.value = false
projectDetails.value = null
}

/\*\*

- =========================
- API Actions
- =========================
-
-
-
-
- \*/

const fetchProjects = async () => {
isLoading.value = true
error.value = null

    try {
      projects.value = await projectService.getAllProjects()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در دریافت پروژه‌ها'
    } finally {
      isLoading.value = false
    }

}

const downloadProjectFile = async (fileId: number, fileName: string) => {
isDownloading.value = true
try {
// 🌟 نکته مهم: اینجا به جای store.projectDetails، مستقیماً از projectDetails.value استفاده کنید
const file = projectDetails.value?.attachments?.find((f: any) => f.id === fileId)

      if (!file) {
        throw new Error('فایل مورد نظر یافت نشد')
      }

      // فراخوانی لایه سرویس که فایل را به صورت Blob می‌گیرد
      const blob = await projectService.downloadAttachment(file.fileUrl)

      // ساخت لینک موقت و دانلود در مرورگر
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('خطا در دانلود فایل:', err)
    } finally {
      isDownloading.value = false
    }

}
const fetchMyProjects = async () => {
isLoading.value = true
error.value = null

    try {
      myProjects.value = await projectService.getMyProjects()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در دریافت پروژه‌های من'
    } finally {
      isLoading.value = false
    }

}

const fetchActivityLogs = async () => {
try {
activityLogs.value = await projectService.getActivityLogs()
} catch (err) {
console.error(err)
}
}

const submitProject = async () => {
isLoading.value = true
error.value = null

    try {
      const payload = {
        ...formData,
        isQuick: isQuickEntry.value,
      }

      const res = await projectService.createProject(payload, uploadedFiles.value)

      if (res) {
        projects.value.unshift(res)
        myProjects.value.unshift(res)
      }

      resetForm()
      return res
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در ثبت پروژه'
      throw err
    } finally {
      isLoading.value = false
      isQuickEntry.value = false
    }

}

const updateProject = async (id: number, data: any, files: File[] = []) => {
isLoading.value = true
error.value = null

    try {
      const payload = { ...data }
      const res = await projectService.updateProject(id, payload, files)

      const index = myProjects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        myProjects.value[index] = res
      }

      if (projectDetails.value?.id === id) {
        projectDetails.value = {
          ...projectDetails.value,
          ...res,
        } as ProjectDetail
      }

      return res
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در ویرایش پروژه'
      throw err
    } finally {
      isLoading.value = false
    }

}

const deleteProject = async (id: number) => {
await projectService.deleteProject(id)

    myProjects.value = myProjects.value.filter((p) => p.id !== id)

    if (projectDetails.value?.id === id) {
      closeProjectDetails()
    }

}

const fetchAcceptedProjects = async (status: 'all' | 'active' | 'completed' = 'all') => {
isLoading.value = true
error.value = null

    try {
      acceptedProjects.value = await projectService.getAcceptedProjects(status)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در دریافت پروژه‌ها'
    } finally {
      isLoading.value = false
    }

}

const acceptProposal = async (proposalId: number, projectId: number, finalAmount?: number) => {
isLoading.value = true
error.value = null

    try {
      const res = await projectService.acceptProposal(proposalId, finalAmount)
      updateProjectStatusLocally(projectId, 'in_progress')
      return res
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در تایید پیشنهاد پروژه'
      throw err
    } finally {
      isLoading.value = false
    }

}

const updateProjectStatusLocally = (projectId: number, newStatus: string) => {
const status = newStatus as ProjectStatus

    if (projectDetails.value && projectDetails.value.id === projectId) {
      projectDetails.value.status = status
    }

    const myProjIndex = myProjects.value.findIndex((p) => p.id === projectId)
    if (myProjIndex !== -1) {
      myProjects.value[myProjIndex]!.status = status
    }

    const projIndex = projects.value.findIndex((p) => p.id === projectId)
    if (projIndex !== -1) {
      projects.value[projIndex]!.status = status
    }

    const acceptedIndex = acceptedProjects.value.findIndex((p) => p.id === projectId)
    if (acceptedIndex !== -1) {
      acceptedProjects.value[acceptedIndex]!.status = status
    }

}

const rejectProposal = async (contractId: number, projectId: number) => {
isLoading.value = true
error.value = null

    try {
      await projectService.rejectProposal(contractId, projectId)
      updateProjectStatusLocally(projectId, 'open')

      if (projectDetails.value?.id === projectId) {
        projectDetails.value.contract = null
      }

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در لغو توافق'
      throw err
    } finally {
      isLoading.value = false
    }

}

const setMappingType = (type: 'area' | 'corridor') => {
formData.mappingType = type
if (type === 'area') {
formData.corridorLength = 0
} else {
formData.calculatedArea = 0
}
}

const syncProjects = async () => {
try {
await fetchMyProjects()
await fetchAcceptedProjects()
} catch (err) {
console.error('خطا در همگام‌سازی پروژه‌ها:', err)
}
}

/\*\*

- =========================
- Helpers
- =========================
  \*/
  const addFiles = (files: File[]) => {
  uploadedFiles.value.push(...files)
  }

const removeFile = (index: number) => {
uploadedFiles.value.splice(index, 1)
}

const setMapScale = (scale: string) => {
formData.mapScale = scale

    switch (scale) {
      case '1/100':
        formData.requiredAccuracy = '۲ سانتی‌متر'
        break
      case '1/200':
        formData.requiredAccuracy = '۵ سانتی‌متر'
        break
      case '1/500':
        formData.requiredAccuracy = '۱۰ سانتی‌متر'
        break
      case '1/1000':
        formData.requiredAccuracy = '۲۰ سانتی‌متر'
        break
      case '1/2000':
        formData.requiredAccuracy = '۴۰ سانتی‌متر'
        break
      case '1/5000':
        formData.requiredAccuracy = '۱ متر'
        break
      default:
        formData.requiredAccuracy = ''
    }

}

const resetForm = () => {
formData.title = ''
formData.category = ''
formData.description = ''
formData.province = ''
formData.city = ''
formData.address = ''
formData.terrainTypes = []

    formData.mappingType = null
    formData.calculatedArea = 0
    formData.corridorLength = 0
    formData.requiredAccuracy = ''
    formData.mapScale = ''

    formData.surveyMethod = ''
    formData.groundTechnicalSpecs = []
    formData.aerialTechnicalSpecs = []
    formData.aerialScaleOption = ''
    formData.gisTechnicalSpecs = []
    formData.groundDescription = ''
    formData.aerialDescription = ''
    formData.gisDescription = ''
    formData.requiredEquipment = []
    formData.contourInterval = ''

    formData.polygonCoordinates = []
    formData.geoJson = null
    formData.techType = []
    formData.outputFormats = []
    formData.minBudget = ''
    formData.maxBudget = ''

    uploadedFiles.value = []
    error.value = null

}

const clearPolygon = () => {
formData.polygonCoordinates = []
formData.geoJson = null
formData.calculatedArea = 0
}

/\*\*

- =========================
- Return
- =========================
  \*/

return {
projects,
myProjects,
activityLogs,
acceptedProjects,
projectDetails,
isProjectDetailsModalOpen,
isProjectDetailsLoading,
isDeliveryTimeValid,
isQuickEntry,
isDownloading,
formData,
uploadedFiles,
isLoading,
error,

    dashboardStats,
    openProjects,

    setMappingType,
    fetchProjects,
    rejectProposal,
    syncProjects,
    fetchMyProjects,
    fetchActivityLogs,
    submitProject,
    downloadProjectFile,
    updateProject,
    deleteProject,
    acceptProposal,
    updateProjectStatusLocally,
    fetchAcceptedProjects,
    openProjectDetails,
    closeProjectDetails,

    addFiles,
    removeFile,
    resetForm,
    clearPolygon,
    setMapScale,

}
})

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '../stores/project.store.ts'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

import StepBasicInfo from '../components/stepProjectForm/StepBasicInfo.vue'
import StepMapBoundary from '../components/stepProjectForm/StepMapBoundary.vue'
import StepTechnicalSpecs from '../components/stepProjectForm/StepTechnicalSpecs.vue'
import StepTimingBudget from '../components/stepProjectForm/StepTimingBudget.vue'
import StepInvoice from '../components/stepProjectForm/StepInvoice.vue'
import StepSuccess from '../components/stepProjectForm/SuccessCreateProject.vue' // ۱. وارد کردن صفحه موفقیت

const store = useProjectStore()
const toast = useToast()
const router = useRouter()

const isSubmitted = ref(false) // ۲. وضعیت نمایش صفحه نهایی

type StepDefinition = {
  id: number
  type: 'basic-info' | 'map-boundary' | 'technical-specs' | 'timing-budget' | 'preview'
  title: string
  question: string
}

const steps: StepDefinition[] = [
  { id: 1, type: 'basic-info', title: 'اطلاعات پروژه', question: 'پروژه خود را معرفی کنید' },
  {
    id: 2,
    type: 'map-boundary',
    title: 'محدوده پروژه',
    question: 'محدوده عملیات را روی نقشه مشخص کنید',
  },
  {
    id: 3,
    type: 'technical-specs',
    title: 'خدمات و خروجی‌ها',
    question: 'نوع خدمات و خروجی مورد نیاز را انتخاب کنید',
  },
  {
    id: 4,
    type: 'timing-budget',
    title: 'زمان و بودجه',
    question: 'زمان تحویل، بودجه و فایل‌های ضمیمه را مشخص کنید',
  },
  { id: 5, type: 'preview', title: 'بازبینی نهایی', question: 'اطلاعات پروژه را بررسی و ثبت کنید' },
]

const currentStep = ref(0)
const currentStepData = computed<StepDefinition>(() => {
  const safeIndex = Math.max(0, Math.min(currentStep.value, steps.length - 1))
  return steps[safeIndex] as StepDefinition
})

const progress = computed(() => {
  return Math.round(((currentStep.value + 1) / steps.length) * 100)
})

const isStepValid = computed(() => {
  const type = currentStepData.value.type

  if (type === 'basic-info') {
    // اعتبارسنجی فیلدهای متنی اولیه
    return (
      store.formData.title?.trim().length > 0 &&
      store.formData.province?.trim().length > 0 &&
      store.formData.city?.trim().length > 0 &&
      store.formData.category
    )
  }

  if (type === 'map-boundary') {
    // ۱. بررسی اینکه آیا حوزه انتخابی جزو GIS یا کارتوگرافی است یا خیر
    const isGisOrDrafting = ['gis', 'drafting'].includes(store.formData.category)

    // ۴. بررسی نوع منطقه (برای همه حالت‌ها اجباری است)
    const isTerrainValid = store.formData.terrainTypes?.length > 0

    // اگر کاربر GIS یا ترسیم و کارتوگرافی انتخاب کرده باشد، فقط انتخاب نوع منطقه کافیست
    if (isGisOrDrafting) {
      return isTerrainValid
    }

    // ۲. بررسی انتخاب نوع پروژه (طولی یا مساحتی) برای سایر حوزه‌ها
    if (!store.formData.mappingType) return false

    // ۳. بررسی شرط‌های ترسیم نقشه یا آپلود فایل
    const hasValidMap =
      store.formData.mappingType === 'area'
        ? store.formData.polygonCoordinates?.length >= 3 // برای مساحتی حداقل ۳ نقطه
        : store.formData.polygonCoordinates?.length >= 2 // برای کریدور حداقل ۲ نقطه

    const hasUploadedFile = store.uploadedFiles?.length > 0
    const isMapOrUploadValid = hasValidMap || hasUploadedFile

    // ۵. بررسی فیلد طولی (اگر کریدور انتخاب شده، باید طول وارد شده باشد)
    const isCorridorValid =
      store.formData.mappingType === 'area' ? true : store.formData.corridorLength > 0

    return isMapOrUploadValid && isCorridorValid && isTerrainValid
  }

  if (type === 'technical-specs') {
    return true
  }

  if (type === 'timing-budget') {
    // بررسی زمان تحویل: اگر مقدار انتخاب شده و اگر حالت custom است، باید اینپوت خالی نباشد
    const time = store.formData.deliveryTime
    if (!time) return false

    const staticOptions = ['urgent', '3-days', '1-week', '2-weeks']
    if (staticOptions.includes(time)) return true

    // اگر مقدار سفارشی است، باید مطمئن شویم متن شامل عدد معتبر است
    const match = time.match(/\d+/)
    return match ? Number(match[0]) > 0 : false
  }

  return true
})

// تابعی برای ریست کردن کل فرم (مخصوص دکمه ثبت پروژه جدید)
const handleResetForm = () => {
  store.resetForm() // اگر پینیا متد ریست دارد، در غیر این صورت فیلدها را دستی خالی کن
  currentStep.value = 0
  isSubmitted.value = false
}
// تابعی برای ریست کردن کل فرم و رفتن به داشبورد
const goToDashboard = () => {
  handleResetForm()
  router.push('/dashboard')
}

const goToStep = (targetIndex: number) => {
  if (isSubmitted.value) return // اگر فرم ثبت شده، کلیک روی هدر قفل شود
  if (targetIndex === currentStep.value) return
  if (targetIndex < currentStep.value) {
    currentStep.value = targetIndex
    return
  }
  if (targetIndex > currentStep.value) {
    if (!isStepValid.value) {
      toast.error('لطفاً ابتدا اطلاعات مرحله فعلی را به طور کامل و صحیح وارد کنید.')
      return
    }
    if (targetIndex > currentStep.value + 1) {
      toast.warning('شما نمی‌توانید مراحل را جا بیندازید. لطفاً گام به گام جلو بروید.')
      return
    }
    currentStep.value = targetIndex
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextStep = () => {
  if (!isStepValid.value) return
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    submitProject()
  }
}

const previousStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const submitProject = async () => {
  const payload = {
    ...store.formData,
    filesCount: store.uploadedFiles.length,
  }
  console.log('PROJECT PAYLOAD', payload)

  // تغییر وضعیت به ثبت نهایی و نمایش کامپوننت موفقیت
  isSubmitted.value = true
  toast.success('پروژه شما با موفقیت ثبت شد!')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <main class="bg-gray-50 min-h-screen py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <div v-if="!isSubmitted" class="mb-8" style="direction: rtl">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 class="text-lg md:text-xl font-black text-gray-800 text-right">
            ثبت پروژه نقشه‌برداری
          </h1>

          <div
            class="flex items-center justify-between md:justify-end md:gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100"
          >
            <button
              @click="goToDashboard"
              class="text-xs font-medium text-gray-500 hover:text-red-600 flex items-center gap-1.5 transition-colors bg-gray-100 hover:bg-red-50 px-2.5 py-1.5 rounded-lg md:bg-transparent md:p-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              <span>خروج و بازگشت</span>
            </button>

            <span
              class="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 md:border-0 md:bg-transparent md:p-0"
            >
              مرحله {{ currentStep + 1 }} از {{ steps.length }}
            </span>
          </div>
        </div>

        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#008f55] transition-all duration-300"
            :style="{ width: progress + '%' }"
          />
        </div>
      </div>

      <div v-if="!isSubmitted" class="grid grid-cols-5 gap-1 mb-6" style="direction: rtl">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          @click="goToStep(index)"
          class="rounded-xl border items-center py-3 justify-center text-center transition-all cursor-pointer select-none"
          :class="[
            currentStep === index
              ? 'border-[#008f55] bg-emerald-50'
              : currentStep > index
                ? 'border-emerald-200 bg-white'
                : 'border-gray-200 bg-white',
          ]"
        >
          <div
            class="flex text-[8px] md:text-[13px] items-center justify-center font-semibold"
            :class="currentStep >= index ? 'text-[#008f55]' : 'text-gray-400'"
          >
            {{ step.title }}
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
        <div v-if="!isSubmitted">
          <div class="mb-8 text-right" style="direction: rtl">
            <h2 class="text-lg font-black text-gray-800">{{ currentStepData.question }}</h2>
          </div>

          <StepBasicInfo v-if="currentStepData.type === 'basic-info'" />
          <StepMapBoundary v-if="currentStepData.type === 'map-boundary'" />
          <StepTechnicalSpecs v-if="currentStepData.type === 'technical-specs'" />
          <StepTimingBudget v-if="currentStepData.type === 'timing-budget'" />
          <StepInvoice v-if="currentStepData.type === 'preview'" />

          <!-- بخش دکمه‌ها - بهینه‌سازی شده برای موبایل و دسکتاپ -->
          <div class="flex flex-col-reverse md:flex-row gap-3 mt-10" style="direction: rtl">
            <!-- دکمه انصراف و بازگشت (در موبایل پایین‌تر قرار می‌گیرد) -->
            <button
              @click="goToDashboard"
              type="button"
              class="w-full md:w-auto px-6 py-3 rounded-xl border border-red-200 text-red-500 font-bold hover:bg-red-50 transition-all md:mr-auto text-center"
            >
              انصراف و بازگشت
            </button>

            <div class="flex flex-row gap-3 w-full md:w-auto">
              <!-- دکمه مرحله قبل -->
              <button
                v-if="currentStep > 0"
                @click="previousStep"
                type="button"
                class="flex-1 md:flex-none px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all text-center"
              >
                مرحله قبل
              </button>

              <!-- دکمه ادامه / ثبت نهایی -->
              <button
                v-if="currentStep !== steps.length - 1"
                @click="nextStep"
                :disabled="!isStepValid"
                type="button"
                class="flex-1 md:flex-none md:min-w-[160px] py-3 px-6 rounded-xl font-bold transition-all text-center"
                :class="
                  isStepValid
                    ? 'bg-[#008f55] text-white hover:bg-[#007646]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                "
              >
                {{ currentStep === steps.length - 1 ? 'ثبت نهایی پروژه' : 'ادامه' }}
              </button>
            </div>
          </div>
        </div>

        <StepSuccess v-else :projectTitle="store.formData.title" @reset="handleResetForm" />
      </div>
    </div>

  </main>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useProjectStore } from '@/stores/project.store'

const store = useProjectStore()

// وضعیت باز یا بسته بودن منوی خروجی‌های پیشرفته (همچنان به صورت کشویی باقی بماند یا آن را هم باز کنید)
const showAdvancedSettings = ref(false)

// 🌟 تعیین خودکار روش اجرا بر اساس کتگوری انتخابی مرحله اول
// تعیین خودکار روش اجرا و پاکسازی/مقداردهی اولیه آرایه‌ها
watchEffect(() => {
  const category = store.formData.category

  if (category === 'gis' || category === 'drafting') {
    store.formData.surveyMethod = 'gis'
  } else if (category === 'drone') {
    store.formData.surveyMethod = 'aerial'
  } else if (category === 'mapping') {
    store.formData.surveyMethod = 'ground'
  } else {
    store.formData.surveyMethod = ''
  }

  // تضمین اینکه هیچ‌کدام از آرایه‌ها undefined نشوند
  const data = store.formData as any
  if (!data.specificSurveys) data.specificSurveys = []
  if (!data.requiredEquipment) data.requiredEquipment = []
  if (!data.groundTechnicalSpecs) data.groundTechnicalSpecs = []
  if (!data.aerialTechnicalSpecs) data.aerialTechnicalSpecs = []
  if (!data.gisTechnicalSpecs) data.gisTechnicalSpecs = []
  if (!data.outputFormats) data.outputFormats = []
})
const mapScales = [
  { scale: '1/100', accuracy: '۲ سانتی‌متر' },
  { scale: '1/200', accuracy: '۵ سانتی‌متر' },
  { scale: '1/500', accuracy: '۱۰ سانتی‌متر' },
  { scale: '1/1000', accuracy: '۲۰ سانتی‌متر' },
  { scale: '1/2000', accuracy: '۴۰ سانتی‌متر' },
  { scale: '1/5000', accuracy: '۱ متر' },
]

const outputFormatOptions = [
  { id: 'dwg', label: 'فایل اتوکد (DWG)' },
  { id: 'pdf', label: 'فایل PDF و نقشه چاپی' },
  { id: 'report', label: 'گزارش محاسباتی و متنی' },
]

// گزینه‌های روش زمینی
const groundSurveyOptions = [
  'نقشه‌برداری ثبتی و کاداستر',
  'نقشه‌برداری توپوگرافی',
  'نقشه‌برداری مسیر',
  'نقشه‌برداری کنترل و ترازیابی',
  'نقشه‌برداری پروفیل',
  'ایستگاه ماندگار',
]

const groundEquipmentOptions = [
  'دوربین توتال استیشن',
  'دستگاه GPS',
  'سیستم Base و Rover',
  'متر لیزری',
  'لیزر اسکنر',
]

const groundTechnicalOptions = [
  'ایستگاه ماندگار بتن سازمان نقشه‌برداری',
  'ایستگاه ماندگار سنگ ریشه دار',
  'ایستگاه ماندگار میخ و واشر',
  'برداشت سامانه شمیم',
  'منحنی میزان استاندارد سازمان نقشه‌برداری',
  'برداشت عوارض خاص',
  'نیاز به علامت برای نقاط برداشتی مسیر',
  'منحنی میزان',
  'توصیف عوارض (چاه، دکل، لبه جدول)',
]

const contourIntervalOptions = ['0.5', '1', '1.5', '2']

// گزینه‌های روش هوایی
const aerialSurveyOptions = [
  'نقشه فتوگرامتری',
  'نقشه توپوگرافی',
  'نقشه سه بعدی',
  'نقشه کاداستر و شهری',
  'نقشه مسیر',
  'نظارت هوشمند پروژه',
]

const aerialEquipmentOptions = [
  'پهپاد با ماژول RTK',
  'پهپاد ماتریس',
  'پهپاد مویک ۳',
  'پهپاد مویک ۲ پرو',
  'پهپاد فانتوم ۴ پرو',
]

const aerialTechnicalOptions = [
  'برداشت ایستگاه ماندگار بتن سازمان نقشه‌برداری',
  'برداشت نقاط کنترل',
  'برداشت عوارض خاص (پل، ساختمان، ...)',
  'شناسنامه نقاط',
  'پرواز مایل',
  'پرواز با تراکم بالا برای مدل سازی',
  'پرواز با تراکم بالا در نقاط روستایی و شهری',
  'پرواز ترکیبی عمودی و مایل',
]

const gisTechnicalOptions = [
  'ترسیم شبکه معابر',
  'ترسیم فضای سبز',
  'ترسیم عرصه و عیان',
  'جانمایی پلاک ثبتی',
  'تهیه نقشه برای شهرداری',
  'تهیه نقشه برای سند',
  'تعیین مساحت دقیق',
  'تفکیک اراضی',
  'تهیه نقشه برای دادگاه یا کارشناس رسمی',
  'GIS Ready',
]
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <!-- راهنمای ساده برای کارفرما -->
    <div class="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-start gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-5 h-5 text-sky-600 mt-0.5 shrink-0"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <p class="text-xs text-sky-900 leading-relaxed">
        مشخصات فنی و گزینه‌های زیر بر اساس نوع پروژه انتخابی شما به صورت هوشمند بارگذاری شده است.
        می‌توانید جزئیات دلخواه را انتخاب کنید.
      </p>
    </div>

    <!-- 🌟 ۱. اگر روش زمینی انتخاب شده باشد (حوزه Mapping) -->
    <div
      v-if="store.formData.surveyMethod === 'ground'"
      class="space-y-5 p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100"
    >
      <div class="flex items-center gap-2 pb-2 border-b border-emerald-100">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
        <h3 class="text-xs font-black text-emerald-900">تنظیمات تخصصی نقشه‌برداری زمینی</h3>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-2"
          >نوع نقشه‌برداری زمینی (چند انتخابی)</label
        >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="item in groundSurveyOptions"
            :key="item"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-emerald-400 transition-all bg-white"
            :class="{
              'bg-emerald-50/40 border-emerald-600': (
                store.formData as any
              ).specificSurveys.includes(item),
            }"
          >
            <input
              type="checkbox"
              :value="item"
              v-model="(store.formData as any).specificSurveys"
              class="accent-emerald-600 w-4 h-4"
            />
            <span class="text-xs font-medium text-gray-800">{{ item }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-2">تجهیزات مورد نیاز زمینی</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="eq in groundEquipmentOptions"
            :key="eq"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-emerald-400 transition-all bg-white"
            :class="{
              'bg-emerald-50/40 border-emerald-600': store.formData.requiredEquipment.includes(eq),
            }"
          >
            <input
              type="checkbox"
              :value="eq"
              v-model="store.formData.requiredEquipment"
              class="accent-emerald-600 w-4 h-4"
            />
            <span class="text-xs font-medium text-gray-800">{{ eq }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-emerald-900 mb-2"
          >مشخصات فنی و انتظارات زمینی</label
        >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="spec in groundTechnicalOptions"
            :key="spec"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-emerald-200 cursor-pointer hover:border-emerald-500 transition-all bg-white"
            :class="{
              'bg-emerald-100/60 border-emerald-600':
                store.formData.groundTechnicalSpecs.includes(spec),
            }"
          >
            <input
              type="checkbox"
              :value="spec"
              v-model="store.formData.groundTechnicalSpecs"
              class="accent-emerald-600 w-4 h-4"
            />
            <span class="text-xs font-medium text-emerald-950">{{ spec }}</span>
          </label>
        </div>

        <div
          v-if="store.formData.groundTechnicalSpecs.includes('منحنی میزان')"
          class="mt-3 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200"
        >
          <label class="block text-xs font-bold text-emerald-900 mb-2"
            >انتخاب فاصله منحنی میزان (متر)</label
          >
          <div class="flex gap-2">
            <button
              type="button"
              v-for="val in contourIntervalOptions"
              :key="val"
              @click="store.formData.contourInterval = val"
              :class="[
                'py-1.5 px-4 text-xs font-bold rounded-lg border transition-all',
                store.formData.contourInterval === val
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:border-emerald-400',
              ]"
            >
              {{ val }}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-1">توضیحات اختصاصی بخش زمینی</label>
        <textarea
          v-model="store.formData.groundDescription"
          rows="2"
          placeholder="نکات خاص یا شرایط محیطی مربوط به بخش زمینی..."
          class="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
        ></textarea>
      </div>
    </div>

    <!-- 🌟 ۲. اگر روش هوایی انتخاب شده باشد (حوزه Drone) -->
    <div
      v-if="store.formData.surveyMethod === 'aerial'"
      class="space-y-5 p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100"
    >
      <div class="flex items-center gap-2 pb-2 border-b border-indigo-100">
        <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
        <h3 class="text-xs font-black text-indigo-900">
          تنظیمات تخصصی نقشه‌برداری هوایی و فتوگرامتری
        </h3>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-2"
          >نوع نقشه‌برداری هوایی (چند انتخابی)</label
        >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="item in aerialSurveyOptions"
            :key="item"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-indigo-400 transition-all bg-white"
            :class="{
              'bg-indigo-50/40 border-indigo-600': (store.formData as any).specificSurveys.includes(
                item,
              ),
            }"
          >
            <input
              type="checkbox"
              :value="item"
              v-model="(store.formData as any).specificSurveys"
              class="accent-indigo-600 w-4 h-4"
            />
            <span class="text-xs font-medium text-gray-800">{{ item }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-2">تجهیزات مورد نیاز هوایی</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="eq in aerialEquipmentOptions"
            :key="eq"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-indigo-400 transition-all bg-white"
            :class="{
              'bg-indigo-50/40 border-indigo-600': store.formData.requiredEquipment.includes(eq),
            }"
          >
            <input
              type="checkbox"
              :value="eq"
              v-model="store.formData.requiredEquipment"
              class="accent-indigo-600 w-4 h-4"
            />
            <span class="text-xs font-medium text-gray-800">{{ eq }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-1"
          >نوع پوشش یا دقت پرواز هوایی</label
        >
        <input
          type="text"
          v-model="store.formData.aerialScaleOption"
          placeholder="مثلاً GSD معادل ۳ سانتیمتر بر پیکسل"
          class="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-indigo-900 mb-2"
          >مشخصات فنی خروجی‌ها و پرواز هوایی</label
        >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="spec in aerialTechnicalOptions"
            :key="spec"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-indigo-200 cursor-pointer hover:border-indigo-500 transition-all bg-white"
            :class="{
              'bg-indigo-100/60 border-indigo-600':
                store.formData.aerialTechnicalSpecs.includes(spec),
            }"
          >
            <input
              type="checkbox"
              :value="spec"
              v-model="store.formData.aerialTechnicalSpecs"
              class="accent-indigo-600 w-4 h-4"
            />
            <span class="text-xs font-medium text-indigo-950">{{ spec }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-1">توضیحات اختصاصی بخش هوایی</label>
        <textarea
          v-model="store.formData.aerialDescription"
          rows="2"
          placeholder="محدودیت‌های پروازی، موانع هوایی یا شرایط منطقه..."
          class="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
        ></textarea>
      </div>
    </div>

    <!-- 🌟 ۳. اگر روش GIS انتخاب شده باشد (حوزه GIS یا Drafting) -->
    <div
      v-if="store.formData.surveyMethod === 'gis'"
      class="space-y-5 p-5 bg-amber-50/30 rounded-2xl border border-amber-100"
    >
      <div class="flex items-center gap-2 pb-2 border-b border-amber-100">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
        <h3 class="text-xs font-black text-amber-900">تنظیمات تخصصی سیستم اطلاعات مکانی (GIS)</h3>
      </div>

      <div>
        <label class="block text-xs font-bold text-amber-900 mb-2">نوع خدمات و تحلیل‌های GIS</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="spec in gisTechnicalOptions"
            :key="spec"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-amber-200 cursor-pointer hover:border-amber-500 transition-all bg-white"
            :class="{
              'bg-amber-100/60 border-amber-600': store.formData.gisTechnicalSpecs.includes(spec),
            }"
          >
            <input
              type="checkbox"
              :value="spec"
              v-model="store.formData.gisTechnicalSpecs"
              class="accent-amber-600 w-4 h-4"
            />
            <span class="text-xs font-medium text-amber-950">{{ spec }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-1">توضیحات اختصاصی پروژه GIS</label>
        <textarea
          v-model="store.formData.gisDescription"
          rows="2"
          placeholder="فرمت لایه‌های ورودی، سیستم مختصات مرجع یا ساختار پایگاه داده..."
          class="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white"
        ></textarea>
      </div>
    </div>

    <!-- بخش مقیاس نقشه و خطای مجاز (برای زمینی و هوایی) -->
    <div
      v-if="store.formData.category === 'mapping' || store.formData.category === 'drone'"
      class="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100"
    >
      <label class="block text-xs font-bold text-emerald-900 mb-1">مقیاس نقشه مورد نیاز</label>
      <p class="text-[11px] text-emerald-700 mb-3">
        با انتخاب مقیاس، خطای مجاز به صورت خودکار پیشنهاد می‌شود. (اختیاری)
      </p>

      <div class="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
        <button
          type="button"
          v-for="item in mapScales"
          :key="item.scale"
          @click="store.setMapScale(item.scale)"
          :class="[
            'py-2.5 px-2 text-xs font-bold rounded-xl border transition-all',
            store.formData.mapScale === item.scale
              ? 'bg-[#008f55] text-white border-[#008f55] shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400',
          ]"
        >
          {{ item.scale }}
        </button>
      </div>

      <div
        v-if="store.formData.requiredAccuracy"
        class="flex items-center gap-2 pt-2 text-xs text-gray-600 border-t border-emerald-200/60"
      >
        <span>خطای مجاز محاسبه شده:</span>
        <span class="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg">
          ± {{ store.formData.requiredAccuracy }}
        </span>
      </div>
    </div>

    <hr class="border-gray-100 my-4" />

    <!-- بخش تنظیمات خروجی‌ها (اختیاری) -->
    <div class="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
      <button
        type="button"
        @click="showAdvancedSettings = !showAdvancedSettings"
        class="w-full p-4 flex items-center justify-between text-right font-bold text-xs text-gray-700 hover:bg-gray-100/80 transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-[#008f55] bg-emerald-100 px-2 py-0.5 rounded text-[10px]">اختیاری</span>
          <span>فرمت‌های خروجی مورد انتظار پروژه</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 text-gray-500 transition-transform duration-300"
          :class="{ 'rotate-180': showAdvancedSettings }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div v-if="showAdvancedSettings" class="p-4 pt-0 space-y-5 border-t border-gray-200 bg-white">
        <div class="pt-4">
          <label class="block text-xs font-bold text-gray-800 mb-2"
            >چه خروجی‌هایی از پروژه نیاز دارید؟</label
          >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label
              v-for="format in outputFormatOptions"
              :key="format.id"
              class="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-[#008f55] transition-all bg-white"
              :class="{
                'bg-emerald-50/40 border-[#008f55]': store.formData.outputFormats.includes(
                  format.id,
                ),
              }"
            >
              <input
                type="checkbox"
                :value="format.id"
                v-model="store.formData.outputFormats"
                class="accent-[#008f55] w-4 h-4"
              />
              <span class="text-xs font-medium text-gray-800">{{ format.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

خواسته من اینکه کد های کامپوننت setpTechnicalSpecs.vue بازنویسی بشه طوری که من میخواهم بازنویسی بشه
من ازت میخواهم قسمتی که نوشته چه خروجی از پروژه نیاز دارید باید بر اساس کتگوری که کارفرما تعیین کرده از بین سه حالت خروجی یکی رو که با کتگوری متناسب هست نشون بده
