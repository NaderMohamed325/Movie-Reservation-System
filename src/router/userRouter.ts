import { Router } from "express";
import { createUser } from "../controller/userController";

const userRouter = Router();

userRouter.post("/register", createUser);

export { userRouter };
