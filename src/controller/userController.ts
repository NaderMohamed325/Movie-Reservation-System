import { Request, Response } from "express";
import { schemaValidator } from "../utils/schemaValidator";
import argon2 from "argon2";
import { userSchema } from "../utils/zodSchema";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
export const createUser = async (req: Request, res: Response) => {
  const userData = req.body;

  // Validate using Zod schema
  const validationResult = await schemaValidator(res, userSchema, userData);
  if (validationResult == null) {
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

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Missing fields",
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }
   const tokenStored = req.cookies.token;
   
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Logged in",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
