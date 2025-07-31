import { Router } from "express";
import {
  createUser,
  getMe,
  loginUser,
  logoutUser,
  patchMe,
  patchMyPassword,
} from "../controller/userController";
import { authenticateJWT } from "../middlewares/isAuth";

const userRouter = Router();

userRouter
  .post("/register", createUser)
  .post("/login", loginUser)
  .get("/logout", authenticateJWT, logoutUser)
  .get("/me", authenticateJWT, getMe)
  .patch("/me", authenticateJWT, patchMe)
  .patch("/me/password", authenticateJWT, patchMyPassword);

export { userRouter };
