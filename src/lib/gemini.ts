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

// ─── Kamus Sentimen Indonesia (Formal + Gaul + Campuran) ─────────────────────
//
// Mencakup:
//  • Bahasa Indonesia formal/baku
//  • Bahasa gaul / slang anak muda (jaksel, medsos, kampus)
//  • Singkatan & typo umum  (tks, thx, gws, otw, dll.)
//  • Bahasa campuran Indo-English (mix language)
//  • Ekspresi emosional medsos & chat (mantul, bestie, vibes, dsb.)

const POSITIVE_WORDS = [
  // ── Formal / Baku ──
  "bagus", "baik", "keren", "mantap", "hebat", "seru", "menyenangkan", "ramah",
  "bermanfaat", "membantu", "edukatif", "informatif", "puas", "terima kasih",
  "terimakasih", "apresiasi", "sukses", "rapi", "jelas", "kompak", "disiplin",
  "semangat", "asyik", "memuaskan", "senang", "teratur", "terkoordinasi",
  "inspiratif", "berkesan", "menarik", "luar biasa", "top", "suka",
  "nyaman", "tertib", "sigap", "bersahabat", "positif", "salut", "kerjasama",
  "terbaik", "unggul", "andal", "prima", "optimal", "mumpuni", "mengesankan",
  "mengagumkan", "memukau", "istimewa", "gemilang", "cemerlang", "elegan",
  "berkualitas", "terampil", "profesional", "tanggap", "responsif", "aktif",
  "produktif", "kreatif", "inovatif", "efektif", "efisien", "terorganisir",
  "kompeten", "menyentuh", "hangat", "harmonis", "solid", "antusias",
  "bersemangat", "gembira", "bahagia", "ceria", "meriah", "hidup",
  "berguna", "berfaedah", "mendukung", "memberdayakan",

  // ── Bahasa Gaul / Slang ──
  "mantul", "mantab", "mantep", "mantepp", "mantapp",
  "kece", "kece badai", "kece parah",
  "asik", "asiik", "asikk", "asyikk",
  "gokil", "goks", "gokss",
  "ajib", "ajibb", "ajibbb",
  "cakep", "cakeppp",
  "jos", "joss", "josss", "jos gandos",
  "okee", "okeee", "oke banget", "oke bgt",
  "wkwk", "wkwkwk", "haha", "hahaha",        // tawa = sinyal positif
  "uwu", "lucu", "gemesin", "gemesh", "gemes",
  "sabi", "sabii",                             // "bisa" (dibalik) = setuju/oke
  "gaskeun", "gaspol", "gas",                  // semangat / positif
  "cuss", "cusss",
  "buset", "busett",                           // ekspresi takjub positif
  "sultan", "dewa", "legend", "legenda",
  "auto seneng", "auto happy",
  "niat banget", "niat bgt",
  "totalitas", "totality",
  "sat set", "satset", "sat set sat set",      // efisien & cepat
  "receh", "ngakak",                           // konteks lucu = positif
  "kelar", "beres",                            // selesai dengan baik
  "juara", "champion",
  "worth it", "worthit",
  "blessed", "bersyukur", "grateful",
  "healing", "refreshing",
  "relate", "relatable",
  "slay", "slaying",
  "bestie", "besttt",
  "goals", "life goals",
  "baper positif",
  "amaze", "amazed", "amazing",
  "proud", "bangga",

  // ── Singkatan Gaul ──
  "tks", "thx", "thanks", "thankyou", "makasih", "makasi", "maksi",
  "mksih", "tengkyu", "tengkyuu", "tenkyu", "nuhun", "maturnuwun",
  "gpp", "gapapa", "ga papa",                  // konteks positif: "gak masalah"
  "otw", "lfg",                                // "on the way", "lets go" = antusias
  "yoi", "yoii", "yess", "yesss",
  "sipp", "sippp", "siap", "siaap",
  "woke", "wokee",
  "bet", "bett", "bgt", "bngett", "bngt", "banget", "bener",
  "emg", "emang", "emng",                      // penegasan
  "pol", "poll",                               // "penuh" = intensifier positif
  "pake banget", "pake bgt",
  "sih", "sihh",                               // penegasan lembut
  "deh", "dehh",

  // ── Campuran Indo-English ──
  "good", "great", "nice", "cool", "awesome", "excellent", "perfect",
  "love", "lovely", "wonderful", "fantastic", "superb", "outstanding",
  "well done", "well organized", "well prepared",
  "happy", "enjoy", "enjoyed", "enjoyable", "fun",
  "helpful", "useful", "clear", "organized", "smooth",
  "impressive", "incredible", "brilliant", "remarkable",
  "best", "better", "improved",
  "so good", "very good", "really good", "pretty good",
  "so fun", "very fun",
  "highly recommended", "recommended",
  "satisfied", "comfortable",
  "worth", "valuable",
  "support", "supportive",
  "friendly", "kind", "caring",
  "excited", "exciting",
  "motivated", "inspiring",
  "thank you", "thank u", "tq",
  "appreciate", "appreciated",

  // ── Ekspresi Campuran Gaul+English ──
  "good vibes", "vibes nya", "vibes nya bagus", "vibes nya enak",
  "literally bagus", "literally keren",
  "so worth it",
  "the best sih", "the best deh", "the best lah",
  "so proud",
  "i love it", "love banget", "love bgt",
  "super keren", "super bagus", "super seru",
  "ngl bagus", "ngl keren",                    // "not gonna lie"
  "no cap bagus", "no cap keren",
  "real talk bagus",
  "lowkey suka", "lowkey bagus",
  "highkey suka", "highkey bagus",
  "it hits different",
];

const NEGATIVE_WORDS = [
  // ── Formal / Baku ──
  "buruk", "jelek", "kecewa", "membosankan", "bosan", "lama", "lambat", "molor",
  "panas", "kacau", "rusak", "kurang", "sulit", "susah", "tidak jelas", "gak jelas",
  "marah", "senioritas", "bentak", "bentakan", "tegang", "lelah", "capek", "letih",
  "dingin", "kotor", "bau", "sempit", "gaduh", "bising", "membingungkan",
  "menyusahkan", "memberatkan", "tertekan", "stress", "stres", "telat", "tidak ada",
  "kurang siap", "buruk sekali", "sia-sia", "boros", "rugi", "antre", "antri", "ribet",
  "mengecewakan", "memalukan", "mengesalkan", "menjengkelkan", "menyebalkan",
  "menakutkan", "mengintimidasi", "menekan", "mempermalukan", "merugikan",
  "tidak nyaman", "tidak memadai", "tidak layak", "tidak ramah", "tidak siap",
  "berantakan", "amburadul", "semrawut", "acakadut", "kacau balau",
  "monoton", "membosankan", "menjenuhkan", "menjemukan",
  "terlalu lama", "terlalu panas", "terlalu singkat", "terlalu banyak",
  "tidak terorganisir", "tidak terkoordinasi", "tidak profesional",
  "berlebihan", "berbelit", "bertele-tele",
  "mengantuk", "ngantuk",

  // ── Bahasa Gaul / Slang ──
  "zonk", "zonkk",
  "garing", "garingg",                         // membosankan / tidak lucu
  "cringe", "cringee",
  "receh banget",                               // membosankan (konteks negatif)
  "bete", "bt", "bete banget", "bt bgt",
  "males", "mager", "males banget", "mager bgt",
  "cape", "capee", "capek banget", "capek bgt", "cape bgt",
  "ngeselin", "nyebelin", "sebel", "sebell",
  "kesel", "kesell", "kesal bgt",
  "emosi", "emosii",
  "baper", "baper negatif",
  "drama", "dramatis", "lebay", "lebai", "alay",
  "gaje", "ga jelas", "gak jelas", "nggak jelas",
  "absurd", "absurdd",
  "ampun", "ampunn", "ampun dah",
  "anjir", "anjirr", "anjay",                  // ekspresi kesal
  "parah", "parahhh", "parah sih", "parah banget",
  "ngeri", "ngerii",                            // konteks negatif
  "ambyar",                                     // hancur / kacau
  "gabut", "gabud",                             // tidak produktif
  "php",                                        // pemberi harapan palsu
  "ghosting",                                   // tidak direspon
  "skip", "skipp",
  "auto males", "auto bete",
  "nangis", "nangis sih", "pengen nangis",
  "ketiduran",                                  // membosankan sampai tidur
  "buang waktu", "buang buang waktu",
  "nyiksa", "menyiksa",
  "bikin pusing", "bikin mumet", "mumet",
  "bikin emosi", "bikin kesel",
  "bikin bete", "bikin males",
  "bikin capek", "bikin lelah",
  "ngebosenin", "bikin bosen",
  "ga guna", "gak guna", "gak berguna", "percuma",
  "zonk abis", "fail",
  "mending", "mendingan",                       // lebih baik X = kritik Y
  "yaudahlah", "yaudah", "ya sudahlah",         // pasrah / kecewa
  "cupu",

  // ── Singkatan Gaul ──
  "tdr", "tidur",                               // ketiduran karena bosan
  "smh",                                        // "shaking my head" = kecewa
  "fml",                                        // frustrasi
  "wtf", "wth",
  "zzz",                                        // bosan / ngantuk
  "meh", "mehh",

  // ── Campuran Indo-English ──
  "bad", "worst", "terrible", "awful", "horrible", "poor",
  "boring", "bored", "tiring", "tired", "exhausting", "exhausted",
  "disappointed", "disappointing", "frustrating", "frustrated",
  "confusing", "confused", "unclear", "messy", "chaotic",
  "disorganized", "unprepared", "unprofessional",
  "uncomfortable", "unpleasant", "unbearable",
  "overcrowded", "overloaded", "overwhelming",
  "slow", "late", "delayed", "wasted",
  "useless", "pointless", "meaningless",
  "unfair", "unfriendly", "rude", "harsh",
  "so bad", "very bad", "really bad", "so boring",
  "not good", "not fun", "not clear", "not helpful",
  "waste of time", "waste",
  "too long", "too hot", "too short", "too much",
  "no fun", "no good",
  "trash", "trashh", "sampah",

  // ── Ekspresi Campuran Gaul+English ──
  "literally boring", "literally capek",
  "so cringe", "cringe banget", "cringe bgt",
  "lowkey bete", "lowkey males",
  "highkey kesel",
  "ngl jelek", "ngl boring",
  "no cap buruk", "no cap jelek",
  "it sucks", "sucks", "suck",
  "not worth it",
  "big yikes", "yikes",
  "red flag", "red flags",
  "toxic", "toxicc",
  "mid", "midd",                               // biasa-biasa aja / mengecewakan
  "dead inside",
  "i cant", "i can't",
  "sus", "sussy",
  "bruh", "bruhh",                             // ekspresi kecewa/bingung
  "cap", "capp",                               // bohong / palsu
];

const NEGATION_WORDS = [
  // ── Formal ──
  "tidak", "bukan", "kurang", "jangan", "belum", "tak", "tanpa",
  // ── Gaul / Singkatan ──
  "nggak", "ga", "gak", "gk", "g", "nda", "ndak", "ngga", "enggak", "engga",
  "kagak", "kagag", "kaga",
  "gada", "gaada", "gak ada", "ga ada",
  "gamau", "gak mau", "ga mau", "ogah",
  "gabisa", "gak bisa", "ga bisa", "gabsa",
  // ── English ──
  "not", "no", "never", "dont", "don't", "can't", "cant", "won't", "wont",
  "none", "nothing", "neither", "hardly",
];

export function analyzeSentimentLocally(text: string): SentimentAnalysisResult {
  const lower = text.toLowerCase();
  const words = lower.split(/[^a-zA-Z0-9_]+/).filter(Boolean);

  let positiveScore = 0;
  let negativeScore = 0;

  // 1. Cek frasa multi-kata (bigram/trigram) dulu — prioritas lebih tinggi
  for (const phrase of POSITIVE_WORDS) {
    if (phrase.includes(" ") && lower.includes(phrase)) {
      positiveScore += 1.5;
    }
  }
  for (const phrase of NEGATIVE_WORDS) {
    if (phrase.includes(" ") && lower.includes(phrase)) {
      negativeScore += 1.5;
    }
  }

  // 2. Cek kata per-kata dengan deteksi negasi
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : "";
    const prevTwoWords = i > 1 ? `${words[i - 2]} ${words[i - 1]}` : prevWord;
    const isNegated = NEGATION_WORDS.includes(prevWord) || NEGATION_WORDS.includes(prevTwoWords);

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
