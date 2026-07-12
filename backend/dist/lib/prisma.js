"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
require("dotenv/config");
// ایجاد یک Pool از کانکشن‌ها با استفاده از متغیر محیطی
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
// پاس دادن adapter به کانستراکتور پریزما (الزامی در نسخه ۷ برای دیتابیس مستقیم)
exports.prisma = new client_1.PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
});
exports.default = exports.prisma;
