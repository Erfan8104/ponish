import { Request, Response, NextFunction } from "express";

// الگوی استاندارد برای شماره موبایل ایران
const PHONE_REGEX = /^09\d{9}$/;

/**
 * اعتبارسنجی شماره تلفن برای ارسال OTP
 */
const validateSendOtp = (req: Request, res: Response, next: NextFunction) => {
  const { phone } = req.body;

  if (!phone || !PHONE_REGEX.test(phone)) {
    return res.status(400).json({
      success: false,
      message:
        "شماره تلفن نامعتبر است. شماره باید ۱۱ رقم باشد و با 09 شروع شود.",
    });
  }

  next();
};

/**
 * اعتبارسنجی تایید OTP
 */
const validateVerifyOtp = (req: Request, res: Response, next: NextFunction) => {
  const { phone, code } = req.body;

  if (!phone || !PHONE_REGEX.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "شماره تلفن نامعتبر است.",
    });
  }

  if (!code || typeof code !== "string" || code.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "کد تایید الزامی است.",
    });
  }

  next();
};

const validateCompleteRegistration = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, role } = req.body;

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "نام کاربری الزامی است و باید حداقل ۳ کاراکتر باشد",
    });
  }

  const validRoles = ["employer", "freelancer", "both"];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "نقش انتخاب شده نامعتبر است",
    });
  }

  next();
};

export { validateSendOtp, validateVerifyOtp, validateCompleteRegistration };
