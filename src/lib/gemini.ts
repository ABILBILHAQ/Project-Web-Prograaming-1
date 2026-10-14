// Gemini AI & Sentiment Analysis Service for PKKMB Feedback

export type Sentiment = "positive" | "negative" | "neutral";

export interface SentimentAnalysisResult {
  sentiment: Sentiment;
  confidence: number;
  reasoning: string;
  source: "gemini" | "local";
}

const LOCAL_STORAGE_KEY = "GEMINI_API_KEY";

export function getGeminiApiKey(): string {
  if (typeof window !== "undefined") {
    const customKey = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (customKey && customKey.trim()) {
      return customKey.trim();
    }
  }
  return (import.meta.env.VITE_GEMINI_API_KEY as string || "").trim();
}

export function setGeminiApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }
}

// Indonesian sentiment word dictionaries for robust local fallback
const POSITIVE_WORDS = [
  "bagus", "baik", "keren", "mantap", "hebat", "seru", "menyenangkan", "ramah",
  "bermanfaat", "membantu", "edukatif", "informatif", "puas", "terima kasih",
  "terimakasih", "apresiasi", "sukses", "rapi", "jelas", "kompak", "disiplin",
  "semangat", "asyik", "memuaskan", "senang", "teratur", "terkoordinasi",
  "inspiratif", "berkesan", "menarik", "luar biasa", "mantul", "top", "suka",
  "nyaman", "tertib", "sigap", "bersahabat", "positif", "salut", "kerjasama"
];

const NEGATIVE_WORDS = [
  "buruk", "jelek", "kecewa", "membosankan", "bosan", "lama", "lambat", "molor",
  "panas", "kacau", "rusak", "kurang", "sulit", "susah", "tidak jelas", "gak jelas",
  "marah", "senioritas", "bentak", "bentakan", "tegang", "lelah", "capek", "letih",
  "dingin", "kotor", "bau", "sempit", "gaduh", "bising", "membingungkan",
  "menyusahkan", "memberatkan", "tertekan", "stress", "stres", "telat", "tidak ada",
  "kurang siap", "buruk sekali", "sia-sia", "boros", "rugi", "antre", "antri", "ribet"
];

const NEGATION_WORDS = ["tidak", "bukan", "kurang", "jangan", "belum", "tak", "nggak", "ga"];

export function analyzeSentimentLocally(text: string): SentimentAnalysisResult {
  const lower = text.toLowerCase();
  const words = lower.split(/[^a-zA-Z0-9_]+/).filter(Boolean);

  let positiveScore = 0;
  let negativeScore = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : "";
    const isNegated = NEGATION_WORDS.includes(prevWord);

    if (POSITIVE_WORDS.includes(word)) {
      if (isNegated) {
        negativeScore += 1.2;
      } else {
        positiveScore += 1;
      }
    } else if (NEGATIVE_WORDS.includes(word)) {
      if (isNegated) {
        positiveScore += 0.8;
      } else {
        negativeScore += 1.2;
      }
    }
  }

  let sentiment: Sentiment = "neutral";
  let confidence = 0.75;
  let reasoning = "";

  if (positiveScore > negativeScore && positiveScore >= 1) {
    sentiment = "positive";
    confidence = Math.min(0.96, 0.75 + (positiveScore - negativeScore) * 0.08);
    reasoning = "Komentar mengekspresikan kepuasan, pengalaman positif, dan apresiasi terhadap pelaksanaan kegiatan PKKMB.";
  } else if (negativeScore > positiveScore && negativeScore >= 1) {
    sentiment = "negative";
    confidence = Math.min(0.96, 0.75 + (negativeScore - positiveScore) * 0.08);
    reasoning = "Komentar mengutarakan kritik, keluhan, atau kendala yang dialami mahasiswa selama rangkaian acara PKKMB.";
  } else {
    sentiment = "neutral";
    confidence = 0.72;
    reasoning = "Komentar bersifat observasi umum, masukan berimbang, atau tidak memuat emosi dominan.";
  }

  return {
    sentiment,
    confidence: Number(confidence.toFixed(2)),
    reasoning,
    source: "local",
  };
}

export async function analyzeSentimentWithGemini(
  text: string,
  apiKeyOverride?: string
): Promise<SentimentAnalysisResult> {
  const apiKey = (apiKeyOverride || getGeminiApiKey()).trim();

  // If no API key provided, fall back immediately to local analyzer
  if (!apiKey) {
    return analyzeSentimentLocally(text);
  }

  const prompt = `Anda adalah sistem pakar analisis sentimen untuk evaluasi kegiatan PKKMB (Program Pengenalan Kehidupan Kampus bagi Mahasiswa Baru).
Analisis teks komentar mahasiswa berikut ini:
"${text}"

Tentukan:
1. sentimen: wajib salah satu dari ["positive", "negative", "neutral"]
2. confidence: nilai keyakinan antara 0.60 hingga 0.99 (angka desimal)
3. reasoning: alasan analisis sentimen dalam 1-2 kalimat ringkas dan jelas dalam Bahasa Indonesia.

Jawab HANYA dalam format JSON murni berikut tanpa tanda kutip markdown (\`\`\`json):
{
  "sentiment": "positive",
  "confidence": 0.95,
  "reasoning": "Komentar menunjukkan kepuasan terhadap..."
}`;

  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 256,
          },
        }),
      });

      if (!response.ok) {
        console.warn(`Gemini (${model}) returned status ${response.status}`);
        continue; // try next model if 404 or temporary issue
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleaned = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(cleaned);
      const rawSentiment = String(parsed.sentiment || "").toLowerCase().trim();

      let sentiment: Sentiment = "neutral";
      if (rawSentiment.includes("pos")) sentiment = "positive";
      else if (rawSentiment.includes("neg")) sentiment = "negative";
      else sentiment = "neutral";

      const confidence = Math.max(0.5, Math.min(0.99, Number(parsed.confidence) || 0.85));
      const reasoning = parsed.reasoning || (
        sentiment === "positive"
          ? "Komentar mengekspresikan kepuasan dan apresiasi mahasiswa baru terhadap PKKMB."
          : sentiment === "negative"
            ? "Komentar memuat kendala atau kritik yang dirasakan selama kegiatan PKKMB."
            : "Komentar memuat saran atau observasi netral mengenai kegiatan."
      );

      return {
        sentiment,
        confidence: Number(confidence.toFixed(2)),
        reasoning,
        source: "gemini",
      };
    } catch (err) {
      console.warn(`Gagal memanggil Gemini model ${model}:`, err);
    }
  }

  // If Gemini API calls fail (e.g. key invalid, network blocked, quota exceeded)
  console.warn("Menggunakan analisis lokal karena Gemini API tidak dapat dihubungi.");
  return analyzeSentimentLocally(text);
}

export async function generateRecommendationWithGemini(
  row: { comment: string; sentiment: Sentiment; confidence: number; prodi?: string | null },
  apiKeyOverride?: string
): Promise<{ text: string; source: "gemini" | "local" }> {
  const apiKey = (apiKeyOverride || getGeminiApiKey()).trim();

  const sentimenMap: Record<Sentiment, string> = {
    positive: "Positif",
    negative: "Negatif",
    neutral: "Netral",
  };
  const sentimenLabel = sentimenMap[row.sentiment] || row.sentiment;
  const confidencePct = Math.round(row.confidence * 100);

  if (apiKey) {
    const prompt = `Anda adalah konsultan ahli evaluasi akademik dan kegiatan kemahasiswaan PKKMB (Program Pengenalan Kehidupan Kampus bagi Mahasiswa Baru).
Analisis masukan mahasiswa berikut dan berikan rekomendasi tindak lanjut konkret untuk panitia PKKMB:

Data Masukan:
- Komentar: "${row.comment}"
- Program Studi: ${row.prodi || "Umum"}
- Sentimen Terdeteksi: ${sentimenLabel} (Keyakinan: ${confidencePct}%)

Susun respons secara profesional dalam Bahasa Indonesia dengan struktur berikut:
1. RINGKASAN MASALAH / POIN UTAMA:
(Ringkas isu pokok atau apresiasi yang disampaikan mahasiswa dalam 2-3 kalimat)

2. ANALISIS DAMPAK TERHADAP MAHASISWA BARU:
(Analisis singkat bagaimana hal ini mempengaruhi adaptasi dan kenyamanan mahasiswa baru)

3. REKOMENDASI TINDAKAN KONKRET:
- Tindakan Jangka Pendek (segera diperbaiki dalam evaluasi harian/mingguan)
- Tindakan Jangka Panjang (perbaikan SOP/kurikulum PKKMB tahun depan)

4. KESIMPULAN & TEMA:
Tema Teridentifikasi: [Tema, misal: Fasilitas & Konsumsi / Manajemen Waktu / Sikap Panitia / Konten Materi]
Sentimen: ${sentimenLabel}`;

    const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return { text, source: "gemini" };
          }
        }
      } catch (err) {
        console.warn(`Error generating recommendation with ${model}:`, err);
      }
    }
  }

  // Local fallback recommendation generator
  const isPositive = row.sentiment === "positive";
  const isNegative = row.sentiment === "negative";

  const localText = `1. RINGKASAN MASALAH / POIN UTAMA:
${isPositive
      ? `Mahasiswa mengapresiasi positif jalannya kegiatan PKKMB dengan komentar: "${row.comment}". Hal ini menunjukkan antusiasme yang tinggi terhadap rangkaian pengenalan kampus.`
      : isNegative
        ? `Terdapat keluhan atau catatan kritis dari mahasiswa: "${row.comment}". Masukan ini mengindikasikan adanya kendala teknis atau operasional yang perlu segera ditangani.`
        : `Mahasiswa memberikan masukan berimbang mengenai kegiatan PKKMB: "${row.comment}". Informasi ini dapat digunakan sebagai bahan evaluasi perbaikan umum.`}

2. ANALISIS DAMPAK TERHADAP MAHASISWA BARU:
${isPositive
      ? `Kegiatan yang berjalan baik meningkatkan rasa percaya diri dan keterikatan mahasiswa baru terhadap almamater.`
      : isNegative
        ? `Kendala yang dirasakan dapat menurunkan konsentrasi dan kenyamanan mahasiswa baru dalam menyerap materi orientasi.`
        : `Mahasiswa baru membutuhkan kejelasan informasi dan konsistensi pelaksanaan kegiatan agar proses adaptasi optimal.`}

3. REKOMENDASI TINDAKAN KONKRET:
- Tindakan Jangka Pendek:
  ${isPositive ? "• Pertahankan performa panitia dan sampaikan apresiasi kepada tim yang bertugas." : "• Segera tindak lanjuti kendala yang dilaporkan pada briefing harian panitia."}
  • Lakukan survei berkala di tiap akhir sesi untuk memantau kenyamanan peserta.
- Tindakan Jangka Panjang:
  • Dokumentasikan masukan ini ke dalam Laporan Pertanggungjawaban (LPJ) PKKMB.
  • Lakukan perbaikan SOP dan mitigasi risiko teknis untuk periode penerimaan mahasiswa baru mendatang.

4. KESIMPULAN & TEMA:
Tema Teridentifikasi: Evaluasi Operasional & Pengalaman Peserta PKKMB
Sentimen: ${sentimenLabel} (${confidencePct}%)`;

  return { text: localText, source: "local" };
}

export async function testGeminiApiKey(key: string): Promise<{ success: boolean; message: string }> {
  if (!key.trim()) {
    return { success: false, message: "API Key tidak boleh kosong." };
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key.trim()}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Tes koneksi. Jawab 'OK'." }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
    });
    if (response.ok) {
      return { success: true, message: "Koneksi ke Gemini API berhasil!" };
    }
    const errData = await response.json().catch(() => null);
    const errMsg = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    return { success: false, message: `Gagal: ${errMsg}` };
  } catch (err: any) {
    return { success: false, message: `Kesalahan jaringan: ${err?.message || "Tidak dapat menghubungi server Google"}` };
  }
}
