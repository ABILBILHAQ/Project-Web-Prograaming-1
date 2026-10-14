import { Router } from "express";
import { generateSaran } from "../lib/saranEngine.js";

const router = Router();

const GEMINI_MODEL = "gemini-1.5-flash";

/**
 * POST /api/generate-saran/proxy
 * Body: { reviews_text: string } | { comment: string }
 *
 * Alur:
 *  1. Jika GEMINI_API_KEY tersedia → gunakan Gemini API
 *  2. Fallback → gunakan engine analisis lokal (selalu tersedia)
 */
router.all("/proxy", async (req, res) => {
  try {
    const reviewText = String(
      req.body?.reviews_text || req.body?.comment || ""
    ).trim();

    if (!reviewText) {
      return res.status(400).json({
        error: "Parameter 'reviews_text' atau 'comment' wajib diisi.",
      });
    }

    // Ambil sentimen dan confidence dari request (dari ML model di database)
    const knownSentiment = req.body?.sentiment || null; // "positive", "negative", "neutral"
    const knownConfidence = req.body?.confidence ?? null;

    const sentimenMap = { positive: "Positif", negative: "Negatif", neutral: "Netral" };
    const sentimenLabel = sentimenMap[knownSentiment] || null;
    const confidencePct = knownConfidence != null ? (knownConfidence * 100).toFixed(0) : null;

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    // === Prioritas 1: Gemini API (jika API key tersedia) ===
    if (apiKey) {
      try {
        let prompt = `Anda adalah sistem evaluasi PKKMB (Program Pengenalan Kampus Mahasiswa Baru). Analisis komentar mahasiswa berikut dan berikan:\n1. RINGKASAN: Ringkasan singkat isi komentar (2-3 kalimat)\n2. REKOMENDASI: Saran konstruktif dan tindakan perbaikan yang spesifik\n\nKomentar mahasiswa: "${reviewText}"`;

        if (sentimenLabel) {
          prompt += `\n\nData sentimen dari model analisis:\n- Sentimen: ${sentimenLabel}\n- Tingkat keyakinan: ${confidencePct}%\n\nPENTING: Gunakan label sentimen "${sentimenLabel}" di atas sebagai acuan utama sentimen komentar ini. Jangan tentukan ulang sentimen secara mandiri.\n\nSertakan di akhir respons:\nTema teridentifikasi: [tema yang relevan]\nSentimen: ${sentimenLabel}`;
        }

        prompt += `\n\nBerikan respons dalam format yang terstruktur, profesional, dan dalam Bahasa Indonesia.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Tidak ada saran yang dihasilkan.";
          return res.json({ hasil_inferensi: text, source: "gemini" });
        }

        const errText = await geminiRes.text();
        console.warn("Gemini proxy gagal, fallback ke engine lokal:", geminiRes.status, errText);
      } catch (geminiErr) {
        console.warn("Gemini proxy error, fallback ke engine lokal:", geminiErr.message);
      }
    }

    // === Prioritas 2: Engine Analisis Lokal (selalu tersedia) ===
    const hasil = generateSaran(reviewText, knownSentiment);
    return res.json({ hasil_inferensi: hasil, source: "local-engine" });

  } catch (err) {
    console.error("proxyGenerateSaran error:", err);
    return res.status(502).json({ error: "Bad gateway", detail: String(err) });
  }
});

export default router;
