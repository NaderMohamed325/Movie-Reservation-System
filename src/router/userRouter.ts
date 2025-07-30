import { Router } from "express";
import { createUser, loginUser } from "../controller/userController";

const userRouter = Router();

userRouter.post("/register", createUser).post("/login", loginUser);
export { userRouter };
