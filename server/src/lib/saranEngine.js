/**
 * saranEngine.js
 * Engine analisis komentar PKKMB — bekerja tanpa API eksternal.
 * Menganalisis sentimen, tema, dan intensitas komentar untuk menghasilkan
 * ringkasan dan rekomendasi profesional dalam Bahasa Indonesia.
 */

// ─── Kamus Tema ──────────────────────────────────────────────────────────────

const TEMA = {
  fasilitas: {
    kata: ["fasilitas", "ruang", "ruangan", "gedung", "toilet", "wc", "kursi", "meja", "ac", "kipas", "parkir", "tempat", "sarana", "prasarana", "laboratorium", "aula", "kantin", "mushola", "masjid", "wifi", "internet", "sinyal", "signal", "colokan", "stop kontak", "charger", "sound system", "sound", "speaker", "mic", "microphone", "infocus", "proyektor", "projector", "lcd", "gerah", "pengap", "sumuk", "sempit", "sesak", "desak", "lemot", "kuota", "lowbat"],
    label: "Fasilitas & Sarana",
    rekomendasiPositif: "Pertahankan dan tingkatkan standar fasilitas yang sudah baik. Lakukan pemeliharaan rutin secara berkala agar kualitas tetap terjaga.",
    rekomendasiNegatif: "Lakukan audit fasilitas secara menyeluruh. Prioritaskan perbaikan sarana yang paling banyak dikeluhkan seperti kebersihan, kapasitas ruang, dan kenyamanan tempat duduk.",
    rekomendasiNetral: "Evaluasi kondisi fasilitas yang ada dan buat skala prioritas perbaikan berdasarkan tingkat urgensi dan jumlah pengguna yang terdampak.",
  },
  konsumsi: {
    kata: ["makan", "minum", "konsumsi", "snack", "makanan", "minuman", "nasi", "air", "lauk", "catering", "katering", "menu", "porsi", "kotak", "jajan", "ngemil", "cemilan", "coffee break", "istirahat makan", "lunch", "lunch box", "makan siang", "sarapan", "laper", "lapar", "haus", "dehidrasi", "basi", "kenyang", "tumbler", "refill", "galon"],
    label: "Konsumsi & Katering",
    rekomendasiPositif: "Pertahankan kualitas dan variasi menu yang sudah memuaskan. Pertimbangkan untuk memastikan ketersediaan pilihan bagi peserta dengan kebutuhan diet khusus.",
    rekomendasiNegatif: "Tinjau ulang vendor katering dan standar kualitas makanan. Pastikan porsi memadai, menu bervariasi, dan standar kebersihan pengolahan makanan terpenuhi.",
    rekomendasiNetral: "Lakukan survei kebutuhan peserta terkait preferensi makanan sebelum acara untuk memastikan kepuasan konsumsi secara menyeluruh.",
  },
  panitia: {
    kata: ["panitia", "pengurus", "kakak", "senior", "pembimbing", "koordinator", "mentor", "pendamping", "pelayanan", "ramah", "helpful", "responsif", "komunikasi", "arahan", "instruksi", "ospek", "kating", "maba", "kakak tingkat", "angkatan", "panitianya", "kakak panitia", "senior nya", "kakak pembimbing", "komdis", "tatib", "medis", "koor", "pj", "galak", "jutek", "sinis", "judes", "humble", "gercep", "senioritas", "bentak", "nyolot", "ngegas"],
    label: "Kepanitiaan & Pelayanan",
    rekomendasiPositif: "Apresiasi kinerja panitia yang sudah baik. Dokumentasikan best practice pelayanan sebagai acuan penyelenggaraan PKKMB mendatang.",
    rekomendasiNegatif: "Berikan pelatihan intensif kepada panitia tentang komunikasi efektif, manajemen peserta, dan kemampuan problem-solving. Evaluasi koordinasi antar divisi.",
    rekomendasiNetral: "Tingkatkan kapasitas panitia melalui briefing berkala dan simulasi penanganan berbagai situasi yang mungkin terjadi selama PKKMB.",
  },
  jadwal: {
    kata: ["jadwal", "waktu", "tepat", "terlambat", "telat", "durasi", "lama", "singkat", "sesuai", "molor", "mundur", "agenda", "rundown", "acara", "sesi", "jam", "pukul", "delay", "on time", "ontime", "overtime", "kelamaan", "kecepetan", "nunggu", "nunggu lama", "nungguin", "ngaret", "jam karet", "ishoma", "break", "jeda", "kepagian", "kesorean", "kemalaman"],
    label: "Manajemen Waktu & Jadwal",
    rekomendasiPositif: "Ketepatan waktu yang baik meningkatkan pengalaman peserta. Pertahankan disiplin jadwal dan pastikan rundown tetap diikuti secara konsisten.",
    rekomendasiNegatif: "Perbaiki manajemen waktu dengan membuat buffer time yang memadai dalam rundown. Tunjuk time keeper khusus dan lakukan briefing ulang tentang pentingnya ketepatan waktu.",
    rekomendasiNetral: "Tinjau ulang alokasi waktu setiap sesi. Pastikan durasi setiap kegiatan realistis dan sesuai dengan konten yang akan disampaikan.",
  },
  materi: {
    kata: ["materi", "konten", "isi", "informasi", "penjelasan", "penyampaian", "presentasi", "slide", "narasumber", "pembicara", "pemateri", "seminar", "talk", "talkshow", "talk show", "workshop", "diskusi", "topik", "kurikulum", "program", "daging", "bergizi", "insight", "wawasan", "ilmu", "qna", "tanya jawab", "ppt", "guest star", "bintang tamu"],
    label: "Konten & Materi",
    rekomendasiPositif: "Kualitas materi sudah baik. Pertimbangkan untuk mendokumentasikan materi dalam format digital agar bisa diakses kembali oleh peserta setelah PKKMB.",
    rekomendasiNegatif: "Revisi konten materi agar lebih relevan dan menarik. Gunakan metode penyampaian yang interaktif, sertakan contoh nyata, dan batasi durasi paparan tanpa sesi tanya jawab.",
    rekomendasiNetral: "Lakukan evaluasi konten secara berkala. Sesuaikan materi dengan kebutuhan mahasiswa baru dan perkembangan terkini di lingkungan kampus.",
  },
  kegiatan: {
    kata: ["kegiatan", "aktivitas", "games", "permainan", "ice breaking", "icebreaking", "outbound", "lomba", "kompetisi", "seni", "budaya", "penampilan", "hiburan", "fun", "seru", "menyenangkan", "bosan", "bosen", "monoton", "yel yel", "yel-yel", "game", "challenge", "tantangan", "team building", "teamwork", "garing", "anyep", "cringe", "pensi", "inaugurasi", "inagurasi", "closing", "opening", "gugus", "kelompok", "penugasan", "atribut", "twibbon", "nametag"],
    label: "Kegiatan & Aktivitas",
    rekomendasiPositif: "Kegiatan yang menyenangkan terbukti meningkatkan keterlibatan peserta. Pertahankan variasi aktivitas dan tambah elemen kejutan untuk menjaga antusiasme.",
    rekomendasiNegatif: "Tambahkan lebih banyak kegiatan interaktif dan kolaboratif. Hindari sesi pasif yang terlalu panjang. Perhatikan rasio kegiatan serius vs. kegiatan ringan.",
    rekomendasiNetral: "Evaluasi efektivitas setiap jenis kegiatan dalam mencapai tujuan PKKMB. Pastikan ada keseimbangan antara kegiatan edukatif dan kegiatan yang membangun relasi antar peserta.",
  },
  organisasi: {
    kata: ["organisasi", "ukm", "himpunan", "hima", "hmj", "hmps", "bem", "bpm", "dema", "sema", "ormawa", "komunitas", "ekstra", "kegiatan kemahasiswaan", "klub", "unit", "lembaga", "expo", "booth", "stand", "oprec", "open recruitment"],
    label: "Pengenalan Organisasi",
    rekomendasiPositif: "Pengenalan organisasi kemahasiswaan yang efektif membantu mahasiswa baru menemukan minat mereka. Pertahankan metode yang sudah berhasil menarik minat mahasiswa.",
    rekomendasiNegatif: "Tingkatkan kualitas pengenalan organisasi kemahasiswaan. Berikan informasi yang lebih komprehensif dan kesempatan bagi mahasiswa untuk berinteraksi langsung dengan anggota aktif.",
    rekomendasiNetral: "Pertimbangkan format baru dalam pengenalan organisasi, seperti expo kemahasiswaan, demo kegiatan, atau sesi tanya jawab interaktif dengan pengurus aktif.",
  },
  lingkungan: {
    kata: ["lingkungan", "kampus", "suasana", "atmosfer", "kebersihan", "bersih", "kotor", "sampah", "nyaman", "kondusif", "hijau", "rindang", "panas", "sejuk", "adem", "asri", "teduh", "estetik", "aesthetic", "lapangan"],
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

// ─── Kamus Sentimen Lengkap (Formal + Gaul + Daerah + Campuran Indo-English) ──

const KATA_POSITIF = [
  // ── Formal / Baku ──
  "bagus", "baik", "keren", "mantap", "hebat", "seru", "senang", "puas", "suka",
  "nyaman", "menyenangkan", "berkesan", "informatif", "bermanfaat", "membantu",
  "antusias", "bersemangat", "luar biasa", "ramah", "tepat waktu", "terorganisir",
  "profesional", "sukses", "berhasil", "memuaskan", "menarik", "interaktif",
  "inspiratif", "edukatif", "positif", "lancar", "tertib", "rapi", "kondusif",
  "efektif", "efisien", "terbaik", "unggul", "andal", "prima", "optimal", "mumpuni",
  "mengesankan", "mengagumkan", "memukau", "istimewa", "gemilang", "cemerlang",
  "elegan", "berkualitas", "terampil", "tanggap", "responsif", "aktif", "produktif",
  "kreatif", "inovatif", "kompeten", "menyentuh", "hangat", "harmonis", "solid",
  "gembira", "bahagia", "ceria", "meriah", "berguna", "berfaedah", "mendukung",
  "memberdayakan", "disiplin", "kompak", "sigap", "solutif", "konstruktif",
  "komunikatif", "kooperatif", "sportif", "sopan", "santun", "sopan santun",
  "mengayomi", "merangkul", "terima kasih", "terimakasih", "apresiasi", "salut",
  "enak", "lezat", "nikmat", "sedap", "segar", "kenyang", "melimpah",
  "bersih", "wangi", "harum", "sejuk", "rindang", "asri", "lega", "lumayan",
  "pertahankan", "lanjutkan", "sesuai jadwal", "sesuai rundown",

  // ── Bahasa Gaul / Slang Sehari-hari & Kampus ──
  "mantul", "mantab", "mantep", "mantepp", "mantapp", "mantap jiwa", "mantap djiwa",
  "mantap betul", "mantap pol", "mantap kali", "mantap pisan", "mantap surantap",
  "kece", "kece badai", "kece parah", "kece abis", "kece berat", "kece pol",
  "asik", "asiik", "asikk", "asyik", "asyikk", "asik parah", "asik pol", "asik abis",
  "gokil", "goks", "gokss", "gokil abis", "gokil parah", "gokil pol",
  "ajib", "ajibb", "ajibbb", "ajib pol", "ajib gila",
  "cakep", "cakeppp", "cakep pol", "cakep bener",
  "jos", "joss", "josss", "jos gandos", "josjis", "jos pol", "top markotop", "topcer", "tokcer", "moncer", "cespleng",
  "ciamik", "ciamik pol", "ciamik soro",
  "gacor", "gacor parah", "gacor abis", "gacor kang", "gacor pol",
  "menyala", "menyala abangku", "menyala kakak", "menyala panitia", "menyala pol",
  "ilmu padi", "berkelas", "kelas abangku", "kelas banget",
  "pecah banget", "pecah bgt", "pecah abis", "pecah parah", "acaranya pecah", "suasana pecah",
  "keren parah", "keren abis", "keren pol", "keren gila", "keren gilak", "kreen",
  "seru parah", "seru abis", "seru pol", "seru gila", "seru gilak",
  "lucu parah", "ramah parah", "enak parah", "bagus parah", "baik parah", "sabar parah",
  "okee", "okeee", "oke banget", "oke bgt", "oke punya", "oke gas", "oke sip",
  "wkwk", "wkwkwk", "haha", "hahaha",
  "uwu", "uwuu", "lucu", "gemesin", "gemesh", "gemes", "gemoy", "kiyowo",
  "sabi", "sabii", "sabi banget", "sabi lah",
  "gaskeun", "gaspol", "gas pol", "gas terus", "gaskan", "kuy", "skuy",
  "cuss", "cusss",
  "sultan", "dewa", "legend", "legenda", "suhu", "sepuh",
  "auto seneng", "auto happy", "auto semangat", "auto betah", "auto suka",
  "niat banget", "niat bgt", "niat pol", "totalitas", "totality", "totalitas tanpa batas",
  "sat set", "satset", "sat set sat set", "satset watwet", "sat set wat wet",
  "gercep", "gercep banget", "gercep bgt", "gercep pol",
  "pewe", "pw", "pw banget", "pewe banget", "betah", "betah banget", "betah bgt", "betah pol",
  "adem", "adem banget", "adem bgt", "adem ayem", "adem pol",
  "ngakak", "ngakak abis", "ngakak pol", "full senyum", "senyum terus", "murah senyum",
  "suasana cair", "cair banget", "akrab", "cepat akrab", "kekeluargaan", "ngemong",
  "materi daging", "daging semua", "isinya daging", "full daging", "ilmu daging", "bergizi",
  "ngena", "ngena banget", "dapet banget", "nyampe banget", "buka wawasan", "nambah ilmu", "nambah relasi", "nambah temen",
  "anti ngantuk", "anti bosen", "anti garing",
  "nagih", "bikin nagih", "ga kerasa", "gak kerasa", "susah move on", "ngangenin", "bakal kangen",
  "merinding", "terharu", "bikin terharu", "baper positif", "bangga", "bangga banget",
  "bukan kaleng kaleng", "gak kaleng kaleng", "ga kaleng kaleng", "bukan main", "gak ada obat", "ga ada obat", "gada obat", "tiada lawan", "gak gagal", "ga pernah gagal",
  "juara", "champion", "jawara", "jempolan", "dua jempol", "bintang lima",
  "kelar", "beres", "rapi jali", "aman terkendali", "aman jaya",
  "alhamdulillah", "bersyukur", "syukurlah", "puji tuhan",

  // ── Slang Daerah Populer (Jawa, Sunda, Sumatera, Timur) ──
  "apik", "apik tenan", "jos tenan", "mantep tenan", "penak", "penak pol", "wenak", "wenak pol",
  "gayeng", "sumringah", "semringah", "mbois", "mbois pol", "mbois ilakes", "sangar",
  "suwun", "matur nuwun", "maturnuwun", "matur suwun",
  "hade", "hade pisan", "alus", "alus pisan", "seru pisan", "rame pisan", "raos", "bodor",
  "nuhun", "hatur nuhun", "nuhun pisan",
  "paten", "paten kali", "keren kali", "bagus kali", "seru kali", "ramah kali",
  "rancak", "rancak bana", "lamak", "lamak bana", "cindo",
  "gaga", "mantap skali", "ramah skali", "seru skali", "bae skali", "ewako",

  // ── Singkatan Gaul & Chat ──
  "tks", "thx", "thanks", "thankyou", "makasih", "makasi", "maksi", "mksh",
  "mksih", "tengkyu", "tengkyuu", "tenkyu", "tq", "ty", "tysm",
  "gpp", "gapapa", "ga papa",
  "lfg", "gg", "ggwp", "mvp", "goat", "the goat",
  "yoi", "yoii", "yess", "yesss",
  "sipp", "sippp", "sip", "siap", "siaap", "acc", "valid", "no debat", "valid no debat",
  "woke", "wokee", "baek", "ntaps", "ntap", "mantaps",
  "dabest", "da best", "terdabest", "ter the best", "bedebest",

  // ── Bahasa Campuran Indo-English (Jaksel & Gen-Z) ──
  "good", "great", "nice", "cool", "awesome", "excellent", "perfect",
  "love", "lovely", "luv", "luvv", "lope", "wonderful", "fantastic", "superb", "outstanding",
  "well done", "well organized", "well prepared", "well executed", "good job", "great job", "nice work",
  "happy", "enjoy", "enjoyed", "enjoyable", "fun",
  "helpful", "useful", "clear", "organized", "smooth", "seamless",
  "impressive", "incredible", "brilliant", "remarkable", "phenomenal", "epic",
  "best", "better", "improved", "level up",
  "so good", "very good", "really good", "pretty good", "damn good", "hella good",
  "so fun", "very fun", "super fun", "really fun",
  "highly recommended", "recommended", "rekomen", "rekomen banget", "recommended banget",
  "satisfied", "satisfying", "comfortable", "cozy", "comfy",
  "worth", "worth it", "worthit", "valuable", "meaningful", "insightful", "informative",
  "support", "supportive", "suportif", "welcoming", "humble", "humble banget", "down to earth",
  "friendly", "kind", "caring", "polite", "respectful",
  "excited", "exciting", "hype", "hyped", "pumped",
  "motivated", "motivating", "inspiring", "empowering",
  "thank you", "thank u", "appreciate", "appreciated", "big thanks", "shoutout", "shout out", "kudos", "props", "respect", "mad respect", "salute", "hats off",
  "blessed", "grateful", "healing", "refreshing", "wholesome", "heartwarming",
  "relate", "relatable", "slay", "slaying", "slayed", "ate", "nailed it", "crushed it",
  "bestie", "besttt", "goals", "life goals",
  "amaze", "amazed", "amazing", "proud", "so proud",
  "on time", "ontime", "on point", "on fire", "lit", "top tier", "god tier", "s tier", "elite", "peak", "masterpiece", "cinema", "absolute cinema", "core memory",
  "big w", "common w", "all out", "high effort",

  // ── Ekspresi Campuran Gaul + English ──
  "good vibes", "positive vibes", "positif vibes", "vibes positif", "vibes nya bagus", "vibes nya enak", "vibes nya asik", "vibes nya dapet", "good energy",
  "mood booster", "moodbooster", "naikin mood", "bikin happy", "bikin seneng", "bikin semangat",
  "literally bagus", "literally keren", "literally seru", "literally the best",
  "jujurly bagus", "jujurly keren", "jujurly seru", "jujurly suka", "jujurly asik", "jujurly nyaman",
  "jujur bagus", "jujur keren", "jujur seru", "asli keren", "asli seru", "asli bagus", "rill bagus", "rill keren", "rill seru",
  "tbh bagus", "tbh keren", "tbh seru", "imo bagus", "imo keren",
  "so worth it", "worth it banget", "worth it bgt", "worth it parah", "worth it pol",
  "the best sih", "the best deh", "the best lah", "the best banget",
  "i love it", "love banget", "love bgt", "suka banget", "suka bgt", "suka pol",
  "super keren", "super bagus", "super seru", "super ramah", "super helpful", "super asik",
  "ngl bagus", "ngl keren", "ngl seru",
  "no cap bagus", "no cap keren", "no cap seru", "fr bagus", "fr keren", "fr seru",
  "real talk bagus", "fix bagus", "fix keren", "fix seru",
  "lowkey suka", "lowkey bagus", "lowkey seru",
  "highkey suka", "highkey bagus", "highkey keren",
  "it hits different", "beyond expectation", "melebihi ekspektasi", "di luar ekspektasi", "sesuai ekspektasi",
  "dapet insight", "insight baru", "banyak insight",
];

const KATA_NEGATIF = [
  // ── Formal / Baku ──
  "buruk", "jelek", "kurang", "susah", "sulit", "kecewa", "bosan",
  "membosankan", "panas", "kotor", "bau", "lambat", "lama", "terlambat", "telat",
  "molor", "berantakan", "membingungkan", "tidak jelas", "monoton", "capek",
  "lelah", "letih", "mengantuk", "tidak nyaman", "sempit", "gaduh", "bising",
  "kurang baik", "perlu diperbaiki", "harus diperbaiki", "kurang memuaskan",
  "mengecewakan", "tidak puas", "mubazir", "sia sia", "boros", "rugi",
  "error", "gagal", "rusak", "crash", "bug", "hang", "lag", "lemot", "stuck",
  "ribet", "repot", "rumit", "macet", "down", "gangguan", "bermasalah",
  "mengesalkan", "menjengkelkan", "menyebalkan", "menakutkan", "mengintimidasi",
  "menekan", "mempermalukan", "merugikan", "memalukan", "menyusahkan", "memberatkan",
  "tidak memadai", "tidak layak", "tidak ramah", "tidak siap", "tidak sopan", "tidak adil",
  "amburadul", "semrawut", "acakadut", "kacau balau", "karut marut", "kacau",
  "menjenuhkan", "menjemukan", "ngantuk", "hambar",
  "terlalu lama", "terlalu panas", "terlalu singkat", "terlalu banyak", "terlalu padat", "terlalu sempit",
  "tidak terorganisir", "tidak terkoordinasi", "tidak profesional", "kurang koordinasi", "miskoordinasi",
  "berlebihan", "berbelit", "bertele tele", "berbelit belit",
  "senioritas", "bentak", "bentakan", "intimidasi", "perpeloncoan", "pelonco", "plonco", "penindasan",
  "kasar", "arogan", "angkuh", "sombong", "pilih kasih", "berat sebelah",
  "simpang siur", "mendadak", "terlantar", "ditelantarkan", "dipersulit", "merepotkan",
  "kelaparan", "kehausan", "dehidrasi", "pingsan", "tumbang", "basi", "jorok", "kumuh", "pengap",
  "tertekan", "stress", "stres",

  // ── Bahasa Gaul / Slang Sehari-hari & Kampus ──
  "zonk", "zonkk", "zonk abis", "zonk parah", "zonk banget", "zonk bgt", "zonk berat",
  "boncos", "rugi bandar", "rugi waktu", "rugi tenaga",
  "garing", "garingg", "garing parah", "garing abis", "garing banget", "garing bgt", "krik", "krik krik", "anyep",
  "cringe", "cringee", "cringe parah", "cringe abis",
  "receh banget", "bosen", "bosenin", "ngebosenin", "bikin bosen", "bosen banget", "bosen bgt", "bosen pol", "suntuk", "jenuh",
  "bete", "bt", "bete banget", "bt bgt", "bete parah", "bt parah",
  "males", "mager", "malesin", "males banget", "mager bgt", "bikin males", "auto males", "auto bete",
  "cape", "capee", "capek banget", "capek bgt", "cape bgt", "capek pol", "bikin capek", "bikin lelah",
  "tepar", "remuk", "badan remuk", "rontok", "pegel", "pegal", "encok", "jompo", "lemes", "lemas", "lunglai", "lesu", "lowbat",
  "ngantuk berat", "ngantuk parah", "ngantuk pol", "bikin ngantuk", "auto ngantuk", "auto tidur", "ketiduran",
  "laper", "lapar", "belum makan", "telat makan", "haus banget",
  "gerah", "gerah banget", "gerah bgt", "gerah pol", "kepanasan", "panas banget", "panas bgt", "panas pol", "dijemur", "mandi keringat", "keringetan",
  "engap", "sesek", "desak desakan", "umpel umpelan", "rebutan", "antri panjang", "antre panjang",
  "suara pecah", "speaker pecah", "mic mati", "mic rusak", "ga kedengeran", "gak kedengeran", "kresek kresek", "berisik", "berisik banget", "ribut", "ricuh", "rusuh",
  "lemot banget", "ngelag", "server down", "web down", "susah sinyal",
  "ngaret", "ngaret parah", "ngaret banget", "ngaret bgt", "jam karet", "molor parah", "molor terus", "kelamaan", "kepanjangan", "nunggu lama", "digantung",
  "galak", "galak banget", "galak bgt", "jutek", "jutek banget", "jutek bgt", "sinis", "judes", "judes banget", "ketus",
  "songong", "tengil", "belagu", "sok keras", "sok asik", "sok senior", "sok galak", "sok tegas", "sok iye", "sok berkuasa", "gila hormat", "haus hormat", "feodal", "kolot",
  "nyolot", "ngegas", "ngegas mulu", "marah marah", "bentak bentak", "teriak teriak", "sensi", "sensian", "baperan",
  "miskom", "misskom", "dadakan", "serba dadakan", "info dadakan", "plin plan", "lepas tangan", "cuci tangan", "lempar tanggung jawab",
  "ngeselin", "nyebelin", "sebel", "sebell", "kesel", "kesell", "kesal bgt", "gedeg", "gedek", "dongkol", "gondok", "jengkel", "muak", "enek", "eneg", "makan hati", "nyesek",
  "emosi", "emosii", "bikin emosi", "bikin kesel", "bikin bete",
  "baper", "baper negatif", "kena mental", "mental kena",
  "drama", "dramatis", "lebay", "lebai", "alay",
  "gaje", "gajelas", "ga jelas", "gak jelas", "nggak jelas", "gaje parah", "gaje banget", "gj",
  "gasuka", "gaseru", "gabagus", "gaenak", "ganyaman", "garamah", "gabener", "gamutu",
  "gaksuka", "gakseru", "gakbagus", "gakenak", "gaknyaman", "gakramah", "gakbener", "gakmutu",
  "ga bener", "gak bener", "ga mutu", "gak mutu", "ga sopan", "gak sopan", "ga adil", "gak adil", "ga ramah", "gak ramah", "ga nyaman", "gak nyaman", "ga enak", "gak enak",
  "unfaedah", "nirfaedah", "ga faedah", "gak faedah", "ga guna", "gak guna", "gak berguna", "percuma", "buang waktu", "buang buang waktu",
  "kentang", "kentang banget", "nanggung", "asal asalan", "ngawur", "ga niat", "gak niat", "setengah hati",
  "ampas", "ampas banget", "bapuk", "burik", "bobrok", "busuk", "ancur", "hancur", "ambyar",
  "absurd", "absurdd", "konyol", "ga ngotak", "gak ngotak", "ga masuk akal", "gak masuk akal", "kebangetan", "keterlaluan", "kelewatan",
  "ampun", "ampunn", "ampun dah", "anjir", "anjirr", "anjay",
  "parah", "parahhh", "parah sih", "parah banget", "parah bgt", "parah abis", "parah pol", "kacau parah", "kecewa parah", "kecewa berat",
  "ngeri", "ngerii", "gabut", "gabud", "php", "ghosting",
  "skip", "skipp", "skip aja", "mending skip", "auto skip",
  "nangis", "nangis sih", "pengen nangis",
  "nyiksa", "menyiksa", "nyusahin", "bikin susah", "bikin repot", "ngebingungin", "bikin bingung",
  "bikin pusing", "bikin mumet", "mumet", "mumet pol", "puyeng", "pusing", "pening",
  "nyesel", "nyesel banget", "nyesel ikut", "kapok", "kapok ikut", "ogah", "trauma", "traumatis",
  "amit amit", "najis", "malu maluin", "bikin malu",
  "mending", "mendingan", "yaudahlah", "yaudah", "ya sudahlah", "cupu", "fail",
  "ga banget", "gak banget", "nggak banget", "ga rekomen", "gak rekomen",

  // ── Slang Daerah Negatif (Jawa, Sunda, dll.) ──
  "sumuk", "kemproh", "angel", "riweh", "lieur", "rieut", "hareudang", "hoream", "rudet", "kezel",

  // ── Singkatan Gaul Negatif ──
  "smh", "fml", "wtf", "wth", "zzz", "meh", "mehh",

  // ── Bahasa Campuran Indo-English (Jaksel & Gen-Z) ──
  "bad", "worst", "terrible", "awful", "horrible", "poor", "pathetic", "mediocre", "subpar", "underwhelming", "overrated",
  "boring", "bored", "tiring", "tired", "exhausting", "exhausted", "drained", "burnout", "burn out",
  "disappointed", "disappointing", "frustrating", "frustrated", "stressful", "depressing", "demotivating",
  "confusing", "confused", "unclear", "messy", "chaotic", "chaos", "hectic", "crowded",
  "disorganized", "unorganized", "poorly organized", "badly organized", "unprepared", "unprofessional",
  "uncomfortable", "unpleasant", "unbearable", "annoying", "irritating", "awkward", "cringey",
  "overcrowded", "overloaded", "overcapacity", "over capacity", "overwhelming", "overtime",
  "slow", "late", "delayed", "wasted",
  "useless", "pointless", "meaningless", "worthless",
  "unfair", "unfriendly", "rude", "harsh", "mean", "arrogant", "bossy", "bullying", "bully", "verbal abuse", "double standard",
  "so bad", "very bad", "really bad", "so boring", "very boring", "really boring",
  "not good", "not fun", "not clear", "not helpful", "not worth", "not recommended", "not comfortable", "not organized",
  "waste of time", "waste of energy", "waste",
  "too long", "too hot", "too short", "too much", "too crowded", "too noisy", "too fast", "too slow",
  "no fun", "no good", "big no", "hard pass", "never again",
  "trash", "trashh", "sampah", "garbage", "rubbish", "disaster", "total disaster", "nightmare",

  // ── Ekspresi Campuran Gaul + English ──
  "literally boring", "literally capek", "literally ngantuk", "literally buang waktu", "literally the worst", "literally kacau",
  "jujurly kecewa", "jujurly bosen", "jujurly capek", "jujurly kurang", "jujurly zonk", "jujur kecewa", "asli capek", "asli bosen", "asli kecewa",
  "so cringe", "cringe banget", "cringe bgt",
  "bad vibes", "negative vibes", "vibes negatif", "bad mood", "badmood", "badmood parah", "bikin badmood", "ngerusak mood", "ruined my mood", "bikin down",
  "lowkey bete", "lowkey males", "lowkey kecewa", "lowkey bosen",
  "highkey kesel", "highkey kecewa", "highkey capek",
  "ngl jelek", "ngl boring", "ngl bosen", "ngl kecewa",
  "no cap buruk", "no cap jelek", "no cap bosen",
  "it sucks", "sucks", "suck", "flop", "total flop", "flop parah", "big l", "common l", "massive l",
  "not worth it", "gak worth it", "ga worth it", "nggak worth it", "kurang worth it",
  "big yikes", "yikes",
  "red flag", "red flags", "red flag banget", "major red flag",
  "toxic", "toxicc", "toxic banget", "toxic parah",
  "mid", "midd", "mid banget",
  "dead inside", "social battery habis", "drained banget", "hectic parah", "hectic banget", "chaotic banget", "messy banget",
  "i cant",
  "sus", "sussy",
  "bruh", "bruhh",
  "cap", "capp",
];

const KATA_NEGATIF_KUAT = [
  // ── Formal ──
  "sangat buruk", "gagal total", "menyedihkan", "terrible", "awful", "horrible",
  "sangat kecewa", "kecewa berat", "kecewa parah", "payah banget", "kacau balau",

  // ── Gaul / Slang ──
  "parah banget", "parah bgt", "parah sih", "kacau parah", "zonk parah", "ngaret parah",
  "sampah banget", "trash banget", "ampas banget",
  "amit amit", "najis", "najiss",
  "kapok", "kapokk", "kapok ikut",
  "trauma", "traumatis", "perpeloncoan", "verbal abuse", "bullying",
  "nyesel", "nyesel banget", "nyesel ikut",
  "rugi banget", "rugi bgt", "rugi bandar",
  "buang waktu banget",
  "the worst", "so terrible",
  "literally the worst",

  // ── Campuran ──
  "so bad", "really bad", "very bad",
  "super jelek", "super buruk",
  "total disaster", "complete mess", "total flop",
  "absolutely terrible", "absolutely awful",
  "i hate it", "hate banget",
  "worst ever", "worst sih", "never again",
];

const KATA_NEGASI = new Set([
  "tidak", "bukan", "kurang", "jangan", "belum", "tak", "tanpa", "tiada", "minim",
  "nggak", "ga", "gak", "gk", "g", "nda", "ndak", "ngga", "enggak", "engga",
  "kagak", "kagag", "kaga", "ora", "mboten", "teu", "henteu", "indak", "trada", "tra",
  "tdk", "blm", "blum", "blom", "bkn", "jgn", "krg",
  "not", "no", "never", "dont", "doesnt", "didnt", "cant", "cannot", "wont", "isnt", "arent", "without", "barely", "hardly",
]);

const JEMBATAN_NEGASI = new Set([
  "terlalu", "begitu", "sangat", "amat", "paling", "rada", "agak", "cukup", "lumayan",
  "bikin", "buat", "membuat", "pernah",
  "so", "very", "too", "really", "that", "quite", "ever",
]);

const KATA_PENGUAT = new Set([
  "banget", "bgt", "bngt", "bnget", "bngett", "bangetz", "begete", "bingit", "bingits", "bet", "bett",
  "pol", "poll", "polll", "sekali", "skali", "kali", "pisan", "tenan", "bana", "nian", "soro", "abis", "abiss", "berat",
  "sangat", "amat", "sungguh", "super", "ultra", "ekstra", "extra", "maksimal",
  "so", "very", "really", "extremely", "hella", "totally", "completely", "absolutely", "literally", "af", "asf",
]);

const SLANG_MODIFIER_POS = new Set(["parah", "parahhh", "abis", "abiss", "berat", "gila", "gilak", "badai"]);

const SET_POSITIF = new Set(KATA_POSITIF.filter((k) => !k.includes(" ")));
const SET_NEGATIF = new Set(KATA_NEGATIF.filter((k) => !k.includes(" ")));
const FRASA_POSITIF = KATA_POSITIF.filter((k) => k.includes(" "));
const FRASA_NEGATIF = KATA_NEGATIF.filter((k) => k.includes(" "));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalisasi = (teks) =>
  teks
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const deelongasi = (kata) => {
  const kandidat = [kata];
  const c3 = kata.replace(/([a-z])\1{2,}/g, "$1");
  if (c3 !== kata) kandidat.push(c3);
  const c2 = kata.replace(/([a-z])\1+/g, "$1");
  if (c2 !== kata && c2 !== c3 && c2.length >= 4) kandidat.push(c2);
  return kandidat;
};

const cocokDiSet = (kata, setKata) => {
  for (const k of deelongasi(kata)) {
    if (setKata.has(k)) return true;
  }
  return false;
};

const hitungSkorSentimen = (teksNormal) => {
  const padded = ` ${teksNormal} `;
  const tokens = teksNormal ? teksNormal.split(" ") : [];
  let skorPos = 0;
  let skorNeg = 0;

  for (const frasa of FRASA_POSITIF) {
    const idx = padded.indexOf(` ${frasa} `);
    if (idx !== -1) {
      const sebelum = padded.slice(0, idx).trim().split(/\s+/).filter(Boolean);
      const prev1 = sebelum[sebelum.length - 1] || "";
      if (KATA_NEGASI.has(prev1)) skorNeg += 1.6;
      else skorPos += 1.5;
    }
  }

  for (const frasa of FRASA_NEGATIF) {
    const idx = padded.indexOf(` ${frasa} `);
    if (idx !== -1) {
      const kataAwal = frasa.split(" ")[0];
      const sebelum = padded.slice(0, idx).trim().split(/\s+/).filter(Boolean);
      const prev1 = sebelum[sebelum.length - 1] || "";
      if (!KATA_NEGASI.has(kataAwal) && KATA_NEGASI.has(prev1)) skorPos += 1.0;
      else skorNeg += 1.5;
    }
  }

  let sentimenTerakhir = null;
  for (let i = 0; i < tokens.length; i++) {
    const kata = tokens[i];
    const prev = i > 0 ? tokens[i - 1] : "";
    const bridged = i > 1 && JEMBATAN_NEGASI.has(prev) && KATA_NEGASI.has(tokens[i - 2]);
    const isNegated = KATA_NEGASI.has(prev) || bridged;

    if (SLANG_MODIFIER_POS.has(kata) && sentimenTerakhir === "pos" && !isNegated) {
      skorPos += 0.5;
      continue;
    }

    if (cocokDiSet(kata, SET_POSITIF)) {
      if (isNegated) {
        skorNeg += 1.2;
        sentimenTerakhir = "neg";
      } else {
        skorPos += 1;
        sentimenTerakhir = "pos";
      }
    } else if (cocokDiSet(kata, SET_NEGATIF)) {
      if (isNegated) {
        skorPos += 0.8;
        sentimenTerakhir = "pos";
      } else {
        skorNeg += 1.2;
        sentimenTerakhir = "neg";
      }
    } else if (cocokDiSet(kata, KATA_PENGUAT)) {
      if (sentimenTerakhir === "pos") skorPos += 0.35;
      else if (sentimenTerakhir === "neg") skorNeg += 0.35;
    } else if (!KATA_NEGASI.has(kata) && !JEMBATAN_NEGASI.has(kata)) {
      sentimenTerakhir = null;
    }
  }

  return { skorPos, skorNeg };
};

const deteksiTema = (normText) => {
  const padded = ` ${normText} `;
  const ditemukan = [];
  for (const [kunci, info] of Object.entries(TEMA)) {
    if (kunci === "umum") continue;
    for (const kata of info.kata) {
      const normKata = normalisasi(kata);
      if (padded.includes(` ${normKata} `) || (normKata.length >= 5 && normText.includes(normKata))) {
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
  const padded = ` ${normText} `;
  // Cek kata negatif kuat dengan batas kata apabila skor negatif memang relevan
  for (const k of KATA_NEGATIF_KUAT) {
    const normK = normalisasi(k);
    if (padded.includes(` ${normK} `) && skorNeg >= skorPos) return "negatif";
  }
  if (skorPos > skorNeg) return "positif";
  if (skorNeg > skorPos) return "negatif";
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
  const { skorPos, skorNeg } = hitungSkorSentimen(normText);

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
