import express, { Request, Response } from "express";
import dotenv from "dotenv";
// import client, { initializeDB } from "./config/db";
import jobRoutes from "./routes/job-config";

const cors =  require("cors")


// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors())


app.use(express.json());

app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "Hello from the backend!" });
});

// initializeDB();

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});

app.use("/api", jobRoutes);
