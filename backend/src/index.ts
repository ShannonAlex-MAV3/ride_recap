import express, { Request, Response } from "express";
import dotenv from "dotenv";
import jobRoutes from "./routes/job-config";
import customerRoutes from "./routes/customer";
import dashboardRoutes from "./routes/dashboard";
import autoCareRoutes from "./routes/auto-care";
import mechanicRoutes from "./routes/mechanic";
import repairRoutes from "./routes/repair";
import logger from "./logger";
import { initializeStorageService } from "./services/storage/storage";

const cors = require("cors")

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors())


app.use(express.json());


// initializeDB();
initializeStorageService();

app.listen(port, () => {
  logger.info(`Backend listening at http://localhost:${port}`);
});

app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "Hello from the backend!" });
});

app.use("/api", jobRoutes);
app.use("/api", customerRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", autoCareRoutes);
app.use("/api", mechanicRoutes);
app.use("/api", repairRoutes);
