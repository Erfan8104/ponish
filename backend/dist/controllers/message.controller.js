"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatHistory = void 0;
const prisma_1 = require("../lib/prisma");
/**
 * ۱. دریافت تاریخچه پیام‌های یک قرارداد (اتاق چت)
 */
const getChatHistory = async (req, res) => {
    try {
        const contractId = Number(req.params.contractId);
        const userId = Number(req.user.userId);
        // بررسی اینکه آیا کاربر عضو این قرارداد هست یا خیر (امنیت چت)
        const contract = await prisma_1.prisma.contract.findUnique({
            where: { id: contractId },
        });
        if (!contract) {
            return res
                .status(404)
                .json({ success: false, message: "اتاق چت یافت نشد." });
        }
        if (contract.employerId !== userId && contract.freelancerId !== userId) {
            return res
                .status(403)
                .json({ success: false, message: "شما به این چت دسترسی ندارید." });
        }
        // دریافت پیام‌ها به ترتیب زمان ارسال
        const messages = await prisma_1.prisma.message.findMany({
            where: { contractId },
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        return res.json({ success: true, messages });
    }
    catch (error) {
        console.error("❌ getChatHistory error:", error);
        return res
            .status(500)
            .json({ success: false, message: "خطا در دریافت تاریخچه پیام‌ها" });
    }
};
exports.getChatHistory = getChatHistory;
