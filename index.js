import express from "express";
import dotenv from "dotenv";
import http from "http"; //http -> https
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import airQualityRouter from "./src/routers/envPollutionRouter.js";
import detectImageRouter from "./src/routers/detectImageRouter.js";
import authRouter from "./src/routers/authRouter.js";
import recyclingRouter from "./src/routers/recyclingRouter.js";
import pollutedRouter from "./src/routers/contaminatedLocationRouter.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const httpsServer = http.createServer(app);

app.use(cors());
app.use(morgan("common"));
app.use(express.json({ limit: "200mb" }));
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    limit: "200mb",
    extended: true,
  })
);

app.get("/", async function (req, res) {
  res.send("Welcome to Cong Tuan 🥰😘😝");
});
// ===== ROUTER =====
app.use("/v1/air-quality", airQualityRouter);
app.use("/v1/detect", detectImageRouter);
app.use("/v1/auth", authRouter);
app.use("/v1/recycling", recyclingRouter);
app.use("/v1/polluted", pollutedRouter);

// connect to mongo database
(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log("Mongo connected");
  } catch (error) {
    console.error(error);
  }
})();

httpsServer.listen(process.env.PORT, function () {
  console.log("Express App running at http://127.0.0.1:" + process.env.PORT);
});
