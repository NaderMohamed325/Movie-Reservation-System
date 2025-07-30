import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { xss } from "express-xss-sanitizer";
import { limiter } from "./configs";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cors());
app.use(cookieParser());
app.use(limiter);
app.use(xss());

export { app };
