// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import studyRoutes from "./routes/studyRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
import { getConnection } from "./db/oracle.js"; // ✅ DB 헬스체크에 사용

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 기본 헬스체크
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// ✅ DB 헬스체크 (지금 상태를 즉시 확인 가능)
app.get("/api/health/db", async (_req, res) => {
  try {
    const conn = await getConnection();
    const r = await conn.execute("SELECT 1 AS OK FROM dual");
    await conn.close();
    res.json({ ok: true, rows: r.rows });
  } catch (e) {
    console.error("[/api/health/db]", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// 실제 API
app.use("/api", authRoutes);     // /api/signup, /api/login
app.use("/api", studyRoutes);    // /api/studies
app.use("/api/topics", topicRoutes); // /api/topics, /api/topics/options

const PORT = process.env.PORT || 8181;
const server = app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

// (선택) 포트 점유 에러 메시지 명확화
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is in use. Kill the process using it or change PORT in .env.`);
    process.exit(1);
  }
});
