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
  console.log("🌱 در حال درج اطلاعات اولیه و داده تستی...");

  // ============================================================
  // ۱. دسته‌بندی‌ها
  // ============================================================
  const categoriesData = [
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

  const categories: Record<string, { id: number }> = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = c;
  }
  console.log("✅ دسته‌بندی‌ها");

  // ============================================================
  // ۲. مهارت‌ها
  // ============================================================
  const skillsData = [
    { name: "توتال استیشن", slug: "total-station" },
    { name: "GPS/RTK", slug: "gps-rtk" },
    { name: "پهپاد / Drone", slug: "drone" },
    { name: "ArcGIS", slug: "arcgis" },
    { name: "QGIS", slug: "qgis" },
    { name: "اتوکد / Civil 3D", slug: "autocad" },
    { name: "نقشه‌برداری ثبتی", slug: "cadastral" },
    { name: "ارتوفتو", slug: "orthophoto" },
  ];

  const skills: Record<string, { id: number }> = {};
  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
    skills[s.slug] = skill;
  }
  console.log("✅ مهارت‌ها");

  // ============================================================
  // ۳. نقش‌های ادمین
  // ============================================================
  const adminRolesData = [
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

  for (const role of adminRolesData) {
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
  console.log("✅ نقش‌های ادمین");

  // ============================================================
  // ۴. دسترسی‌ها
  // ============================================================
  const permissions = [
    { key: "users.view", name: "مشاهده کاربران", group: "users" },
    { key: "users.create", name: "ایجاد کاربر", group: "users" },
    { key: "users.edit", name: "ویرایش کاربران", group: "users" },
    { key: "users.delete", name: "حذف کاربران", group: "users" },
    { key: "users.ban", name: "مسدود کردن کاربران", group: "users" },
    { key: "projects.view", name: "مشاهده پروژه‌ها", group: "projects" },
    { key: "projects.edit", name: "ویرایش پروژه‌ها", group: "projects" },
    { key: "projects.delete", name: "حذف پروژه‌ها", group: "projects" },
    { key: "projects.feature", name: "ویژه کردن پروژه", group: "projects" },
    { key: "proposals.view", name: "مشاهده پیشنهادها", group: "proposals" },
    {
      key: "proposals.manage",
      name: "مدیریت پیشنهادها (تایید/رد/حذف)",
      group: "proposals",
    },
    { key: "contracts.view", name: "مشاهده قراردادها", group: "contracts" },
    { key: "contracts.edit", name: "ویرایش قراردادها", group: "contracts" },
    { key: "contracts.cancel", name: "لغو قرارداد", group: "contracts" },
    { key: "payments.view", name: "مشاهده پرداخت‌ها", group: "payments" },
    { key: "payments.refund", name: "بازگشت وجه", group: "payments" },
    { key: "payments.export", name: "خروجی گزارش مالی", group: "payments" },
    {
      key: "categories.manage",
      name: "مدیریت دسته‌بندی‌ها",
      group: "categories",
    },
    { key: "skills.manage", name: "مدیریت مهارت‌ها", group: "skills" },
    { key: "reviews.view", name: "مشاهده نظرات", group: "reviews" },
    { key: "reviews.delete", name: "حذف نظرات", group: "reviews" },
    { key: "messages.view", name: "مشاهده پیام‌ها", group: "messages" },
    { key: "messages.delete", name: "حذف پیام‌ها", group: "messages" },
    { key: "reports.view", name: "مشاهده گزارش‌ها", group: "reports" },
    { key: "reports.export", name: "خروجی گزارش‌ها", group: "reports" },
    { key: "settings.view", name: "مشاهده تنظیمات", group: "settings" },
    { key: "settings.manage", name: "مدیریت تنظیمات", group: "settings" },
    { key: "roles.manage", name: "مدیریت نقش‌ها و دسترسی‌ها", group: "roles" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { name: perm.name, group: perm.group },
      create: perm,
    });
  }
  console.log("✅ دسترسی‌ها");

  // ============================================================
  // ۵. اختصاص دسترسی به نقش‌ها
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
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }
  console.log("✅ دسترسی‌ها به نقش‌ها");

  // ============================================================
  // ۶. کاربران ادمین
  // ============================================================
  const adminUsersData = [
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

  const adminUsers: Record<string, { id: number }> = {};
  for (const item of adminUsersData) {
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
    adminUsers[item.roleName] = user;

    const role = await prisma.adminRole.findUnique({
      where: { name: item.roleName },
    });
    if (role) {
      await prisma.userAdminRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      });
    }
    console.log(`  ✅ ${item.roleName} → ${item.phone} | ${item.password}`);
  }
  console.log("✅ کاربران ادمین");

  // ============================================================
  // ۷. تنظیمات سایت
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
  console.log("✅ تنظیمات");

  // ============================================================
  // ۸. کاربران عادی (کارفرما / فریلنسر)
  // ============================================================
  const normalPassword = await bcrypt.hash("UserPass123", 10);

  const employersData = [
    {
      phone: "09131111111",
      name: "علی رضایی",
      email: "ali@example.com",
      province: "تهران",
      city: "تهران",
      company: "شرکت عمرانی پارس",
    },
    {
      phone: "09132222222",
      name: "مریم احمدی",
      email: "maryam@example.com",
      province: "اصفهان",
      city: "اصفهان",
      company: "مهندسین مشاور سپهر",
    },
    {
      phone: "09133333333",
      name: "حسین کریمی",
      email: "hossein@example.com",
      province: "فارس",
      city: "شیراز",
      company: null,
    },
  ];

  const freelancersData = [
    {
      phone: "09141111111",
      name: "سارا محمدی",
      email: "sara@example.com",
      province: "تهران",
      city: "کرج",
      hourlyRate: 350000,
      skillSlugs: ["total-station", "gps-rtk", "autocad"],
    },
    {
      phone: "09142222222",
      name: "رضا نوری",
      email: "reza@example.com",
      province: "خراسان رضوی",
      city: "مشهد",
      hourlyRate: 420000,
      skillSlugs: ["drone", "orthophoto", "arcgis"],
    },
    {
      phone: "09143333333",
      name: "فاطمه حسینی",
      email: "fateme@example.com",
      province: "آذربایجان شرقی",
      city: "تبریز",
      hourlyRate: 300000,
      skillSlugs: ["qgis", "autocad", "cadastral"],
    },
    {
      phone: "09144444444",
      name: "امیر جعفری",
      email: "amir@example.com",
      province: "تهران",
      city: "تهران",
      hourlyRate: 500000,
      skillSlugs: ["total-station", "drone", "arcgis", "autocad"],
    },
  ];

  const bothUsersData = [
    {
      phone: "09151111111",
      name: "مهدی صادقی",
      email: "mehdi@example.com",
      province: "گیلان",
      city: "رشت",
      company: "نقشه‌برداری شمال",
      hourlyRate: 380000,
      skillSlugs: ["gps-rtk", "cadastral"],
    },
  ];

  const employers: { id: number; name: string }[] = [];
  for (const e of employersData) {
    const user = await prisma.user.upsert({
      where: { phone: e.phone },
      update: {
        name: e.name,
        email: e.email,
        role: "employer",
        isVerified: true,
        isActive: true,
        profileCompleted: true,
        province: e.province,
        city: e.city,
        password: normalPassword,
      },
      create: {
        phone: e.phone,
        password: normalPassword,
        name: e.name,
        email: e.email,
        role: "employer",
        isVerified: true,
        isActive: true,
        profileCompleted: true,
        province: e.province,
        city: e.city,
      },
    });
    await prisma.employerProfile.upsert({
      where: { userId: user.id },
      update: { companyName: e.company },
      create: { userId: user.id, companyName: e.company },
    });
    employers.push({ id: user.id, name: e.name });
  }

  const freelancers: { id: number; name: string }[] = [];
  for (const f of freelancersData) {
    const user = await prisma.user.upsert({
      where: { phone: f.phone },
      update: {
        name: f.name,
        email: f.email,
        role: "freelancer",
        isVerified: true,
        isActive: true,
        profileCompleted: true,
        province: f.province,
        city: f.city,
        password: normalPassword,
      },
      create: {
        phone: f.phone,
        password: normalPassword,
        name: f.name,
        email: f.email,
        role: "freelancer",
        isVerified: true,
        isActive: true,
        profileCompleted: true,
        province: f.province,
        city: f.city,
      },
    });
    const profile = await prisma.freelancerProfile.upsert({
      where: { userId: user.id },
      update: { hourlyRate: f.hourlyRate, rating: 4.2, completedJobs: 5 },
      create: {
        userId: user.id,
        hourlyRate: f.hourlyRate,
        rating: 4.2,
        completedJobs: 5,
      },
    });
    for (const slug of f.skillSlugs) {
      const skill = skills[slug];
      if (!skill) continue;
      await prisma.freelancerSkill.upsert({
        where: {
          freelancerProfileId_skillId: {
            freelancerProfileId: profile.id,
            skillId: skill.id,
          },
        },
        update: {},
        create: {
          freelancerProfileId: profile.id,
          skillId: skill.id,
          level: "advanced",
        },
      });
    }
    freelancers.push({ id: user.id, name: f.name });
  }

  // کاربر both
  for (const b of bothUsersData) {
    const user = await prisma.user.upsert({
      where: { phone: b.phone },
      update: {
        name: b.name,
        email: b.email,
        role: "both",
        isVerified: true,
        isActive: true,
        profileCompleted: true,
        province: b.province,
        city: b.city,
        password: normalPassword,
      },
      create: {
        phone: b.phone,
        password: normalPassword,
        name: b.name,
        email: b.email,
        role: "both",
        isVerified: true,
        isActive: true,
        profileCompleted: true,
        province: b.province,
        city: b.city,
      },
    });
    await prisma.employerProfile.upsert({
      where: { userId: user.id },
      update: { companyName: b.company },
      create: { userId: user.id, companyName: b.company },
    });
    const profile = await prisma.freelancerProfile.upsert({
      where: { userId: user.id },
      update: { hourlyRate: b.hourlyRate },
      create: { userId: user.id, hourlyRate: b.hourlyRate },
    });
    for (const slug of b.skillSlugs) {
      const skill = skills[slug];
      if (!skill) continue;
      await prisma.freelancerSkill.upsert({
        where: {
          freelancerProfileId_skillId: {
            freelancerProfileId: profile.id,
            skillId: skill.id,
          },
        },
        update: {},
        create: {
          freelancerProfileId: profile.id,
          skillId: skill.id,
          level: "intermediate",
        },
      });
    }
    employers.push({ id: user.id, name: b.name });
    freelancers.push({ id: user.id, name: b.name });
  }

  // یک کاربر غیرفعال برای تست فیلتر
  await prisma.user.upsert({
    where: { phone: "09160000000" },
    update: { isActive: false, name: "کاربر غیرفعال تست" },
    create: {
      phone: "09160000000",
      password: normalPassword,
      name: "کاربر غیرفعال تست",
      role: "employer",
      isVerified: false,
      isActive: false,
      profileCompleted: false,
    },
  });

  console.log("✅ کاربران عادی (رمز همه: UserPass123)");

  // ============================================================
  // ۹. پروژه‌ها
  // ============================================================
  const now = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  };

  const projectsData = [
    {
      title: "نقشه‌برداری زمینی باغ ویلا در لواسان",
      status: "open" as const,
      province: "تهران",
      city: "لواسان",
      categorySlug: "mapping",
      employerIdx: 0,
      minBudget: 15000000,
      maxBudget: 25000000,
      isFeatured: true,
      skillSlugs: ["total-station", "gps-rtk"],
      daysAgo: 2,
    },
    {
      title: "تهیه ارتوفتو از محدوده صنعتی کرج",
      status: "open" as const,
      province: "البرز",
      city: "کرج",
      categorySlug: "drone",
      employerIdx: 1,
      minBudget: 30000000,
      maxBudget: 45000000,
      isFeatured: false,
      skillSlugs: ["drone", "orthophoto"],
      daysAgo: 5,
    },
    {
      title: "تحلیل GIS مسیر خط لوله",
      status: "in_progress" as const,
      province: "خوزستان",
      city: "اهواز",
      categorySlug: "gis",
      employerIdx: 0,
      minBudget: 20000000,
      maxBudget: 35000000,
      isFeatured: false,
      skillSlugs: ["arcgis", "qgis"],
      daysAgo: 10,
    },
    {
      title: "نقشه ثبتی قطعه زمین در شیراز",
      status: "completed" as const,
      province: "فارس",
      city: "شیراز",
      categorySlug: "drafting",
      employerIdx: 2,
      minBudget: 8000000,
      maxBudget: 12000000,
      isFeatured: false,
      skillSlugs: ["cadastral", "autocad"],
      daysAgo: 20,
    },
    {
      title: "برداشت توپوگرافی پروژه ساختمانی",
      status: "draft" as const,
      province: "تهران",
      city: "تهران",
      categorySlug: "mapping",
      employerIdx: 1,
      minBudget: 10000000,
      maxBudget: 18000000,
      isFeatured: false,
      skillSlugs: ["total-station"],
      daysAgo: 1,
    },
    {
      title: "عکس‌برداری هوایی مزرعه کشاورزی",
      status: "cancelled" as const,
      province: "مازندران",
      city: "ساری",
      categorySlug: "drone",
      employerIdx: 2,
      minBudget: 12000000,
      maxBudget: 20000000,
      isFeatured: false,
      skillSlugs: ["drone"],
      daysAgo: 15,
    },
  ];

  const projects: {
    id: number;
    title: string;
    employerId: number;
    status: string;
  }[] = [];

  for (const p of projectsData) {
    const employer = employers[p.employerIdx % employers.length];
    const category = categories[p.categorySlug];
    const createdAt = daysAgo(p.daysAgo);

    const project = await prisma.project.create({
      data: {
        employerId: employer.id,
        categoryId: category?.id,
        title: p.title,
        slug:
          p.title.replace(/\s+/g, "-").slice(0, 40) +
          "-" +
          Date.now().toString(36),
        description: `توضیحات تست برای پروژه «${p.title}». این داده صرفاً برای تست پنل ادمین است.`,
        status: p.status,
        province: p.province,
        city: p.city,
        budgetType: "fixed",
        minBudget: p.minBudget,
        maxBudget: p.maxBudget,
        isFeatured: p.isFeatured,
        viewCount: Math.floor(Math.random() * 80) + 5,
        createdAt,
        publishedAt: p.status !== "draft" ? createdAt : null,
        closedAt:
          p.status === "completed" || p.status === "cancelled"
            ? daysAgo(p.daysAgo - 3)
            : null,
      },
    });

    for (const slug of p.skillSlugs) {
      const skill = skills[slug];
      if (!skill) continue;
      await prisma.projectSkill.create({
        data: { projectId: project.id, skillId: skill.id },
      });
    }

    // یک پیوست نمونه (مسیر فرضی — فایل واقعی لازم نیست برای لیست)
    await prisma.projectAttachment.create({
      data: {
        projectId: project.id,
        fileName: `map-${project.id}.pdf`,
        fileUrl: `projects/sample-${project.id}.pdf`,
        fileType: "application/pdf",
        fileSize: 250000 + project.id * 1000,
      },
    });

    projects.push({
      id: project.id,
      title: p.title,
      employerId: employer.id,
      status: p.status,
    });
  }
  console.log("✅ پروژه‌ها و پیوست‌ها");

  // ============================================================
  // ۱۰. پیشنهادها
  // ============================================================
  const openProjects = projects.filter((p) =>
    ["open", "in_progress", "completed"].includes(p.status),
  );

  const proposals: {
    id: number;
    projectId: number;
    freelancerId: number;
    status: string;
    amount: number;
  }[] = [];

  // روی پروژه open اول چند پیشنهاد pending
  const openProj = openProjects.find((p) => p.status === "open");
  if (openProj) {
    for (let i = 0; i < Math.min(3, freelancers.length); i++) {
      const fl = freelancers[i];
      const amount = 18000000 + i * 2000000;
      try {
        const prop = await prisma.proposal.create({
          data: {
            projectId: openProj.id,
            freelancerId: fl.id,
            amount,
            deliveryDays: 10 + i * 3,
            coverLetter: `سلام، آمادگی انجام پروژه «${openProj.title}» را دارم. تجربه مشابه دارم.`,
            status: "pending",
          },
        });
        proposals.push({
          id: prop.id,
          projectId: openProj.id,
          freelancerId: fl.id,
          status: "pending",
          amount,
        });
      } catch {
        // unique constraint
      }
    }
  }

  // پروژه in_progress → یک پیشنهاد accepted
  const inProgress = openProjects.find((p) => p.status === "in_progress");
  let acceptedProposalId: number | null = null;
  if (inProgress && freelancers[0]) {
    try {
      const prop = await prisma.proposal.create({
        data: {
          projectId: inProgress.id,
          freelancerId: freelancers[0].id,
          amount: 28000000,
          deliveryDays: 14,
          coverLetter: "پیشنهاد پذیرفته‌شده برای قرارداد فعال",
          status: "accepted",
        },
      });
      acceptedProposalId = prop.id;
      proposals.push({
        id: prop.id,
        projectId: inProgress.id,
        freelancerId: freelancers[0].id,
        status: "accepted",
        amount: 28000000,
      });
    } catch {
      /* ignore */
    }
  }

  // پروژه completed → پیشنهاد accepted
  const completed = openProjects.find((p) => p.status === "completed");
  let completedProposalId: number | null = null;
  if (completed && freelancers[1]) {
    try {
      const prop = await prisma.proposal.create({
        data: {
          projectId: completed.id,
          freelancerId: freelancers[1].id,
          amount: 10000000,
          deliveryDays: 7,
          coverLetter: "پروژه تکمیل‌شده",
          status: "accepted",
        },
      });
      completedProposalId = prop.id;
      proposals.push({
        id: prop.id,
        projectId: completed.id,
        freelancerId: freelancers[1].id,
        status: "accepted",
        amount: 10000000,
      });
    } catch {
      /* ignore */
    }
  }

  // چند پیشنهاد rejected
  if (openProj && freelancers[3]) {
    try {
      await prisma.proposal.create({
        data: {
          projectId: openProj.id,
          freelancerId: freelancers[3].id,
          amount: 50000000,
          deliveryDays: 30,
          coverLetter: "پیشنهاد رد شده تستی",
          status: "rejected",
        },
      });
    } catch {
      /* ignore */
    }
  }
  console.log("✅ پیشنهادها");

  // ============================================================
  // ۱۱. قراردادها + مایلستون + پرداخت
  // ============================================================
  let activeContractId: number | null = null;
  let completedContractId: number | null = null;

  if (inProgress && acceptedProposalId && freelancers[0]) {
    const contract = await prisma.contract.create({
      data: {
        projectId: inProgress.id,
        proposalId: acceptedProposalId,
        employerId: inProgress.employerId,
        freelancerId: freelancers[0].id,
        totalAmount: 28000000,
        status: "active",
        startedAt: daysAgo(8),
      },
    });
    activeContractId = contract.id;

    const m1 = await prisma.milestone.create({
      data: {
        contractId: contract.id,
        title: "پیش‌پرداخت و شروع کار",
        description: "۳۰٪ مبلغ",
        amount: 8400000,
        status: "paid",
        dueDate: daysAgo(5),
      },
    });
    await prisma.milestone.create({
      data: {
        contractId: contract.id,
        title: "تحویل میانی",
        description: "۴۰٪ مبلغ",
        amount: 11200000,
        status: "in_progress",
        dueDate: daysAgo(-5),
      },
    });
    await prisma.milestone.create({
      data: {
        contractId: contract.id,
        title: "تحویل نهایی",
        description: "۳۰٪ مبلغ",
        amount: 8400000,
        status: "pending",
        dueDate: daysAgo(-15),
      },
    });

    await prisma.payment.create({
      data: {
        contractId: contract.id,
        milestoneId: m1.id,
        amount: 8400000,
        status: "paid",
        gateway: "zarinpal",
        trackingCode: "TRK-" + Date.now().toString(36).toUpperCase(),
        paidAt: daysAgo(5),
      },
    });
    await prisma.payment.create({
      data: {
        contractId: contract.id,
        amount: 5000000,
        status: "pending",
        gateway: "zarinpal",
      },
    });
  }

  if (completed && completedProposalId && freelancers[1]) {
    const contract = await prisma.contract.create({
      data: {
        projectId: completed.id,
        proposalId: completedProposalId,
        employerId: completed.employerId,
        freelancerId: freelancers[1].id,
        totalAmount: 10000000,
        status: "completed",
        startedAt: daysAgo(18),
        completedAt: daysAgo(3),
      },
    });
    completedContractId = contract.id;

    const m = await prisma.milestone.create({
      data: {
        contractId: contract.id,
        title: "پرداخت کامل",
        amount: 10000000,
        status: "paid",
        dueDate: daysAgo(3),
      },
    });
    await prisma.payment.create({
      data: {
        contractId: contract.id,
        milestoneId: m.id,
        amount: 10000000,
        status: "paid",
        gateway: "zarinpal",
        trackingCode: "TRK-DONE-001",
        paidAt: daysAgo(3),
      },
    });

    // نظرات
    await prisma.review.create({
      data: {
        contractId: contract.id,
        reviewerId: completed.employerId,
        reviewedId: freelancers[1].id,
        target: "freelancer",
        rating: 5,
        comment: "کار عالی و دقیق انجام شد. توصیه می‌کنم.",
      },
    });
    await prisma.review.create({
      data: {
        contractId: contract.id,
        reviewerId: freelancers[1].id,
        reviewedId: completed.employerId,
        target: "employer",
        rating: 4,
        comment: "پرداخت به‌موقع و همکاری خوب.",
      },
    });
  }
  console.log("✅ قراردادها، مایلستون‌ها، پرداخت‌ها و نظرات");

  // ============================================================
  // ۱۲. پیام‌ها
  // ============================================================
  if (activeContractId && freelancers[0] && inProgress) {
    const msgs = [
      {
        senderId: inProgress.employerId,
        receiverId: freelancers[0].id,
        content: "سلام، پروژه را از کجا شروع می‌کنید؟",
        days: 7,
      },
      {
        senderId: freelancers[0].id,
        receiverId: inProgress.employerId,
        content: "سلام، فردا صبح در محل حاضر می‌شوم.",
        days: 7,
      },
      {
        senderId: freelancers[0].id,
        receiverId: inProgress.employerId,
        content: "برداشت اولیه انجام شد. فایل را فردا می‌فرستم.",
        days: 4,
      },
      {
        senderId: inProgress.employerId,
        receiverId: freelancers[0].id,
        content: "عالی، منتظر فایل هستم.",
        days: 3,
      },
    ];
    for (const m of msgs) {
      await prisma.message.create({
        data: {
          contractId: activeContractId,
          senderId: m.senderId,
          receiverId: m.receiverId,
          type: "text",
          content: m.content,
          createdAt: daysAgo(m.days),
        },
      });
    }
  }
  console.log("✅ پیام‌ها");

  // ============================================================
  // ۱۳. گزارش‌ها (Reports)
  // ============================================================
  if (freelancers[0] && employers[0]) {
    await prisma.report.create({
      data: {
        reporterId: freelancers[0].id,
        targetType: "user",
        targetId: employers[0].id,
        reason: "رفتار نامناسب",
        description: "در چت لحن توهین‌آمیز داشت.",
        status: "pending",
      },
    });
  }
  if (openProj && freelancers[1]) {
    await prisma.report.create({
      data: {
        reporterId: freelancers[1].id,
        targetType: "project",
        targetId: openProj.id,
        reason: "اطلاعات گمراه‌کننده",
        description: "بودجه اعلام‌شده با واقعیت پروژه همخوانی ندارد.",
        status: "reviewing",
      },
    });
  }
  if (completedContractId && freelancers[1]) {
    await prisma.report.create({
      data: {
        reporterId: employers[0]?.id || freelancers[0].id,
        targetType: "review",
        targetId: 1,
        reason: "نظر جعلی",
        description: "این نظر واقعی به نظر نمی‌رسد.",
        status: "resolved",
        resolvedBy: adminUsers.ADMIN?.id,
        resolvedAt: daysAgo(1),
        adminNote: "بررسی شد؛ مشکلی نبود.",
      },
    });
  }
  console.log("✅ گزارش‌ها");

  // ============================================================
  // ۱۴. اعلان‌ها (Notifications)
  // ============================================================
  const notificationsData = [
    {
      type: "new_user" as const,
      title: "کاربر جدید",
      message: "کاربر «سارا محمدی» ثبت‌نام کرد",
      link: "/admin/users",
      isRead: false,
      days: 1,
    },
    {
      type: "new_project" as const,
      title: "پروژه جدید",
      message: "پروژه «نقشه‌برداری زمینی باغ ویلا در لواسان» ایجاد شد",
      link: "/admin/projects",
      isRead: false,
      days: 2,
    },
    {
      type: "new_proposal" as const,
      title: "پیشنهاد جدید",
      message: "۳ پیشنهاد جدید روی پروژه‌های باز ثبت شد",
      link: "/admin/proposals",
      isRead: false,
      days: 1,
    },
    {
      type: "payment_received" as const,
      title: "پرداخت جدید",
      message: "پرداخت ۸٬۴۰۰٬۰۰۰ تومان با موفقیت انجام شد",
      link: "/admin/payments",
      isRead: true,
      days: 5,
    },
    {
      type: "new_report" as const,
      title: "گزارش جدید",
      message: "یک گزارش جدید در انتظار بررسی است",
      link: "/admin/reports",
      isRead: false,
      days: 0,
    },
    {
      type: "contract_amendment" as const,
      title: "درخواست اصلاح قرارداد",
      message: "درخواست اصلاح برای قرارداد فعال ثبت شده است",
      link: "/admin/contracts",
      isRead: false,
      days: 3,
    },
    {
      type: "system" as const,
      title: "سیستم",
      message: "داده تستی پنل ادمین با موفقیت بارگذاری شد",
      link: "/admin/dashboard",
      isRead: true,
      days: 0,
    },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({
      data: {
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        isRead: n.isRead,
        createdAt: daysAgo(n.days),
      },
    });
  }
  console.log("✅ اعلان‌ها");

  // ============================================================
  // ۱۵. لاگ فعالیت نمونه
  // ============================================================
  const superAdminId = adminUsers.SUPER_ADMIN?.id;
  if (superAdminId) {
    await prisma.activityLog.createMany({
      data: [
        {
          adminId: superAdminId,
          action: "settings.update",
          targetType: "settings",
          description: "ادمین تنظیمات سایت را به‌روزرسانی کرد",
          createdAt: daysAgo(2),
        },
        {
          adminId: superAdminId,
          action: "user.verify",
          targetType: "user",
          targetId: freelancers[0]?.id,
          description: `ادمین کاربر «${freelancers[0]?.name}» را تأیید کرد`,
          createdAt: daysAgo(1),
        },
        {
          adminId: adminUsers.ADMIN?.id || superAdminId,
          action: "project.feature",
          targetType: "project",
          targetId: projects[0]?.id,
          description: `ادمین پروژه «${projects[0]?.title}» را ویژه کرد`,
          createdAt: daysAgo(1),
        },
      ],
    });
  }
  console.log("✅ لاگ فعالیت نمونه");

  // ============================================================
  // خلاصه
  // ============================================================
  console.log("\n🎉 Seed تستی کامل شد!\n");
  console.log("────────── حساب‌های ادمین ──────────");
  console.log("SUPER_ADMIN  09120000000  AdminSecretPassword123");
  console.log("ADMIN        09121111111  AdminPass123");
  console.log("SUPPORT      09122222222  SupportPass123");
  console.log("FINANCE      09123333333  FinancePass123");
  console.log("MODERATOR    09124444444  ModPass123");
  console.log("────────── کاربران عادی ──────────");
  console.log("همه با رمز: UserPass123");
  console.log("کارفرما: 09131111111, 09132222222, 09133333333");
  console.log("فریلنسر: 09141111111 … 09144444444");
  console.log("Both:     09151111111");
  console.log("غیرفعال:  09160000000");
  console.log("──────────────────────────────────");
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
