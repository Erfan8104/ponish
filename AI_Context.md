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

    name              String?
    avatar            String?
    bio               String?
    province          String?
    city              String?

    createdAt         DateTime  @default(now())
    updatedAt         DateTime  @updatedAt
    deletedAt         DateTime?

    // روابط موجود
    employerProfile       EmployerProfile?
    freelancerProfile     FreelancerProfile?
    projects              Project[]          @relation("EmployerProjects")
    proposals             Proposal[]
    contractsAsEmployer   Contract[]         @relation("EmployerContracts")
    contractsAsFreelancer Contract[]         @relation("FreelancerContracts")
    sentMessages          Message[]          @relation("SentMessages")
    receivedMessages      Message[]          @relation("ReceivedMessages")
    reviewsGiven          Review[]           @relation("ReviewsGiven")
    reviewsReceived       Review[]           @relation("ReviewsReceived")
    activityLogs          ActivityLog[]      @relation("AdminActivityLogs")
    otps                  OTP[]
    reportsCreated        Report[] @relation("ReportsCreated")
    reportsResolved       Report[] @relation("ReportsResolved")
    // 🌟 روابط جدید برای سیستم Permission
    adminRoles            UserAdminRole[]

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
    // targetRole  AdminRoleName?

    createdAt   DateTime         @default(now())

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
    targetType  ReportTargetType
    targetId    Int              // id کاربر / پروژه / پیام و ...

    reason      String           // دلیل کوتاه (مثلاً "محتوای نامناسب")
    description String?          // توضیح بیشتر
    status      ReportStatus     @default(pending)

    // ادمینی که رسیدگی کرده
    resolvedBy  Int?
    resolver    User?            @relation("ReportsResolved", fields: [resolvedBy], references: [id], onDelete: SetNull)
    resolvedAt  DateTime?
    adminNote   String?          // یادداشت ادمین

    createdAt   DateTime         @default(now())
    updatedAt   DateTime         @updatedAt

    @@index([targetType, targetId])
    @@index([status])
    @@index([reporterId])
    @@index([createdAt])

}

model ActivityLog {
id Int @id @default(autoincrement())
adminId Int
admin User @relation("AdminActivityLogs", fields: [adminId], references: [id], onDelete: Cascade)

    action      String   // مثلاً: "user.deactivate", "project.delete", "contract.cancel"
    targetType  String?  // "user" | "project" | "contract" | "proposal" | "payment" | "review" | "report" | ...
    targetId    Int?

    description String   // متن خوانا: "ادمین پروژه «نقشه‌برداری X» را حذف کرد"
    metadata    Json?    // اطلاعات اضافی (اختیاری)

    ipAddress   String?
    userAgent   String?

    createdAt   DateTime @default(now())

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

    role         AdminRole   @relation(fields: [roleId], references: [id], onDelete: Cascade)
    permission   Permission  @relation(fields: [permissionId], references: [id], onDelete: Cascade)

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

    user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
    role      AdminRole @relation(fields: [roleId], references: [id], onDelete: Cascade)

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

    terrainTypes          Json?            @default("[]")
    status                ProjectStatus    @default(draft)
    province              String?
    city                  String?
    address               String?
    corridorLength        Float?
    mappingType           String?
    calculatedArea        Float?

    utmZone               String?
    requiredAccuracy      String?
    mapScale              String?
    deliveryTime          String?
    budgetType            BudgetType       @default(fixed)
    minBudget             Decimal?         @db.Decimal(14, 2)
    maxBudget             Decimal?         @db.Decimal(14, 2)

    surveyMethod          String?
    specificSurveys       Json?            @default("[]")
    requiredEquipment     Json?            @default("[]")
    groundTechnicalSpecs  Json?            @default("[]")
    aerialTechnicalSpecs  Json?            @default("[]")
    aerialScaleOption     String?
    gisTechnicalSpecs     Json?            @default("[]")
    contourInterval       String?

    groundDescription     String?
    aerialDescription     String?
    gisDescription        String?
    polygonCoordinates    Json?
    geoJson               Json?
    isFeatured            Boolean          @default(false)
    viewCount             Int              @default(0)
    skills                ProjectSkill[]
    attachments           ProjectAttachment[]
    proposals             Proposal[]
    contract              Contract?
    createdAt             DateTime         @default(now())
    updatedAt             DateTime         @updatedAt
    publishedAt           DateTime?
    closedAt              DateTime?
    deletedAt             DateTime?
    techType              Json?
    outputFormats         Json?
    areaSelectionMethod   String?

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

xmart@xmart-HP-255-G8-Notebook-PC:~/Desktop/ponisha-clone$ tree -I node_modules
.
├── AI_Context.md
├── backend
│ ├── dist
│ │ ├── controllers
│ │ │ ├── admin.controller.js
│ │ │ ├── auth.controller.js
│ │ │ ├── contract.controller.js
│ │ │ ├── message.controller.js
│ │ │ ├── profile.controller.js
│ │ │ └── project.controller.js
│ │ ├── lib
│ │ │ └── prisma.js
│ │ ├── middleware
│ │ │ ├── admin.middleware.js
│ │ │ ├── auth.middleware.js
│ │ │ ├── avatarUpload.middleware.js
│ │ │ ├── upload.middleware.js
│ │ │ └── validation.middleware.js
│ │ ├── routes
│ │ │ ├── admin.routes.js
│ │ │ ├── auth.routes.js
│ │ │ ├── contract.routes.js
│ │ │ ├── message.routes.js
│ │ │ ├── profile.routes.js
│ │ │ └── project.routes.js
│ │ ├── server.js
│ │ ├── services
│ │ │ └── socket.service.js
│ │ ├── types
│ │ │ ├── contract.types.js
│ │ │ └── project.interface.js
│ │ ├── utils
│ │ │ ├── activityLog.js
│ │ │ └── notification.js
│ │ └── validators
│ │ ├── auth.validator.js
│ │ ├── profile.validator.js
│ │ └── project.validator.js
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
├── frontend
│ ├── env.d.ts
│ ├── eslint.config.ts
│ ├── index.html
│ ├── package.json
│ ├── package-lock.json
│ ├── public
│ │ ├── favicon.ico
│ │ ├── favicon.svg
│ │ └── images
│ │ ├── default-avatarl.png
│ │ └── default-avatar.png
│ ├── README.md
│ ├── src
│ │ ├── App.vue
│ │ ├── assets
│ │ │ ├── cta-bg-map.png
│ │ │ ├── geokar-logo-horizontal.svg
│ │ │ ├── homepage.mp4
│ │ │ ├── logo
│ │ │ │ └── geokar-logo-mark.svg
│ │ │ └── main.css
│ │ ├── components
│ │ │ ├── admin
│ │ │ │ ├── AdminLayout
│ │ │ │ │ ├── AdminHeader.vue
│ │ │ │ │ ├── AdminLayout.vue
│ │ │ │ │ └── AdminSidebar.vue
│ │ │ │ └── ui
│ │ │ │ ├── AdminBoundaryMapView.vue
│ │ │ │ ├── AdminCard.vue
│ │ │ │ ├── AdminFilter.vue
│ │ │ │ ├── AdminProjectPdfExporter.vue
│ │ │ │ ├── AdminSearch.vue
│ │ │ │ ├── AdminStatCard.vue
│ │ │ │ ├── AdminTable.vue
│ │ │ │ ├── AnalyticsChart.vue
│ │ │ │ ├── BulkActionBar.vue
│ │ │ │ ├── CategoryFormModal.vue
│ │ │ │ ├── ConfirmModal.vue
│ │ │ │ ├── ConversationDrawer.vue
│ │ │ │ ├── DatePicker.vue
│ │ │ │ ├── DeleteModal.vue
│ │ │ │ ├── GlobalSearch.vue
│ │ │ │ ├── MergeSkillsModal.vue
│ │ │ │ ├── NotificationBell.vue
│ │ │ │ ├── Pagination.vue
│ │ │ │ ├── SkillFormModal.vue
│ │ │ │ └── StatusBadge.vue
│ │ │ ├── common
│ │ │ │ └── ProjectTriggerButton.vue
│ │ │ ├── dashboard
│ │ │ │ ├── ActiveFreelancerProject.vue
│ │ │ │ ├── ProfileCard.vue
│ │ │ │ ├── ProjectCard.vue
│ │ │ │ ├── ProjectList.vue
│ │ │ │ └── UserEmployerProject.vue
│ │ │ ├── home
│ │ │ │ ├── EmployerCard.vue
│ │ │ │ ├── ExpertCard.vue
│ │ │ │ ├── FeaturesSection.vue
│ │ │ │ ├── HomeHero.vue
│ │ │ │ ├── HomeStats.vue
│ │ │ │ ├── PlatformSection.vue
│ │ │ │ └── ServicesGrid.vue
│ │ │ ├── layouts
│ │ │ │ ├── footer.vue
│ │ │ │ └── header.vue
│ │ │ ├── map
│ │ │ │ ├── LeafletBoundaryMap.vue
│ │ │ │ └── mapTab
│ │ │ │ ├── index.ts
│ │ │ │ ├── LeafletBoundaryMap.vue
│ │ │ │ ├── LeafletGeoJson.vue
│ │ │ │ ├── LeafletMap.vue
│ │ │ │ └── LeafletMarkerMap.vue
│ │ │ ├── modal
│ │ │ │ ├── ProfileImage.vue
│ │ │ │ ├── ProfileModal.vue
│ │ │ │ ├── ProjectDetailModal
│ │ │ │ │ ├── componentcontract
│ │ │ │ │ │ ├── AmendmentDetailModal.vue
│ │ │ │ │ │ ├── AmendmentFreelancerActions.vue
│ │ │ │ │ │ └── AmendmentStatusBanner.vue
│ │ │ │ │ ├── ContractUpdateWizard.vue
│ │ │ │ │ ├── ProjectChatTab.vue
│ │ │ │ │ ├── ProjectContractTab.vue
│ │ │ │ │ ├── ProjectFooter.vue
│ │ │ │ │ ├── ProjectHeader.vue
│ │ │ │ │ ├── ProjectInfoTab.vue
│ │ │ │ │ ├── ProjectMapTab.vue
│ │ │ │ │ ├── ProjectPdfExporter.vue
│ │ │ │ │ ├── ProjectProposalTab.vue
│ │ │ │ │ └── ProjectTabs.vue
│ │ │ │ ├── ProjectDetailModal.vue
│ │ │ │ ├── ProjectOptionsModal.vue
│ │ │ │ ├── ProposalModal.vue
│ │ │ │ ├── QuickProjectModal.vue
│ │ │ │ └── SearchModal.vue
│ │ │ └── stepProjectForm
│ │ │ ├── FileUploader.vue
│ │ │ ├── StepBasicInfo.vue
│ │ │ ├── StepInvoice.vue
│ │ │ ├── StepMapBoundary.vue
│ │ │ ├── StepTechnicalSpecs.vue
│ │ │ ├── StepTimingBudget.vue
│ │ │ └── SuccessCreateProject.vue
│ │ ├── main.ts
│ │ ├── pages
│ │ │ ├── AdminActivityLogPage.vue
│ │ │ ├── AdminAnalyticsPage.vue
│ │ │ ├── AdminCategoryPage.vue
│ │ │ ├── AdminContractDetailPage.vue
│ │ │ ├── AdminContractPage.vue
│ │ │ ├── AdminDashboardPage.vue
│ │ │ ├── AdminFilePage.vue
│ │ │ ├── AdminLoginPage.vue
│ │ │ ├── AdminMessagePage.vue
│ │ │ ├── AdminNotificationPage.vue
│ │ │ ├── AdminPaymentPage.vue
│ │ │ ├── AdminProjectDetailPage.vue
│ │ │ ├── AdminProjectPage.vue
│ │ │ ├── AdminProposalPage.vue
│ │ │ ├── AdminReportPage.vue
│ │ │ ├── AdminReviewPage.vue
│ │ │ ├── AdminSettingPage.vue
│ │ │ ├── AdminSkillPage.vue
│ │ │ ├── AdminUserDetailPage.vue
│ │ │ ├── AdminUserPage.vue
│ │ │ ├── consultationPage.vue
│ │ │ ├── CreateProjectPage.vue
│ │ │ ├── CreateUsername.vue
│ │ │ ├── DashboardPage.vue
│ │ │ ├── HomePage.vue
│ │ │ ├── LoginPage.vue
│ │ │ ├── OtpPage.vue
│ │ │ ├── PasswordPage.vue
│ │ │ ├── profilePage.vue
│ │ │ ├── SignupPage.vue
│ │ │ └── WelcomePage.vue
│ │ ├── router
│ │ │ └── index.ts
│ │ ├── schemas
│ │ │ ├── login.schema.ts
│ │ │ └── signup.schemas.ts
│ │ ├── services
│ │ │ ├── admin.service.ts
│ │ │ ├── api.ts
│ │ │ ├── auth.service.ts
│ │ │ ├── contract.service.ts
│ │ │ ├── message.service.ts
│ │ │ ├── profile.service.ts
│ │ │ └── project.service.ts
│ │ ├── stores
│ │ │ ├── admin.store.ts
│ │ │ ├── auth.store.ts
│ │ │ ├── buttoncreateproject.store.ts
│ │ │ ├── chat.store.ts
│ │ │ ├── contract.store.ts
│ │ │ ├── profile.modal.store.ts
│ │ │ ├── project.store.ts
│ │ │ ├── proposal.store.ts
│ │ │ ├── QuickProject.modal.store.ts
│ │ │ ├── role.store.ts
│ │ │ └── ui.store.ts
│ │ └── types
│ │ ├── auth.ts
│ │ ├── leaflet.d.ts
│ │ ├── project.ts
│ │ └── RoleUser.ts
│ ├── text.ts
│ ├── tsconfig.app.json
│ ├── tsconfig.json
│ ├── tsconfig.node.json
│ └── vite.config.ts
└── ponisha-images.tar.gz

68 directories, 234 files
xmart@xmart-HP-255-G8-Notebook-PC:~/Desktop/ponisha-clone$

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  MessageCircle,
  Phone,
  Mail,
  Compass,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plane,
  MapPin,
  Layers,
  HelpCircle,
} from 'lucide-vue-next'
import geokarMark from '@/assets/logo/geokar-logo-mark.svg'

type ProjectType = 'ground' | 'aerial' | 'gis' | 'unknown'
type ContactTime = 'morning' | 'noon' | 'evening'

const PROJECT_TYPES: { value: ProjectType; label: string; icon: any }[] = [
  { value: 'ground', label: 'زمینی', icon: MapPin },
  { value: 'aerial', label: 'هوایی (پهپاد)', icon: Plane },
  { value: 'gis', label: 'جی‌آی‌اس (GIS)', icon: Layers },
  { value: 'unknown', label: 'نمی‌دانم', icon: HelpCircle },
]

const form = ref({
  name: '',
  phone: '',
  email: '',
  projectType: '' as ProjectType | '',
  description: '',
  contactTime: '' as ContactTime | '',
})

const errors = ref<Record<string, string>>({})
const isLoading = ref(false)
const isSubmitted = ref(false)
const serverError = ref('')

const phonePattern = /^09\d{9}$/

const validate = (): boolean => {
  const next: Record<string, string> = {}

  if (!form.value.name.trim()) {
    next.name = 'لطفا نام خود را وارد کنید'
  }
  if (!phonePattern.test(form.value.phone.trim())) {
    next.phone = 'شماره موبایل باید به‌صورت 09xxxxxxxxx باشد'
  }
  if (!form.value.projectType) {
    next.projectType = 'نوع پروژه را انتخاب کنید'
  }
  if (!form.value.description.trim() || form.value.description.trim().length < 10) {
    next.description = 'توضیحات باید حداقل ۱۰ کاراکتر باشد'
  }

  errors.value = next
  return Object.keys(next).length === 0
}

const submit = async () => {
  serverError.value = ''
  if (!validate()) return

  try {
    isLoading.value = true

    // TODO: این بخش را به سرویس واقعی وصل کن، مثلا:
    // await requestConsultationApi(form.value)
    await new Promise((resolve) => setTimeout(resolve, 900))

    isSubmitted.value = true
  } catch (err: any) {
    serverError.value =
      err?.response?.data?.message || 'ارسال درخواست با خطا مواجه شد. دوباره تلاش کنید.'
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    phone: '',
    email: '',
    projectType: '',
    description: '',
    contactTime: '',
  }
  errors.value = {}
  isSubmitted.value = false
}

const charCount = computed(() => form.value.description.length)
</script>

<template>
  <div class="min-h-screen bg-[#F3F4F1]" dir="rtl">
    <!-- Top bar -->
    <div class="border-b border-[#E3E4DF] bg-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <RouterLink to="/" class="inline-flex items-center gap-2.5">
          <img :src="geokarMark" alt="GeoKar" class="h-9 w-9 rounded-xl shadow-sm" />
          <span class="text-[15px] font-semibold text-gray-800">GeoKar</span>
        </RouterLink>
        <RouterLink
          to="/"
          class="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>بازگشت به صفحه اصلی</span>
          <ChevronRight :size="14" />
        </RouterLink>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <!-- Success state -->
      <div
        v-if="isSubmitted"
        class="bg-white rounded-xl border border-[#E3E4DF] shadow-sm p-10 text-center max-w-lg mx-auto"
      >
        <div
          class="w-14 h-14 rounded-full bg-[#E7F0EA] flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle2 :size="28" class="text-[#1F6F54]" />
        </div>
        <h2 class="text-lg font-bold text-gray-900 mb-2">درخواست شما ثبت شد</h2>
        <p class="text-sm text-gray-500 leading-relaxed mb-6">
          یکی از متخصصین نقشه‌برداری ما تا ۲۴ ساعت آینده با شماره‌ی
          <span class="font-medium text-gray-700 tracking-wide" dir="ltr">{{ form.phone }}</span>
          تماس می‌گیرد.
        </p>
        <div class="flex items-center justify-center gap-3">
          <RouterLink
            to="/"
            class="px-5 py-2.5 rounded-md text-sm font-medium text-white bg-gradient-to-br from-cyan-500 to-indigo-600 hover:opacity-90 transition"
          >
            بازگشت به صفحه اصلی
          </RouterLink>
          <button
            @click="resetForm"
            class="px-5 py-2.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
          >
            ثبت درخواست جدید
          </button>
        </div>
      </div>

      <!-- Main content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-[#E3E4DF] shadow-sm p-6 sm:p-8">
          <div class="flex items-center gap-2 text-[#1F6F54] mb-2">
            <MessageCircle :size="18" />
            <span class="text-xs font-semibold tracking-wide">مشاوره رایگان و بدون تعهد</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            قبل از ثبت پروژه، با یک متخصص نقشه‌برداری مشورت کنید
          </h1>
          <p class="text-sm text-gray-500 leading-relaxed mb-8">
            فرم زیر را تکمیل کنید تا کارشناسان ما بهترین روش اجرا، برآورد زمان و بودجه‌ی تقریبی
            پروژه‌ی شما را بررسی و در سریع‌ترین زمان ممکن با شما تماس بگیرند.
          </p>

          <form class="space-y-5" @submit.prevent="submit">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5"
                  >نام و نام خانوادگی</label
                >
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="مثال: علی رضایی"
                  class="w-full h-11 px-3.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                  :class="errors.name ? 'border-red-400' : ''"
                />
                <p v-if="errors.name" class="text-red-600 text-xs mt-1">{{ errors.name }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">شماره موبایل</label>
                <div class="relative">
                  <input
                    v-model="form.phone"
                    type="text"
                    placeholder="09123456789"
                    dir="ltr"
                    class="w-full h-11 px-3.5 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                    :class="errors.phone ? 'border-red-400' : ''"
                  />
                  <Phone
                    :size="15"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
                <p v-if="errors.phone" class="text-red-600 text-xs mt-1">{{ errors.phone }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                ایمیل <span class="text-gray-400">(اختیاری)</span>
              </label>
              <div class="relative">
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="example@email.com"
                  dir="ltr"
                  class="w-full h-11 px-3.5 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                />
                <Mail :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2.5">نوع پروژه</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  v-for="type in PROJECT_TYPES"
                  :key="type.value"
                  type="button"
                  @click="form.projectType = type.value"
                  class="flex flex-col items-center gap-1.5 rounded-md border py-3 text-xs font-medium transition-colors"
                  :class="
                    form.projectType === type.value
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  "
                >
                  <component :is="type.icon" :size="18" />
                  {{ type.label }}
                </button>
              </div>
              <p v-if="errors.projectType" class="text-red-600 text-xs mt-1.5">
                {{ errors.projectType }}
              </p>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-sm font-medium text-gray-700">توضیح کوتاه پروژه</label>
                <span class="text-[11px] text-gray-400">{{ charCount }} کاراکتر</span>
              </div>
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="مثال: مساحی یک قطعه زمین کشاورزی حدود ۵ هکتار در استان البرز برای تفکیک سند..."
                class="w-full px-3.5 py-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                :class="errors.description ? 'border-red-400' : ''"
              ></textarea>
              <p v-if="errors.description" class="text-red-600 text-xs mt-1">
                {{ errors.description }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                بهترین زمان تماس <span class="text-gray-400">(اختیاری)</span>
              </label>
              <select
                v-model="form.contactTime"
                class="w-full h-11 px-3.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
              >
                <option value="">هر زمانی</option>
                <option value="morning">صبح (۹ تا ۱۲)</option>
                <option value="noon">ظهر (۱۲ تا ۱۶)</option>
                <option value="evening">عصر (۱۶ تا ۲۰)</option>
              </select>
            </div>

            <p v-if="serverError" class="text-red-600 text-sm">{{ serverError }}</p>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full h-12 rounded-md text-sm font-medium text-white bg-gradient-to-br from-cyan-500 to-indigo-600 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {{ isLoading ? 'در حال ارسال...' : 'ارسال درخواست مشاوره' }}
            </button>
          </form>
        </div>

        <!-- Sidebar -->
        <div class="space-y-5">
          <div class="bg-white rounded-xl border border-[#E3E4DF] shadow-sm p-6">
            <h3 class="text-sm font-semibold text-gray-800 mb-4">فرآیند مشاوره چطور است؟</h3>
            <ol class="space-y-4">
              <li class="flex gap-3">
                <span
                  class="w-6 h-6 shrink-0 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold flex items-center justify-center"
                  >۱</span
                >
                <span class="text-sm text-gray-600 leading-relaxed"
                  >فرم را تکمیل و ارسال می‌کنید</span
                >
              </li>
              <li class="flex gap-3">
                <span
                  class="w-6 h-6 shrink-0 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold flex items-center justify-center"
                  >۲</span
                >
                <span class="text-sm text-gray-600 leading-relaxed"
                  >یک متخصص نقشه‌برداری با شما تماس می‌گیرد</span
                >
              </li>
              <li class="flex gap-3">
                <span
                  class="w-6 h-6 shrink-0 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold flex items-center justify-center"
                  >۳</span
                >
                <span class="text-sm text-gray-600 leading-relaxed"
                  >روش اجرا و برآورد بودجه را دریافت می‌کنید</span
                >
              </li>
            </ol>
          </div>

          <div class="bg-white rounded-xl border border-[#E3E4DF] shadow-sm p-6">
            <div class="flex items-center gap-2 text-gray-700 mb-1.5">
              <Clock :size="16" />
              <span class="text-sm font-semibold">زمان پاسخ‌گویی</span>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">
              معمولاً در کمتر از ۲۴ ساعت کاری با شما تماس گرفته می‌شود.
            </p>
          </div>

          <div class="bg-slate-900 rounded-xl p-6 text-white">
            <Compass :size="20" class="text-cyan-400 mb-2" />
            <p class="text-sm leading-relaxed text-slate-200">
              مطمئن نیستید پروژه‌تان زمینی، هوایی یا GIS است؟ همین گزینه‌ی «نمی‌دانم» را انتخاب
              کنید؛ تشخیص روش مناسب هم بخشی از مشاوره‌ی رایگان است.
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

خب این ها کد های مربوط به فرم درخواست مشاوره هست . به نظرت دیتابیس با این کد ها همخوانی داره ایا باید در قسمت بک اند روتی واسه این کد ها قرار بگیره
