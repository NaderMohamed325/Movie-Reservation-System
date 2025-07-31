import { Request, Response } from "express";
import { schemaValidator } from "../utils/schemaValidator";
import argon2 from "argon2";
import { userSchema } from "../utils/zodSchema";
import { prisma } from "../lib/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import admin from "../firebase-config/fireAdmin";
import { JWT_SECRET_KEY, NODE_ENV } from "../envVariable";
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

    const token = jwt.sign({ userId: user.id }, JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict",
  });

  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
};

export const getMe = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  const userId = (jwt.verify(token, JWT_SECRET_KEY) as JwtPayload).userId;
  const userData = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      tickets: true,
      createdAt: true,
    },
  });
  res.status(201).json({
    status: "success",
    data: {
      userData,
    },
  });
};

export const patchMe = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  const userId = (jwt.verify(token, JWT_SECRET_KEY) as JwtPayload).userId;
  const { name, email } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
        },
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const patchMyPassword = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  const userId = (jwt.verify(token, JWT_SECRET_KEY) as JwtPayload).userId;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await argon2.verify(user.password, oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const hashedNewPassword = await argon2.hash(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
