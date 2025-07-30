import { Request, Response } from "express";
import { schemaValidator } from "../utils/schemaValidator";
import argon2 from "argon2";
import { userSchema } from "../utils/zodSchema";
import { prisma } from "../lib/prisma";

export const createUser = async (req: Request, res: Response) => {
  const userData = req.body;

  // Validate using Zod schema
  const validationResult = await schemaValidator(res, userSchema, userData);
  if (validationResult == null) 
  {
    return; // Validation failed, response already sent

  }

  try {
    // Hash password
    const hashedPassword = await argon2.hash(userData.password);
    userData.password = hashedPassword;

    // Create user in the database
    const newUser = await prisma.user.create({
      data: userData,
    });

    // Return created user (excluding password)
    const { password, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Error creating user:", error);
   return res.status(500).json({ message: "Internal server error" });
  }
};




