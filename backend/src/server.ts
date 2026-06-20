import express from "express";
import cors from "cors";
import profileRoutes from "./routes/profile.routes";

import authRoutes from "./routes/auth.routes";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

app.use("/api/profile", profileRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
