import { z } from "zod";

export const createProjectSchema = z
  .object({
    title: z.string().optional().or(z.literal("")),
    category: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),

    province: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),

    // فیلدهای جدید برای نقشه برداری
    mappingType: z.enum(["area", "corridor"]).optional(),
    calculatedArea: z.number().nonnegative().optional(),
    corridorLength: z.number().nonnegative().optional(),

    areaSelectionMethod: z.string().optional().default("map"),
    polygonCoordinates: z.any().optional(), // استفاده از any برای انعطاف بیشتر در پارس اولیه
    geoJson: z.any().nullable().optional(),
    terrainTypes: z.array(z.string()).optional(),
    utmZone: z.string().optional(),
    techType: z.any().optional(),
    outputFormats: z.any().optional(),
    requiredAccuracy: z.string().optional(),
    mapScale: z.string().optional(),
    deliveryTime: z.string().optional(),
    budgetType: z
      .enum(["fixed", "hourly", "negotiable"])
      .optional()
      .default("fixed"),
    minBudget: z.union([z.string(), z.number()]).optional(),
    maxBudget: z.union([z.string(), z.number()]).optional(),
  })
  .partial();

export const updateProjectSchema = createProjectSchema;

export const acceptProposalSchema = z.object({
  finalAmount: z
    .union([z.number().positive(), z.string().regex(/^\d+$/)])
    .optional(),
});
