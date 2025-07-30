import { z } from "zod";
import { Response } from "express";

const schemaValidator = async (
  res: Response,
  modelSchema: z.ZodSchema,
  data: any
) => {
  try {
    const validatedData = modelSchema.parse(data);
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: error.issues,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
    return null;
  }
};

export { schemaValidator };
