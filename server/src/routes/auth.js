import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { getDbPool } from "../db.js";

const router = Router();

const LoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

// POST /api/v1/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const pool = await getDbPool();

    const [rows] = await pool.query(
      "SELECT id, email, password, role FROM users WHERE LOWER(email) = LOWER(?)",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Format email atau password tidak valid" });
    }
    next(err);
  }
});

// GET /api/v1/auth/check
router.get("/check", async (_req, res) => {
  res.json({ status: "ok" });
});

export default router;
