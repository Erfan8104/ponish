import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Ponisha API Running",
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
