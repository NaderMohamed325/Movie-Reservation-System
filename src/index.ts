import { app } from "./app";
import { errorLogger, infoLogger } from "./configs";

//info logger
app.use(infoLogger);

//routers

//error logger
app.use(errorLogger);
app.listen(3000, () => {
  console.log(`Server is running on port 3000 on url : http://localhost:3000 `);
});
