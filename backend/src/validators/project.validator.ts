import { z } from "zod";

export const createProjectSchema = z
  .object({
    title: z.string().optional().or(z.literal("")),
    category: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    province: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    areaSelectionMethod: z.string().optional().default("map"),
    polygonCoordinates: z.array(z.array(z.number())).optional(),
    geoJson: z.any().nullable().optional(),
    calculatedArea: z.number().nonnegative().optional(),
    coordinateSystem: z.string().optional(),
    utmZone: z.string().optional(),
    techType: z.array(z.string()).optional(),
    outputFormats: z.array(z.string()).optional(),
    requiredAccuracy: z.string().optional(),
    deliveryTime: z.string().optional(),
    budgetType: z
      .enum(["fixed", "hourly", "negotiable"])
      .optional()
      .default("fixed"),
    minBudget: z.union([z.string(), z.number()]).optional(),
    maxBudget: z.union([z.string(), z.number()]).optional(),
  })
  .partial(); // 👈 تمام فیلدهای بالا را یکجا اختیاری می‌کند

export const updateProjectSchema = createProjectSchema;

/**
 * ==========================================
 * اسکیمای تایید پروپوزال (تغییر قیمت توافقی چت)
 * ==========================================
 */
export const acceptProposalSchema = z.object({
  // فیلد فینال‌امونت کاملاً اختیاری است و می‌تواند عدد یا رشته عددی باشد
  finalAmount: z
    .union([z.number().positive(), z.string().regex(/^\d+$/)])
    .optional(),
});
