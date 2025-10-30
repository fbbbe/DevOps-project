// routes/authRoutes.js
import express from "express";
import { createUser, loginUser } from "../services/userService.js";

const router = express.Router();

// 회원가입
router.post("/signup", async (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email과 password는 필수입니다." });
  }

  try {
    const result = await createUser({ email, password, nickname });

    if (result.error === "DUP_EMAIL") {
      return res.status(409).json({ error: "이미 가입된 이메일입니다." });
    }

    // 정상 생성
    return res.status(201).json(result);
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ error: "회원가입 실패" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email과 password는 필수입니다." });
  }

  try {
    const result = await loginUser({ email, password });

    if (result.error === "BAD_CRED") {
      return res
        .status(401)
        .json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }
    if (result.error === "INACTIVE") {
      return res.status(403).json({ error: "비활성화된 계정입니다." });
    }

    return res.json(result);
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "로그인 실패" });
  }
});

export default router;
