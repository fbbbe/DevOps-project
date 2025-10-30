// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import studyRoutes from "./routes/studyRoutes.js";
import { attachUserFromToken } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 헬스체크
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// 실제 API
app.use("/api", attachUserFromToken);
app.use("/api", authRoutes);   // /api/signup, /api/login
app.use("/api", studyRoutes);  // /api/studies

const PORT = process.env.PORT || 8181;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
