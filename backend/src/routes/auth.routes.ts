import { Router } from "express";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
const router = Router();

router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    const otp = "123456";

    await prisma.oTP.create({
      data: {
        phone,
        code: otp,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
      },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, code } = req.body;

    const otpRecord = await prisma.oTP.findFirst({
      where: {
        phone,
        code,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    let user = await prisma.user.findUnique({
      where: {
        phone,
      },
    });

    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          isVerified: true,
        },
      });

      isNewUser = true;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );
    await prisma.oTP.deleteMany({
      where: {
        phone,
      },
    });

    return res.json({
      success: true,
      token,
      isNewUser,
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user!.userId,
    },
  });

  return res.json(user);
});

router.post("/check-login-method", async (req, res) => {
  try {
    const { identifier } = req.body;

    const isPhone = /^09\d{9}$/.test(identifier);

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (isPhone) {
      return res.json({
        success: true,
        method: "otp",
      });
    }

    if (isEmail) {
      return res.json({
        success: true,
        method: "password",
      });
    }

    return res.status(400).json({
      success: false,
      message: "ورودی نامعتبر است",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
export default router;
