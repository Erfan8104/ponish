export interface CreateAmendmentInput {
  proposed_area: number;
  proposed_amount: number;
  notes?: string;
}

export interface RespondAmendmentInput {
  status: "accepted" | "rejected";
}

// توسعه اینترفیس Request در اکسپرس برای پشتیبانی از دیتای کاربر احراز هویت شده
import { Request } from "express";
export interface AuthenticatedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
> extends Request<P, ResBody, ReqBody> {
  user?: {
    id: string;
    role: "employer" | "freelancer";
  };
}
