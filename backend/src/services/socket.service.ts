import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { prisma } from "../lib/prisma"; // فرض بر این است که پریزما در این مسیر است

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // کاربر با انتخاب یک قرارداد، وارد روم اختصاصی آن می‌شود
    socket.on("join_contract", (contractId: number) => {
      socket.join(`contract_${contractId}`);
      console.log(`👥 User joined room: contract_${contractId}`);
    });

    // مدیریت ارسال پیام جدید
    // مدیریت ارسال پیام جدید
    // در فایل socket.ts
    socket.on("send_message", async (data) => {
      const { contractId, content, senderId, type } = data;

      const parsedSenderId = parseInt(senderId as string);
      const parsedContractId = parseInt(contractId as string);
      console.log("========== SEND MESSAGE ==========");
      console.log("senderId:", senderId);
      console.log("parsedSenderId:", parsedSenderId);
      console.log("contractId:", parsedContractId);

      try {
        const contract = await prisma.contract.findUnique({
          where: { id: parsedContractId },
          select: { employerId: true, freelancerId: true },
        });

        if (!contract) return;

        const receiverId =
          parsedSenderId === contract.employerId
            ? contract.freelancerId
            : contract.employerId;

        // اصلاح بخش زیر:
        // فایل socket.ts - بخش ذخیره پیام
        const sender = await prisma.user.findUnique({
          where: {
            id: parsedSenderId,
          },
        });

        console.log("SENDER =", sender);
        const newMessage = await prisma.message.create({
          data: {
            content: content,
            type: type || "text",
            // فیلدهای عددی را مستقیماً ست کنید (بدون نیاز به connect)
            contractId: parsedContractId,
            senderId: parsedSenderId,
            receiverId: receiverId,
          },
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
        });

        io.to(`contract_${parsedContractId}`).emit(
          "receive_message",
          newMessage,
        );
      } catch (error) {
        console.error("Socket send_message error:", error);
      }
    });
    socket.on("disconnect", () => {
      console.log("❌ User disconnected");
    });
  });
};
