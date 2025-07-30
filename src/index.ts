import { NextFunction, Request, Response } from "express";
import { app } from "./app";
import { errorLogger, infoLogger } from "./configs";
import { userRouter } from "./router/userRouter";

//info logger
app.use(infoLogger);

//routers
app.use("/api/users", userRouter);

//error logger
app.use(errorLogger);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

app.listen(3000, () => {
  console.log(`Server is running on port 3000 on url : http://localhost:3000 `);
});
