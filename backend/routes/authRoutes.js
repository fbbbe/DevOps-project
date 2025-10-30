// routes/authRoutes.js
import express from "express";
import { createUser, loginUser } from "../services/userService.js";
import { issueTokenForUser } from "../services/sessionStore.js";

const router = express.Router();

// ?Œì›ê°€??
router.post("/signup", async (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "emailê³?password???„ìˆ˜?…ë‹ˆ??" });
  }

  try {
    const result = await createUser({ email, password, nickname });

    if (result.error === "DUP_EMAIL") {
      return res.status(409).json({ error: "?´ë? ê°€?…ëœ ?´ë©”?¼ì…?ˆë‹¤." });
    }

    // ?•ìƒ ?ì„±
    const token = issueTokenForUser(result);
    return res.status(201).json({ user: result, token });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ error: "?Œì›ê°€???¤íŒ¨" });
  }
});

// ë¡œê·¸??
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "emailê³?password???„ìˆ˜?…ë‹ˆ??" });
  }

  try {
    const result = await loginUser({ email, password });

    if (result.error === "BAD_CRED") {
      return res
        .status(401)
        .json({ error: "?´ë©”???ëŠ” ë¹„ë?ë²ˆí˜¸ê°€ ?¬ë°”ë¥´ì? ?ŠìŠµ?ˆë‹¤." });
    }
    if (result.error === "INACTIVE") {
      return res.status(403).json({ error: "ë¹„í™œ?±í™”??ê³„ì •?…ë‹ˆ??" });
    }

    const token = issueTokenForUser(result);
    return res.json({ user: result, token });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "ë¡œê·¸???¤íŒ¨" });
  }
});

export default router;

