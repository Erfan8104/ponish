"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const prisma_1 = require("../lib/prisma");
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);
        // ۱. ورود به اتاق (اطمینان از تبدیل به String یکدست)
        socket.on("join_room", ({ contractId }) => {
            const roomName = `contract_${String(contractId)}`;
            socket.join(roomName);
            console.log(`👥 User ${socket.id} joined room: ${roomName}`);
        });
        // ۲. دریافت و پردازش پیام
        socket.on("send_message", async (data) => {
            const { contractId, senderId, receiverId, content, type } = data;
            // اعتبارسنجی اولیه آی‌دی فرستنده
            if (!senderId || Number(senderId) === 0) {
                console.error("❌ Error: senderId cannot be 0 or undefined");
                return;
            }
            try {
                // ذخیره پیام در دیتابیس
                const newMessage = await prisma_1.prisma.message.create({
                    data: {
                        contractId: Number(contractId),
                        senderId: Number(senderId),
                        receiverId: Number(receiverId),
                        content: content,
                        type: type || "text",
                    },
                    include: {
                        sender: {
                            select: { id: true, name: true, avatar: true },
                        },
                    },
                });
                // ارسال به اتاق مشخص با نام استاندارد شده
                const roomName = `contract_${String(contractId)}`;
                io.to(roomName).emit("receive_message", newMessage);
                console.log(`✉️ Message sent to room ${roomName}`);
            }
            catch (err) {
                // حتماً متن کامل خطا را در کنسول بک‌اند بررسی کنید
                console.error("❌ Socket message savings error:", err);
            }
        });
        socket.on("disconnect", () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
