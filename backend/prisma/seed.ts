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
