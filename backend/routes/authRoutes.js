// routes/authRoutes.js
import express from "express";
import { createUser, loginUser, updateUserNickname } from "../services/userService.js";
import { issueTokenForUser, revokeToken } from "../services/sessionStore.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "이메일과 비밀번호를 모두 입력해 주세요." });
  }

  try {
    const result = await createUser({ email, password, nickname });

    if (result.error === "DUP_EMAIL") {
      return res.status(409).json({ error: "이미 가입된 이메일입니다." });
    }

    const token = issueTokenForUser(result);
    return res.status(201).json({ user: result, token });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ error: "회원가입에 실패했습니다." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "이메일과 비밀번호를 모두 입력해 주세요." });
  }

  try {
    const result = await loginUser({ email, password });

    if (result.error === "BAD_CRED") {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }
    if (result.error === "INACTIVE") {
      return res.status(403).json({ error: "비활성화된 계정입니다." });
    }

    const token = issueTokenForUser(result);
    return res.json({ user: result, token });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "로그인에 실패했습니다." });
  }
});

router.patch("/profile/nickname", async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !currentUser.id) {
      return res.status(401).json({ error: "인증이 필요합니다." });
    }

    const { nickname } = req.body ?? {};
    if (typeof nickname !== "string" || nickname.trim() === "") {
      return res.status(400).json({ error: "닉네임을 입력해 주세요." });
    }

    const updated = await updateUserNickname({
      userId: currentUser.id,
      nickname,
    });

    const header = req.get("Authorization") || "";
    const prevToken = header.startsWith("Bearer ")
      ? header.slice(7).trim()
      : header.trim();
    if (prevToken) {
      revokeToken(prevToken);
    }

    const token = issueTokenForUser(updated);
    return res.json({ user: updated, token });
  } catch (err) {
    console.error("Update Nickname Error:", err);
    const message =
      err instanceof Error ? err.message : "닉네임을 수정할 수 없습니다.";
    return res.status(500).json({ error: message });
  }
});

export default router;
