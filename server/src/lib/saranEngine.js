/**
 * saranEngine.js
 * Engine analisis komentar PKKMB — bekerja tanpa API eksternal.
 * Menganalisis sentimen, tema, dan intensitas komentar untuk menghasilkan
 * ringkasan dan rekomendasi profesional dalam Bahasa Indonesia.
 */

// ─── Kamus Tema ──────────────────────────────────────────────────────────────

const TEMA = {
  fasilitas: {
    kata: ["fasilitas", "ruang", "gedung", "toilet", "wc", "kursi", "meja", "ac", "kipas", "parkir", "tempat", "sarana", "prasarana", "laboratorium", "aula", "kantin", "mushola", "masjid", "wifi", "internet", "sinyal", "signal", "colokan", "stop kontak", "charger", "sound system", "sound", "speaker", "mic", "microphone", "infocus", "proyektor", "projector", "lcd"],
    label: "Fasilitas & Sarana",
    rekomendasiPositif: "Pertahankan dan tingkatkan standar fasilitas yang sudah baik. Lakukan pemeliharaan rutin secara berkala agar kualitas tetap terjaga.",
    rekomendasiNegatif: "Lakukan audit fasilitas secara menyeluruh. Prioritaskan perbaikan sarana yang paling banyak dikeluhkan seperti kebersihan, kapasitas ruang, dan kenyamanan tempat duduk.",
    rekomendasiNetral: "Evaluasi kondisi fasilitas yang ada dan buat skala prioritas perbaikan berdasarkan tingkat urgensi dan jumlah pengguna yang terdampak.",
  },
  konsumsi: {
    kata: ["makan", "minum", "konsumsi", "snack", "makanan", "minuman", "nasi", "air", "lauk", "catering", "katering", "menu", "porsi", "kotak", "jajan", "ngemil", "cemilan", "coffee break", "istirahat makan", "lunch", "lunch box", "makan siang"],
    label: "Konsumsi & Katering",
    rekomendasiPositif: "Pertahankan kualitas dan variasi menu yang sudah memuaskan. Pertimbangkan untuk memastikan ketersediaan pilihan bagi peserta dengan kebutuhan diet khusus.",
    rekomendasiNegatif: "Tinjau ulang vendor katering dan standar kualitas makanan. Pastikan porsi memadai, menu bervariasi, dan standar kebersihan pengolahan makanan terpenuhi.",
    rekomendasiNetral: "Lakukan survei kebutuhan peserta terkait preferensi makanan sebelum acara untuk memastikan kepuasan konsumsi secara menyeluruh.",
  },
  panitia: {
    kata: ["panitia", "pengurus", "kakak", "senior", "pembimbing", "koordinator", "mentor", "pendamping", "pelayanan", "ramah", "helpful", "responsif", "komunikasi", "arahan", "instruksi", "ospek", "kating", "maba", "kakak tingkat", "angkatan", "panitianya", "kakak panitia", "senior nya", "kakak pembimbing"],
    label: "Kepanitiaan & Pelayanan",
    rekomendasiPositif: "Apresiasi kinerja panitia yang sudah baik. Dokumentasikan best practice pelayanan sebagai acuan penyelenggaraan PKKMB mendatang.",
    rekomendasiNegatif: "Berikan pelatihan intensif kepada panitia tentang komunikasi efektif, manajemen peserta, dan kemampuan problem-solving. Evaluasi koordinasi antar divisi.",
    rekomendasiNetral: "Tingkatkan kapasitas panitia melalui briefing berkala dan simulasi penanganan berbagai situasi yang mungkin terjadi selama PKKMB.",
  },
  jadwal: {
    kata: ["jadwal", "waktu", "tepat", "terlambat", "telat", "durasi", "lama", "singkat", "sesuai", "molor", "mundur", "agenda", "rundown", "acara", "sesi", "jam", "pukul", "delay", "on time", "overtime", "kelamaan", "kecepetan", "nunggu", "nunggu lama", "nungguin", "ngaret"],
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
    kata: ["kegiatan", "aktivitas", "games", "permainan", "ice breaking", "icebreaking", "outbound", "lomba", "kompetisi", "seni", "budaya", "penampilan", "hiburan", "fun", "seru", "menyenangkan", "bosan", "monoton", "yel yel", "yel-yel", "game", "challenge", "tantangan", "team building", "teamwork"],
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

// ─── Kamus Sentimen (Formal + Gaul + Campuran Indo-English) ───────────────────

const KATA_POSITIF = [
  // ── Formal / Baku ──
  "bagus", "baik", "keren", "mantap", "seru", "senang", "puas", "suka",
  "nyaman", "menyenangkan", "berkesan", "informatif", "bermanfaat", "membantu",
  "antusias", "bersemangat", "luar biasa", "excellent", "good", "great",
  "ramah", "tepat", "terorganisir", "profesional", "sukses", "berhasil",
  "memuaskan", "menarik", "interaktif", "inspiratif", "edukatif", "positif",
  "lancar", "tertib", "rapi", "kondusif", "efektif", "efisien",
  "terbaik", "unggul", "andal", "prima", "optimal", "mumpuni", "mengesankan",
  "mengagumkan", "memukau", "istimewa", "gemilang", "cemerlang", "elegan",
  "berkualitas", "terampil", "tanggap", "responsif", "aktif", "produktif",
  "kreatif", "inovatif", "kompeten", "menyentuh", "hangat", "harmonis",
  "solid", "gembira", "bahagia", "ceria", "meriah", "berguna", "berfaedah",
  "mendukung", "memberdayakan", "disiplin", "kompak", "sigap",

  // ── Bahasa Gaul / Slang ──
  "mantul", "mantab", "mantep", "mantepp", "mantapp",
  "kece", "kece badai", "kece parah",
  "asik", "asiik", "asikk", "asyik", "asyikk",
  "gokil", "goks", "gokss",
  "ajib", "ajibb", "ajibbb",
  "cakep", "cakeppp",
  "jos", "joss", "josss", "jos gandos",
  "okee", "okeee", "oke banget", "oke bgt",
  "uwu", "lucu", "gemesin", "gemesh", "gemes",
  "sabi", "sabii",
  "gaskeun", "gaspol", "gas",
  "cuss", "cusss",
  "buset", "busett",
  "sultan", "dewa", "legend", "legenda",
  "auto seneng", "auto happy",
  "niat banget", "niat bgt",
  "totalitas", "totality",
  "sat set", "satset", "sat set sat set",
  "ngakak", "receh",
  "kelar", "beres",
  "juara", "champion",
  "worth it", "worthit",
  "blessed", "bersyukur", "grateful",
  "healing", "refreshing",
  "relate", "relatable",
  "slay", "slaying",
  "bestie", "besttt",
  "goals", "life goals",
  "amaze", "amazed", "amazing",
  "proud", "bangga",

  // ── Singkatan Gaul ──
  "tks", "thx", "thanks", "thankyou", "makasih", "makasi", "maksi",
  "mksih", "tengkyu", "tengkyuu", "tenkyu", "nuhun", "maturnuwun",
  "yoi", "yoii", "yess", "yesss",
  "sipp", "sippp", "siap", "siaap",
  "woke", "wokee",
  "bet", "bett", "bgt", "bngett", "bngt", "banget",

  // ── Campuran Indo-English ──
  "nice", "cool", "awesome", "perfect", "love", "lovely", "wonderful",
  "fantastic", "superb", "outstanding", "well done", "well organized",
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
  "good vibes", "vibes nya bagus", "vibes nya enak",
  "literally bagus", "literally keren",
  "so worth it",
  "the best sih", "the best deh", "the best lah",
  "so proud",
  "love banget", "love bgt",
  "super keren", "super bagus", "super seru",
  "ngl bagus", "ngl keren",
  "no cap bagus", "no cap keren",
  "lowkey suka", "lowkey bagus",
  "highkey suka", "highkey bagus",
];

const KATA_NEGATIF = [
  // ── Formal / Baku ──
  "buruk", "jelek", "kurang", "tidak", "susah", "sulit", "kecewa", "bosan",
  "membosankan", "panas", "kotor", "lambat", "lama", "terlambat", "telat",
  "molor", "berantakan", "membingungkan", "tidak jelas", "monoton", "capek",
  "lelah", "mengantuk", "tidak nyaman", "sempit", "penuh", "full", "ramai", "gaduh",
  "bising", "kurang baik", "perlu diperbaiki", "harus diperbaiki", "sayang",
  "kurang memuaskan", "mengecewakan", "tidak puas", "belum", "mubazir",
  "error", "gagal", "rusak", "crash", "bug", "hang", "lag", "lemot", "stuck",
  "ribet", "repot", "rumit", "macet", "down", "gangguan", "bermasalah",
  "mengesalkan", "menjengkelkan", "menyebalkan", "menakutkan", "mengintimidasi",
  "menekan", "mempermalukan", "merugikan", "memalukan",
  "tidak memadai", "tidak layak", "tidak ramah", "tidak siap",
  "amburadul", "semrawut", "acakadut", "kacau balau",
  "menjenuhkan", "menjemukan", "ngantuk",
  "terlalu lama", "terlalu panas", "terlalu singkat", "terlalu banyak",
  "tidak terorganisir", "tidak terkoordinasi", "tidak profesional",
  "berlebihan", "berbelit", "bertele-tele",

  // ── Bahasa Gaul / Slang ──
  "zonk", "zonkk",
  "garing", "garingg",
  "cringe", "cringee",
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
  "anjir", "anjirr", "anjay",
  "parah", "parahhh", "parah sih", "parah banget",
  "ngeri", "ngerii",
  "ambyar",
  "gabut", "gabud",
  "php",
  "ghosting",
  "skip", "skipp",
  "auto males", "auto bete",
  "nangis", "nangis sih", "pengen nangis",
  "ketiduran",
  "buang waktu", "buang buang waktu",
  "nyiksa", "menyiksa",
  "bikin pusing", "bikin mumet", "mumet",
  "bikin emosi", "bikin kesel",
  "bikin bete", "bikin males",
  "bikin capek", "bikin lelah",
  "ngebosenin", "bikin bosen",
  "ga guna", "gak guna", "gak berguna", "percuma",
  "zonk abis", "fail",
  "mending", "mendingan",
  "yaudahlah", "yaudah", "ya sudahlah",
  "cupu",

  // ── Singkatan Gaul ──
  "smh", "fml", "wtf", "wth",
  "zzz", "meh", "mehh",

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
  "mid", "midd",
  "dead inside",
  "bruh", "bruhh",
  "cap", "capp",
];

const KATA_NEGATIF_KUAT = [
  // ── Formal ──
  "sangat buruk", "parah", "gagal", "menyedihkan", "terrible", "awful",
  "tidak bisa", "tidak mungkin", "sangat kecewa", "sangat tidak", "payah",

  // ── Gaul / Slang ──
  "parah banget", "parah bgt", "parah sih",
  "sampah banget", "trash banget",
  "amit amit", "amit-amit",
  "najis", "najiss",
  "kapok", "kapokk",
  "trauma", "traumatis",
  "nyesel", "nyesel banget",
  "rugi banget", "rugi bgt",
  "buang waktu banget",
  "the worst", "so terrible",
  "literally the worst",

  // ── Campuran ──
  "so bad", "really bad", "very bad",
  "super jelek", "super buruk",
  "total disaster", "complete mess",
  "absolutely terrible", "absolutely awful",
  "i hate it", "hate banget",
  "worst ever", "worst sih",
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

const hitungSkor = (teksNormal, daftarKata) => {
  let skor = 0;
  for (const k of daftarKata) {
    if (teksNormal.includes(k)) {
      // Frasa multi-kata diberi bobot lebih tinggi
      skor += k.includes(" ") ? 1.5 : 1;
    }
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
