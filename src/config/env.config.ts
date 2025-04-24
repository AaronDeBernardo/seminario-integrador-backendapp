import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "PRODUCTION",
  "EMAIL",
  "EMAIL_PASSWORD",
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
});

export const environment = {
  production: process.env.PRODUCTION === "true",
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
};
