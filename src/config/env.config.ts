import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "PRODUCTION",
  "PORT",
  "BACKEND_URL",
  "FRONTEND_URL",
  "EMAIL",
  "EMAIL_PASSWORD",
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "JWT_SECRET",
  "SESSION_DURATION_HOURS",
  "REFRESH_TIME_MINUTES",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
});

export const environment = {
  production: process.env.PRODUCTION === "true",
  systemUrls: {
    port: process.env.PORT,
    backendUrl: process.env.BACKEND_URL,
    frontendUrl: process.env.FRONTEND_URL,
  },
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  emailAccount: {
    email: process.env.EMAIL,
    password: process.env.EMAIL_PASSWORD,
  },
  session: {
    jwtSecret: process.env.JWT_SECRET as string,
    durationInHours: Number(process.env.SESSION_DURATION_HOURS),
    refreshTimeInMinutes: Number(process.env.REFRESH_TIME_MINUTES),
  },
};

if (
  !Number.isInteger(environment.session.durationInHours) ||
  environment.session.durationInHours < 1
)
  throw new Error("SESSION_DURATION_HOURS debe ser un número entero positivo.");

if (
  !Number.isInteger(environment.session.refreshTimeInMinutes) ||
  environment.session.refreshTimeInMinutes < 1
)
  throw new Error("REFRESH_TIME_MINUTES debe ser un número entero positivo.");
