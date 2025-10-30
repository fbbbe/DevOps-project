// routes/authRoutes.js
import express from "express";
import { createUser, loginUser } from "../services/userService.js";
import { issueTokenForUser } from "../services/sessionStore.js";

const router = express.Router();

// ?�원가??
router.post("/signup", async (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email�?password???�수?�니??" });
  }

  try {
    const result = await createUser({ email, password, nickname });

    if (result.error === "DUP_EMAIL") {
      return res.status(409).json({ error: "?��? 가?�된 ?�메?�입?�다." });
    }

    // ?�상 ?�성
    const token = issueTokenForUser(result);
    return res.status(201).json({ user: result, token });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ error: "?�원가???�패" });
  }
});

// 로그??
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email�?password???�수?�니??" });
  }

  try {
    const result = await loginUser({ email, password });

    if (result.error === "BAD_CRED") {
      return res
        .status(401)
        .json({ error: "?�메???�는 비�?번호가 ?�바르�? ?�습?�다." });
    }
    if (result.error === "INACTIVE") {
      return res.status(403).json({ error: "비활?�화??계정?�니??" });
    }

    const token = issueTokenForUser(result);
    return res.json({ user: result, token });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "로그???�패" });
  }
});

export default router;

