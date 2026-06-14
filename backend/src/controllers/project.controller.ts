import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { CreateProjectInput } from "./../types/project.interface";

const prisma = new PrismaClient();

export const createProject = async (
  req: Request<{}, {}, CreateProjectInput>,
  res: Response,
) => {
  try {
    const data = req.body;

    // ولیدیشن اولیه ساده (می‌توانید از Zod یا Joi هم استفاده کنید)
    if (!data.title || !data.province || !data.city) {
      res.status(400).json({ message: "اطلاعات اجباری وارد نشده است." });
      return;
    }

    // ذخیره در دیتابیس با Prisma
    const newProject = await prisma.project.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        province: data.province,
        city: data.city,
        address: data.address,
        areaSelectionMethod: data.areaSelectionMethod,
        polygonCoordinates: data.polygonCoordinates
          ? JSON.stringify(data.polygonCoordinates)
          : undefined,
        geoJson: data.geoJson
          ? JSON.parse(JSON.stringify(data.geoJson))
          : undefined,
        calculatedArea: Number(data.calculatedArea) || 0,
        coordinateSystem: data.coordinateSystem,
        utmZone: data.utmZone,
        techType: data.techType,
        outputFormats: data.outputFormats,
        requiredAccuracy: data.requiredAccuracy,
        deliveryTime: data.deliveryTime,
        budgetType: data.budgetType,
        minBudget: data.minBudget,
        maxBudget: data.maxBudget,
      },
    });

    res.status(201).json({
      message: "پروژه با موفقیت ثبت شد.",
      project: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "خطایی در سرور رخ داده است." });
  }
};
