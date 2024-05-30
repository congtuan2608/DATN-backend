import dotenv from "dotenv";
dotenv.config();

export const DOMAIN =
  process.env.MODE === "DEV" ? process.env.DOMAIN_DEV : process.env.DOMAIN_PROD;
