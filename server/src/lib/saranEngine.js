/**
 * saranEngine.js
 * Engine analisis komentar PKKMB — bekerja tanpa API eksternal.
 * Menganalisis sentimen, tema, dan intensitas komentar untuk menghasilkan
 * ringkasan dan rekomendasi profesional dalam Bahasa Indonesia.
 */

// ─── Kamus Tema ──────────────────────────────────────────────────────────────

const TEMA = {
  fasilitas: {
    kata: ["fasilitas", "ruang", "gedung", "toilet", "wc", "kursi", "meja", "ac", "kipas", "parkir", "tempat", "sarana", "prasarana", "laboratorium", "aula", "kantin", "mushola", "masjid"],
    label: "Fasilitas & Sarana",
    rekomendasiPositif: "Pertahankan dan tingkatkan standar fasilitas yang sudah baik. Lakukan pemeliharaan rutin secara berkala agar kualitas tetap terjaga.",
    rekomendasiNegatif: "Lakukan audit fasilitas secara menyeluruh. Prioritaskan perbaikan sarana yang paling banyak dikeluhkan seperti kebersihan, kapasitas ruang, dan kenyamanan tempat duduk.",
    rekomendasiNetral: "Evaluasi kondisi fasilitas yang ada dan buat skala prioritas perbaikan berdasarkan tingkat urgensi dan jumlah pengguna yang terdampak.",
  },
  konsumsi: {
    kata: ["makan", "minum", "konsumsi", "snack", "makanan", "minuman", "nasi", "air", "lauk", "catering", "katering", "menu", "porsi", "kotak", "jajan"],
    label: "Konsumsi & Katering",
    rekomendasiPositif: "Pertahankan kualitas dan variasi menu yang sudah memuaskan. Pertimbangkan untuk memastikan ketersediaan pilihan bagi peserta dengan kebutuhan diet khusus.",
    rekomendasiNegatif: "Tinjau ulang vendor katering dan standar kualitas makanan. Pastikan porsi memadai, menu bervariasi, dan standar kebersihan pengolahan makanan terpenuhi.",
    rekomendasiNetral: "Lakukan survei kebutuhan peserta terkait preferensi makanan sebelum acara untuk memastikan kepuasan konsumsi secara menyeluruh.",
  },
  panitia: {
    kata: ["panitia", "pengurus", "kakak", "senior", "pembimbing", "koordinator", "mentor", "pendamping", "pelayanan", "ramah", "helpful", "helpful", "responsif", "komunikasi", "arahan", "instruksi"],
    label: "Kepanitiaan & Pelayanan",
    rekomendasiPositif: "Apresiasi kinerja panitia yang sudah baik. Dokumentasikan best practice pelayanan sebagai acuan penyelenggaraan PKKMB mendatang.",
    rekomendasiNegatif: "Berikan pelatihan intensif kepada panitia tentang komunikasi efektif, manajemen peserta, dan kemampuan problem-solving. Evaluasi koordinasi antar divisi.",
    rekomendasiNetral: "Tingkatkan kapasitas panitia melalui briefing berkala dan simulasi penanganan berbagai situasi yang mungkin terjadi selama PKKMB.",
  },
  jadwal: {
    kata: ["jadwal", "waktu", "tepat", "terlambat", "telat", "durasi", "lama", "singkat", "sesuai", "molor", "mundur", "agenda", "rundown", "acara", "sesi", "jam", "pukul", "delay"],
    label: "Manajemen Waktu & Jadwal",
    rekomendasiPositif: "Ketepatan waktu yang baik meningkatkan pengalaman peserta. Pertahankan disiplin jadwal dan pastikan rundown tetap diikuti secara konsisten.",
    rekomendasiNegatif: "Perbaiki manajemen waktu dengan membuat buffer time yang memadai dalam rundown. Tunjuk time keeper khusus dan lakukan briefing ulang tentang pentingnya ketepatan waktu.",
    rekomendasiNetral: "Tinjau ulang alokasi waktu setiap sesi. Pastikan durasi setiap kegiatan realistis dan sesuai dengan konten yang akan disampaikan.",
  },
  materi: {
    kata: ["materi", "konten", "isi", "informasi", "penjelasan", "penyampaian", "presentasi", "slide", "narasumber", "pembicara", "seminar", "talk", "diskusi", "topik", "kurikulum", "program"],
    label: "Konten & Materi",
    rekomendasiPositif: "Kualitas materi sudah baik. Pertimbangkan untuk mendokumentasikan materi dalam format digital agar bisa diakses kembali oleh peserta setelah PKKMB.",
    rekomendasiNegatif: "Revisi konten materi agar lebih relevan dan menarik. Gunakan metode penyampaian yang interaktif, sertakan contoh nyata, dan batasi durasi paparan tanpa sesi tanya jawab.",
    rekomendasiNetral: "Lakukan evaluasi konten secara berkala. Sesuaikan materi dengan kebutuhan mahasiswa baru dan perkembangan terkini di lingkungan kampus.",
  },
  kegiatan: {
    kata: ["kegiatan", "aktivitas", "games", "permainan", "ice breaking", "icebreaking", "outbound", "lomba", "kompetisi", "seni", "budaya", "penampilan", "hiburan", "fun", "seru", "menyenangkan", "bosan", "monoton"],
    label: "Kegiatan & Aktivitas",
    rekomendasiPositif: "Kegiatan yang menyenangkan terbukti meningkatkan keterlibatan peserta. Pertahankan variasi aktivitas dan tambah elemen kejutan untuk menjaga antusiasme.",
    rekomendasiNegatif: "Tambahkan lebih banyak kegiatan interaktif dan kolaboratif. Hindari sesi pasif yang terlalu panjang. Perhatikan rasio kegiatan serius vs. kegiatan ringan.",
    rekomendasiNetral: "Evaluasi efektivitas setiap jenis kegiatan dalam mencapai tujuan PKKMB. Pastikan ada keseimbangan antara kegiatan edukatif dan kegiatan yang membangun relasi antar peserta.",
  },
  organisasi: {
    kata: ["organisasi", "ukm", "himpunan", "bem", "bpm", "ormawa", "komunitas", "ekstra", "kegiatan kemahasiswaan", "klub", "unit", "lembaga"],
    label: "Pengenalan Organisasi",
    rekomendasiPositif: "Pengenalan organisasi kemahasiswaan yang efektif membantu mahasiswa baru menemukan minat mereka. Pertahankan metode yang sudah berhasil menarik minat mahasiswa.",
    rekomendasiNegatif: "Tingkatkan kualitas pengenalan organisasi kemahasiswaan. Berikan informasi yang lebih komprehensif dan kesempatan bagi mahasiswa untuk berinteraksi langsung dengan anggota aktif.",
    rekomendasiNetral: "Pertimbangkan format baru dalam pengenalan organisasi, seperti expo kemahasiswaan, demo kegiatan, atau sesi tanya jawab interaktif dengan pengurus aktif.",
  },
  lingkungan: {
    kata: ["lingkungan", "kampus", "suasana", "atmosfer", "kebersihan", "bersih", "kotor", "sampah", "nyaman", "kondusif", "hijau", "rindang", "panas", "sejuk"],
    label: "Lingkungan Kampus",
    rekomendasiPositif: "Lingkungan kampus yang nyaman mendukung pengalaman PKKMB yang positif. Pertahankan kebersihan dan estetika lingkungan kampus secara konsisten.",
    rekomendasiNegatif: "Tingkatkan kebersihan dan kenyamanan lingkungan kampus, terutama di area yang sering digunakan selama PKKMB. Tambah titik pembuangan sampah dan fasilitas pendukung.",
    rekomendasiNetral: "Lakukan penataan lingkungan kampus sebelum PKKMB dimulai untuk memberikan kesan pertama yang positif bagi mahasiswa baru.",
  },
  umum: {
    kata: [],
    label: "Penyelenggaraan PKKMB",
    rekomendasiPositif: "Secara keseluruhan penyelenggaraan PKKMB berjalan dengan baik. Dokumentasikan hal-hal positif sebagai referensi untuk penyelenggaraan tahun berikutnya.",
    rekomendasiNegatif: "Diperlukan evaluasi menyeluruh terhadap penyelenggaraan PKKMB. Bentuk tim evaluasi yang terdiri dari panitia dan perwakilan peserta untuk mengidentifikasi akar masalah.",
    rekomendasiNetral: "Lakukan survei kepuasan peserta yang lebih mendalam dan gunakan hasilnya sebagai dasar perencanaan PKKMB berikutnya.",
  },
};

// ─── Kamus Sentimen ───────────────────────────────────────────────────────────

const KATA_POSITIF = [
  "bagus", "baik", "keren", "mantap", "seru", "senang", "puas", "suka",
  "nyaman", "menyenangkan", "berkesan", "informatif", "bermanfaat", "membantu",
  "antusias", "bersemangat", "luar biasa", "excellent", "good", "great",
  "ramah", "tepat", "terorganisir", "profesional", "sukses", "berhasil",
  "memuaskan", "menarik", "interaktif", "inspiratif", "edukatif", "positif",
  "lancar", "tertib", "rapi", "kondusif", "efektif", "efisien",
];

const KATA_NEGATIF = [
  "buruk", "jelek", "kurang", "tidak", "susah", "sulit", "kecewa", "bosan",
  "membosankan", "panas", "kotor", "lambat", "lama", "terlambat", "telat",
  "molor", "berantakan", "membingungkan", "tidak jelas", "monoton", "capek",
  "lelah", "mengantuk", "tidak nyaman", "sempit", "penuh", "full", "ramai", "gaduh",
  "bising", "kurang baik", "perlu diperbaiki", "harus diperbaiki", "sayang",
  "kurang memuaskan", "mengecewakan", "tidak puas", "belum", "mubazir",
  "error", "gagal", "rusak", "crash", "bug", "hang", "lag", "lemot", "stuck",
  "ribet", "repot", "rumit", "macet", "down", "gangguan", "bermasalah",
];

const KATA_NEGATIF_KUAT = [
  "sangat buruk", "parah", "gagal", "menyedihkan", "terrible", "awful",
  "tidak bisa", "tidak mungkin", "sangat kecewa", "sangat tidak", "payah",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalisasi = (teks) =>
  teks
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hitungSkor = (kata, daftarKata) => {
  let skor = 0;
  for (const k of daftarKata) {
    if (kata.includes(k)) skor++;
  }
  return skor;
};

const deteksiTema = (normText) => {
  const ditemukan = [];
  for (const [kunci, info] of Object.entries(TEMA)) {
    if (kunci === "umum") continue;
    for (const kata of info.kata) {
      if (normText.includes(kata)) {
        if (!ditemukan.find((t) => t.kunci === kunci)) {
          ditemukan.push({ kunci, label: info.label });
        }
        break;
      }
    }
  }
  if (ditemukan.length === 0) ditemukan.push({ kunci: "umum", label: TEMA.umum.label });
  return ditemukan;
};

const deteksiSentimen = (normText, skorPos, skorNeg) => {
  // Cek kata negatif kuat dulu
  for (const k of KATA_NEGATIF_KUAT) {
    if (normText.includes(k)) return "negatif";
  }
  if (skorPos > skorNeg && skorPos >= 2) return "positif";
  if (skorPos > skorNeg) return "positif";
  if (skorNeg > skorPos) return "negatif";
  // Jika skor sama-sama 0 atau sama persis
  if (skorPos === 0 && skorNeg === 0) return "netral";
  return "netral";
};

const kapitalisasi = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

// ─── Template Ringkasan ───────────────────────────────────────────────────────

const templateRingkasan = (comment, tema, sentimen) => {
  const labelTema = tema.map((t) => t.label).join(", ");
  const komenPendek = comment.length > 200 ? comment.slice(0, 200) + "..." : comment;

  const openerMap = {
    positif: [
      `Mahasiswa memberikan tanggapan positif terhadap ${labelTema} pada kegiatan PKKMB.`,
      `Peserta mengapresiasi aspek ${labelTema} yang dirasakan selama PKKMB berlangsung.`,
      `Terdapat kepuasan mahasiswa terhadap ${labelTema} dalam penyelenggaraan PKKMB ini.`,
    ],
    negatif: [
      `Mahasiswa mengungkapkan keluhan terkait ${labelTema} pada pelaksanaan PKKMB.`,
      `Terdapat ketidakpuasan peserta terhadap aspek ${labelTema} selama PKKMB berlangsung.`,
      `Peserta menyampaikan kritik konstruktif mengenai ${labelTema} dalam kegiatan PKKMB.`,
    ],
    netral: [
      `Mahasiswa menyampaikan masukan terkait ${labelTema} dalam pelaksanaan PKKMB.`,
      `Peserta memberikan observasi seimbang mengenai ${labelTema} pada kegiatan PKKMB.`,
      `Terdapat catatan mahasiswa terkait ${labelTema} yang perlu mendapat perhatian panitia.`,
    ],
  };

  const openers = openerMap[sentimen] || openerMap.netral;
  const opener = openers[Math.floor(Math.random() * openers.length)];

  return (
    `${opener} ` +
    `Komentar tersebut mencerminkan pengalaman langsung peserta terhadap aspek ${labelTema.toLowerCase()} ` +
    `yang perlu menjadi bahan evaluasi bagi panitia penyelenggara. ` +
    `Secara spesifik, peserta menyampaikan: "${komenPendek}"`
  );
};

// ─── Generator Rekomendasi ────────────────────────────────────────────────────

const generateRekomendasi = (tema, sentimen, normText) => {
  const rekList = [];

  for (const t of tema) {
    const info = TEMA[t.kunci];
    if (!info) continue;

    let rek;
    if (sentimen === "positif") rek = info.rekomendasiPositif;
    else if (sentimen === "negatif") rek = info.rekomendasiNegatif;
    else rek = info.rekomendasiNetral;

    rekList.push(`• **${info.label}**: ${rek}`);
  }

  // Tambahkan rekomendasi umum selalu
  const rekUmum = {
    positif: "Bagikan hasil evaluasi positif ini kepada seluruh tim panitia sebagai motivasi dan benchmark untuk penyelenggaraan PKKMB tahun mendatang.",
    negatif: "Segera adakan rapat evaluasi panitia untuk membahas temuan ini dan rumuskan rencana perbaikan konkret sebelum kegiatan serupa diselenggarakan kembali.",
    netral: "Gunakan masukan ini sebagai bahan diskusi dalam rapat evaluasi pasca-PKKMB untuk menyusun program yang lebih baik ke depannya.",
  };

  rekList.push(`• **Tindak Lanjut**: ${rekUmum[sentimen] || rekUmum.netral}`);
  return rekList.join("\n");
};

// ─── Fungsi Utama ─────────────────────────────────────────────────────────────

/**
 * Analisis komentar PKKMB dan hasilkan ringkasan + rekomendasi.
 * @param {string} comment - Komentar mahasiswa
 * @param {string|null} knownSentiment - Sentimen yang sudah diketahui dari ML model ("positive", "negative", "neutral"), opsional
 * @returns {{ ringkasan: string, rekomendasi: string, tema: string[], sentimen: string }}
 */
export function analisisKomentar(comment, knownSentiment = null) {
  if (!comment || !comment.trim()) {
    return {
      ringkasan: "Tidak ada komentar yang diberikan.",
      rekomendasi: "• **Pengumpulan Data**: Pastikan sistem pengumpulan feedback berfungsi dengan baik dan peserta diberi waktu yang cukup untuk mengisi evaluasi.",
      tema: ["Umum"],
      sentimen: "netral",
    };
  }

  const normText = normalisasi(comment);
  const skorPos = hitungSkor(normText, KATA_POSITIF);
  const skorNeg = hitungSkor(normText, KATA_NEGATIF);

  // Gunakan sentimen dari ML model jika tersedia, jika tidak gunakan deteksi lokal
  let sentimen;
  if (knownSentiment) {
    const mapSentiment = { positive: "positif", negative: "negatif", neutral: "netral" };
    sentimen = mapSentiment[knownSentiment] || deteksiSentimen(normText, skorPos, skorNeg);
  } else {
    sentimen = deteksiSentimen(normText, skorPos, skorNeg);
  }

  const tema = deteksiTema(normText);

  const ringkasan = templateRingkasan(comment, tema, sentimen);
  const rekomendasi = generateRekomendasi(tema, sentimen, normText);

  return {
    ringkasan,
    rekomendasi,
    tema: tema.map((t) => t.label),
    sentimen,
  };
}

/**
 * Format hasil analisis menjadi teks terstruktur yang siap ditampilkan.
 * @param {string} comment
 * @param {string|null} knownSentiment - Sentimen dari ML model ("positive", "negative", "neutral"), opsional
 * @returns {string}
 */
export function generateSaran(comment, knownSentiment = null) {
  const { ringkasan, rekomendasi, tema, sentimen } = analisisKomentar(comment, knownSentiment);

  const sentimenLabel = {
    positif: "✅ Positif",
    negatif: "⚠️ Negatif",
    netral: "ℹ️ Netral",
  }[sentimen] || "ℹ️ Netral";

  return `RINGKASAN
─────────────────────────────────────────
${ringkasan}

Tema teridentifikasi: ${tema.join(", ")}
Sentimen: ${sentimenLabel}

REKOMENDASI
─────────────────────────────────────────
${rekomendasi}

─────────────────────────────────────────
Dihasilkan oleh Sistem Analisis Feedback PKKMB`;
}
