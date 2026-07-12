"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z
    .object({
    title: zod_1.z.string().optional().or(zod_1.z.literal("")),
    category: zod_1.z.string().optional().or(zod_1.z.literal("")),
    description: zod_1.z.string().optional().or(zod_1.z.literal("")),
    province: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    areaSelectionMethod: zod_1.z.string().optional().default("map"),
    polygonCoordinates: zod_1.z.array(zod_1.z.array(zod_1.z.number())).optional(),
    geoJson: zod_1.z.any().nullable().optional(),
    calculatedArea: zod_1.z.number().nonnegative().optional(),
    coordinateSystem: zod_1.z.string().optional(),
    utmZone: zod_1.z.string().optional(),
    techType: zod_1.z.array(zod_1.z.string()).optional(),
    outputFormats: zod_1.z.array(zod_1.z.string()).optional(),
    requiredAccuracy: zod_1.z.string().optional(),
    deliveryTime: zod_1.z.string().optional(),
    budgetType: zod_1.z
        .enum(["fixed", "hourly", "negotiable"])
        .optional()
        .default("fixed"),
    minBudget: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    maxBudget: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
})
    .partial(); // 👈 این متد تمام فیلدهای بالا را یکجا اختیاری می‌کند
exports.updateProjectSchema = exports.createProjectSchema;
