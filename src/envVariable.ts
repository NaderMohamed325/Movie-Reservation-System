import { from, logger } from "env-var";

// Load environment variables from process.env with optional logging
const env = from(process.env, {}, logger);

// Now extract and validate your variables
export const JWT_SECRET_KEY = env.get("JWT_SECRET_KEY").required().asString();
export const NODE_ENV = env.get("NODE_ENV").default("development").asString();
export const DATABASE_URL = env.get("DATABASE_URL").required().asString();
