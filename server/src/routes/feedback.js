import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { getDbPool } from "../db.js";

const router = Router();

const SENTIMENTS = ["positive", "negative", "neutral"];

const CreateSchema = z.object({
  name: z.string().trim().max(100).optional().nullable(),
  prodi: z.string().trim().min(2).max(100),
  comment: z.string().trim().min(5).max(2000),
  sentiment: z.enum(SENTIMENTS),
  confidence: z.coerce.number().min(0).max(1).optional().default(0.85),
});

const UpdateSchema = CreateSchema.partial();

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  sentiment: z.enum(SENTIMENTS).optional(),
  prodi: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  sort: z.enum(["created_at", "confidence"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// GET /api/v1/feedback/stats -> Statistik ringkasan
router.get("/stats", async (_req, res, next) => {
  try {
    const pool = await getDbPool();
    const [[totalRow]] = await pool.query("SELECT COUNT(*) as total FROM feedback");
    const [sentimentRows] = await pool.query(`
      SELECT sentiment, COUNT(*) as count 
      FROM feedback 
      GROUP BY sentiment
    `);
    const [prodiRows] = await pool.query(`
      SELECT prodi, COUNT(*) as count 
      FROM feedback 
      GROUP BY prodi 
      ORDER BY count DESC
    `);

    const sentiments = { positive: 0, negative: 0, neutral: 0 };
    sentimentRows.forEach((r) => {
      if (r.sentiment in sentiments) sentiments[r.sentiment] = Number(r.count);
    });

    res.json({
      total: Number(totalRow.total),
      sentiments,
      prodiDistribution: prodiRows.map((r) => ({ prodi: r.prodi, count: Number(r.count) })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/feedback -> list (paginated, filterable)
router.get("/", async (req, res, next) => {
  try {
    const q = ListQuerySchema.parse(req.query);
    const pool = await getDbPool();

    const whereClauses = [];
    const params = [];

    if (q.sentiment) {
      whereClauses.push("sentiment = ?");
      params.push(q.sentiment);
    }
    if (q.prodi && q.prodi !== "all") {
      whereClauses.push("prodi LIKE ?");
      params.push(`%${q.prodi}%`);
    }
    if (q.search) {
      whereClauses.push("(comment LIKE ? OR name LIKE ? OR prodi LIKE ?)");
      params.push(`%${q.search}%`, `%${q.search}%`, `%${q.search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Total count
    const [[countResult]] = await pool.query(
      `SELECT COUNT(*) as total FROM feedback ${whereSql}`,
      params
    );
    const total = Number(countResult.total);

    // Data rows
    const offset = (q.page - 1) * q.limit;
    const sortCol = q.sort === "confidence" ? "confidence" : "created_at";
    const sortDir = q.order === "asc" ? "ASC" : "DESC";

    const querySql = `
      SELECT id, name, prodi, comment, sentiment, CAST(confidence AS DOUBLE) as confidence, created_at
      FROM feedback 
      ${whereSql}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(querySql, [...params, q.limit, offset]);

    res.json({
      data: rows,
      pagination: {
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit) || 1,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid query parameters", details: err.flatten() });
    }
    next(err);
  }
});

// GET /api/v1/feedback/:id -> single item
router.get("/:id", async (req, res, next) => {
  try {
    const pool = await getDbPool();
    const [rows] = await pool.query(
      "SELECT id, name, prodi, comment, sentiment, CAST(confidence AS DOUBLE) as confidence, created_at FROM feedback WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Feedback tidak ditemukan" });
    }
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/feedback -> create (publik & admin)
router.post("/", async (req, res, next) => {
  try {
    const body = CreateSchema.parse(req.body);
    const pool = await getDbPool();

    const id = `fb-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const name = body.name || null;
    const confidence = body.confidence ?? 0.85;

    await pool.query(
      `INSERT INTO feedback (id, name, prodi, comment, sentiment, confidence, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, name, body.prodi, body.comment, body.sentiment, confidence]
    );

    const [created] = await pool.query(
      "SELECT id, name, prodi, comment, sentiment, CAST(confidence AS DOUBLE) as confidence, created_at FROM feedback WHERE id = ?",
      [id]
    );

    res.status(201).json({ data: created[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Data masukan tidak valid", details: err.flatten() });
    }
    next(err);
  }
});

// POST /api/v1/feedback/bulk -> import banyak data sekaligus
router.post("/bulk", async (req, res, next) => {
  try {
    const rawItems = Array.isArray(req.body) ? req.body : req.body.items || [];
    if (!rawItems.length) {
      return res.status(400).json({ error: "Array feedback tidak boleh kosong" });
    }

    const pool = await getDbPool();
    const validRows = [];

    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];
      const parsed = CreateSchema.safeParse(item);
      if (parsed.success) {
        const id = `bulk-${Date.now()}-${i}-${crypto.randomBytes(3).toString("hex")}`;
        validRows.push([
          id,
          parsed.data.name || null,
          parsed.data.prodi,
          parsed.data.comment,
          parsed.data.sentiment,
          parsed.data.confidence,
        ]);
      }
    }

    if (!validRows.length) {
      return res.status(400).json({ error: "Tidak ada data feedback yang valid untuk diimpor" });
    }

    await pool.query(
      `INSERT INTO feedback (id, name, prodi, comment, sentiment, confidence, created_at)
       VALUES ?`,
      [validRows]
    );

    res.status(201).json({
      success: true,
      message: `Berhasil mengimpor ${validRows.length} feedback`,
      count: validRows.length,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/feedback/:id -> update
router.put("/:id", async (req, res, next) => {
  try {
    const body = UpdateSchema.parse(req.body);
    if (Object.keys(body).length === 0) {
      return res.status(400).json({ error: "Harus ada minimal satu field untuk diperbarui" });
    }

    const pool = await getDbPool();
    const updates = [];
    const params = [];

    if (body.name !== undefined) {
      updates.push("name = ?");
      params.push(body.name);
    }
    if (body.prodi !== undefined) {
      updates.push("prodi = ?");
      params.push(body.prodi);
    }
    if (body.comment !== undefined) {
      updates.push("comment = ?");
      params.push(body.comment);
    }
    if (body.sentiment !== undefined) {
      updates.push("sentiment = ?");
      params.push(body.sentiment);
    }
    if (body.confidence !== undefined) {
      updates.push("confidence = ?");
      params.push(body.confidence);
    }

    params.push(req.params.id);

    const [result] = await pool.query(
      `UPDATE feedback SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Feedback tidak ditemukan" });
    }

    const [updated] = await pool.query(
      "SELECT id, name, prodi, comment, sentiment, CAST(confidence AS DOUBLE) as confidence, created_at FROM feedback WHERE id = ?",
      [req.params.id]
    );

    res.json({ data: updated[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Data update tidak valid", details: err.flatten() });
    }
    next(err);
  }
});

// DELETE /api/v1/feedback -> hapus semua data
router.delete("/", async (_req, res, next) => {
  try {
    const pool = await getDbPool();
    await pool.query("DELETE FROM feedback");
    res.json({ success: true, message: "Semua feedback berhasil dibersihkan" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/feedback/:id -> hapus satu data
router.delete("/:id", async (req, res, next) => {
  try {
    const pool = await getDbPool();
    const [result] = await pool.query("DELETE FROM feedback WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Feedback tidak ditemukan" });
    }
    res.json({ success: true, message: "Feedback berhasil dihapus" });
  } catch (err) {
    next(err);
  }
});

export default router;
