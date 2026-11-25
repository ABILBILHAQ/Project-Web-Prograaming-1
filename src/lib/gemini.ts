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

// ─── Kamus Sentimen Indonesia Lengkap (Formal + Gaul + Daerah + Campuran) ─────
//
// Mencakup:
//  • Bahasa Indonesia formal / baku
//  • Bahasa gaul / slang Gen-Z, medsos (TikTok, X/Twitter, IG), tongkrongan & kampus
//  • Kosakata populer daerah yang umum dipakai sehari-hari (Jawa, Sunda, Sumatera, Timur)
//  • Singkatan chat/WA & variasi ejaan/typo umum (bgt, gpp, tks, gercep, pw, dll.)
//  • Bahasa campuran Indo-English (anak Jaksel / bilingual sehari-hari)
//  • Idiom & ekspresi multi-kata beserta penanganan negasi & kata penguat (intensifier)

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
  "berguna", "berfaedah", "mendukung", "memberdayakan", "lancar", "kondusif",
  "interaktif", "solutif", "konstruktif", "komunikatif", "kooperatif", "sportif",
  "sopan", "santun", "sopan santun", "bijak", "adil", "transparan", "akurat",
  "tepat waktu", "sesuai jadwal", "sesuai rundown", "terstruktur", "sistematis",
  "ramah tamah", "mengayomi", "merangkul", "memberi solusi", "sangat membantu",
  "enak", "lezat", "nikmat", "sedap", "segar", "kenyang", "melimpah",
  "bersih", "wangi", "harum", "sejuk", "rindang", "asri", "lega", "luas",
  "mudah dipahami", "enak didengar", "jelas banget", "lumayan", "cukup baik",
  "patut diapresiasi", "layak diapresiasi", "pertahankan", "lanjutkan",

  // ── Bahasa Gaul / Slang Sehari-hari & Kampus ──
  "mantul", "mantab", "mantep", "mantepp", "mantapp", "mantap jiwa", "mantap djiwa",
  "mantap betul", "mantap pol", "mantap kali", "mantap pisan", "mantap surantap",
  "kece", "kece badai", "kece parah", "kece abis", "kece berat", "kece pol",
  "asik", "asiik", "asikk", "asyikk", "asik parah", "asik pol", "asik abis",
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
  "wkwk", "wkwkwk", "haha", "hahaha", "hehe", "hihi",
  "uwu", "uwuu", "lucu", "gemesin", "gemesh", "gemes", "gemoy", "kiyowo",
  "sabi", "sabii", "sabi banget", "sabi lah",
  "gaskeun", "gaspol", "gas pol", "gas terus", "gaskan", "kuy", "skuy", "yakali ga kuy",
  "cuss", "cusss",
  "sultan", "dewa", "legend", "legenda", "suhu", "sepuh", "master",
  "auto seneng", "auto happy", "auto semangat", "auto betah", "auto suka",
  "niat banget", "niat bgt", "niat pol", "totalitas", "totality", "totalitas tanpa batas",
  "sat set", "satset", "sat set sat set", "satset watwet", "sat set wat wet",
  "gercep", "gercep banget", "gercep bgt", "gercep pol",
  "pewe", "pw", "pw banget", "pewe banget", "betah", "betah banget", "betah bgt", "betah pol",
  "adem", "adem banget", "adem bgt", "adem ayem", "adem pol",
  "ngakak", "ngakak abis", "ngakak pol", "pecah tawa", "full senyum", "senyum terus", "murah senyum",
  "cair", "suasana cair", "cair banget", "akrab", "cepat akrab", "kekeluargaan", "ngemong",
  "materi daging", "daging semua", "isinya daging", "full daging", "ilmu daging", "bergizi",
  "ngena", "ngena banget", "dapet banget", "nyampe banget", "buka wawasan", "nambah ilmu", "nambah relasi", "nambah temen",
  "anti ngantuk", "anti bosen", "anti garing",
  "nagih", "bikin nagih", "ga kerasa", "gak kerasa", "susah move on", "gamon positif", "ngangenin", "bakal kangen",
  "merinding", "terharu", "bikin terharu", "baper positif", "bangga", "bangga banget",
  "bukan kaleng kaleng", "gak kaleng kaleng", "ga kaleng kaleng", "bukan main", "gak ada obat", "ga ada obat", "gada obat", "tiada lawan", "gak gagal", "ga pernah gagal",
  "juara", "champion", "jawara", "jempolan", "dua jempol", "bintang lima", "10/10", "100/100",
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
  "mksih", "tengkyu", "tengkyuu", "tenkyu", "tq", "ty", "tysm", "thx u",
  "gpp", "gapapa", "ga papa",
  "otw", "lfg", "gg", "ggwp", "mvp", "goat", "the goat",
  "yoi", "yoii", "yess", "yesss", "yap", "yupp",
  "sipp", "sippp", "sip", "siap", "siaap", "acc", "valid", "no debat", "valid no debat",
  "woke", "wokee", "baek", "ntaps", "ntap", "mantaps",
  "dabest", "da best", "terdabest", "ter the best", "bedebest",

  // ── Bahasa Campuran Indo-English (Jaksel & Gen-Z) ──
  "good", "great", "nice", "cool", "awesome", "excellent", "perfect",
  "love", "lovely", "luv", "luvv", "lope", "wonderful", "fantastic", "superb", "outstanding",
  "well done", "well organized", "well prepared", "well executed", "good job", "great job", "nice try", "nice work",
  "happy", "enjoy", "enjoyed", "enjoyable", "fun",
  "helpful", "useful", "clear", "organized", "smooth", "seamless",
  "impressive", "incredible", "brilliant", "remarkable", "phenomenal", "epic",
  "best", "better", "improved", "upgrade", "level up",
  "so good", "very good", "really good", "pretty good", "damn good", "hella good",
  "so fun", "very fun", "super fun", "really fun",
  "highly recommended", "recommended", "rekomen", "rekomen banget", "recommended banget",
  "satisfied", "satisfying", "comfortable", "cozy", "comfy",
  "worth", "worth it", "worthit", "worth every second", "valuable", "meaningful", "insightful", "informative",
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
  "big w", "common w", "win", "all out", "high effort",

  // ── Ekspresi Campuran Gaul + English ──
  "good vibes", "positive vibes", "positif vibes", "vibes positif", "vibes nya bagus", "vibes nya enak", "vibes nya asik", "vibes nya dapet", "good energy",
  "mood booster", "moodbooster", "naikin mood", "bikin happy", "bikin seneng", "bikin semangat",
  "literally bagus", "literally keren", "literally seru", "literally the best",
  "jujurly bagus", "jujurly keren", "jujurly seru", "jujurly suka", "jujurly asik", "jujurly nyaman",
  "jujur bagus", "jujur keren", "jujur seru", "asli keren", "asli seru", "asli bagus", "rill bagus", "rill keren", "rill seru",
  "tbh bagus", "tbh keren", "tbh seru", "imo bagus", "imo keren",
  "so worth it", "worth it banget", "worth it bgt", "worth it parah", "worth it pol",
  "the best sih", "the best deh", "the best lah", "the best banget", "the best pokonya",
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

const NEGATIVE_WORDS = [
  // ── Formal / Baku ──
  "buruk", "jelek", "kecewa", "membosankan", "bosan", "lama", "lambat", "molor",
  "panas", "kacau", "rusak", "kurang", "sulit", "susah", "tidak jelas", "gak jelas",
  "marah", "senioritas", "bentak", "bentakan", "tegang", "lelah", "capek", "letih",
  "dingin", "kotor", "bau", "sempit", "gaduh", "bising", "membingungkan",
  "menyusahkan", "memberatkan", "tertekan", "stress", "stres", "telat", "tidak ada",
  "kurang siap", "buruk sekali", "sia-sia", "sia sia", "boros", "rugi", "antre", "antri", "ribet",
  "mengecewakan", "memalukan", "mengesalkan", "menjengkelkan", "menyebalkan",
  "menakutkan", "mengintimidasi", "menekan", "mempermalukan", "merugikan",
  "tidak nyaman", "tidak memadai", "tidak layak", "tidak ramah", "tidak siap",
  "tidak sopan", "tidak adil", "tidak efektif", "tidak efisien", "tidak kondusif", "tidak berguna",
  "berantakan", "amburadul", "semrawut", "acakadut", "kacau balau", "karut marut",
  "monoton", "menjenuhkan", "menjemukan", "hambar",
  "terlalu lama", "terlalu panas", "terlalu singkat", "terlalu banyak", "terlalu padat", "terlalu sempit",
  "tidak terorganisir", "tidak terkoordinasi", "tidak profesional", "kurang koordinasi", "miskoordinasi",
  "berlebihan", "berbelit", "bertele-tele", "bertele tele", "berbelit-belit", "berbelit belit",
  "mengantuk", "ngantuk", "terlambat", "mubazir", "gagal", "payah", "cacat",
  "intimidasi", "perpeloncoan", "pelonco", "plonco", "penindasan", "kekerasan",
  "kasar", "arogan", "angkuh", "sombong", "pilih kasih", "berat sebelah",
  "simpang siur", "mendadak", "terlantar", "ditelantarkan", "dipersulit", "merepotkan",
  "kelaparan", "kehausan", "dehidrasi", "pingsan", "tumbang", "basi", "jorok", "kumuh", "pengap",

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
  "engap", "sesek", "desak desakan", "desak-desakan", "umpel umpelan", "umpel-umpelan", "rebutan", "antri panjang", "antre panjang",
  "suara pecah", "speaker pecah", "mic mati", "mic rusak", "ga kedengeran", "gak kedengeran", "kresek kresek", "berisik", "berisik banget", "ribut", "ricuh", "rusuh",
  "lemot", "lemot banget", "ngelag", "lag", "server down", "web down", "error", "bug", "crash", "macet", "susah sinyal",
  "ngaret", "ngaret parah", "ngaret banget", "ngaret bgt", "jam karet", "molor parah", "molor terus", "kelamaan", "kepanjangan", "nunggu lama", "digantung",
  "galak", "galak banget", "galak bgt", "jutek", "jutek banget", "jutek bgt", "sinis", "judes", "judes banget", "ketus",
  "songong", "tengil", "belagu", "sok keras", "sok asik", "sok senior", "sok galak", "sok tegas", "sok iye", "sok berkuasa", "gila hormat", "haus hormat", "feodal", "kolot",
  "nyolot", "ngegas", "ngegas mulu", "marah marah", "marah-marah", "bentak bentak", "bentak-bentak", "teriak teriak", "teriak-teriak", "sensi", "sensian", "baperan",
  "miskom", "misskom", "dadakan", "serba dadakan", "info dadakan", "plin plan", "plin-plan", "lepas tangan", "cuci tangan", "lempar tanggung jawab",
  "ngeselin", "nyebelin", "sebel", "sebell", "kesel", "kesell", "kesal bgt", "gedeg", "gedek", "dongkol", "gondok", "jengkel", "muak", "enek", "eneg", "makan hati", "nyesek",
  "emosi", "emosii", "bikin emosi", "bikin kesel", "bikin bete",
  "baper", "baper negatif", "kena mental", "mental kena",
  "drama", "dramatis", "lebay", "lebai", "alay",
  "gaje", "gajelas", "ga jelas", "gak jelas", "nggak jelas", "gaje parah", "gaje banget", "gj",
  "gasuka", "gaseru", "gabagus", "gaenak", "ganyaman", "garamah", "gabener", "gamutu",
  "gaksuka", "gakseru", "gakbagus", "gakenak", "gaknyaman", "gakramah", "gakbener", "gakmutu",
  "ga bener", "gak bener", "ga mutu", "gak mutu", "ga sopan", "gak sopan", "ga adil", "gak adil", "ga ramah", "gak ramah", "ga nyaman", "gak nyaman", "ga enak", "gak enak",
  "unfaedah", "nirfaedah", "ga faedah", "gak faedah", "ga guna", "gak guna", "gak berguna", "percuma", "buang waktu", "buang buang waktu",
  "kentang", "kentang banget", "nanggung", "asal asalan", "asal-asalan", "ngawur", "ga niat", "gak niat", "setengah hati",
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
  "amit amit", "amit-amit", "najis", "malu maluin", "malu-maluin", "bikin malu",
  "mending", "mendingan", "yaudahlah", "yaudah", "ya sudahlah", "cupu", "fail",
  "ga banget", "gak banget", "nggak banget", "ga rekomen", "gak rekomen",

  // ── Slang Daerah Negatif (Jawa, Sunda, dll.) ──
  "sumuk", "kemproh", "angel", "riweh", "lieur", "rieut", "hareudang", "hoream", "rudet", "kezel",

  // ── Singkatan Gaul Negatif ──
  "tdr", "tidur", "smh", "fml", "wtf", "wth", "zzz", "meh", "mehh", "1/10", "0/10", "2/10", "3/10",

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
  "i cant", "i can't",
  "sus", "sussy",
  "bruh", "bruhh",
  "cap", "capp",
];

const NEGATION_WORDS = [
  // ── Formal ──
  "tidak", "bukan", "kurang", "jangan", "belum", "tak", "tanpa", "tiada", "minim",
  // ── Gaul / Singkatan / Daerah ──
  "nggak", "ga", "gak", "gk", "g", "nda", "ndak", "ngga", "enggak", "engga",
  "kagak", "kagag", "kaga", "ora", "mboten", "teu", "henteu", "indak", "trada", "tra",
  "tdk", "blm", "blum", "blom", "bkn", "jgn", "krg",
  "gada", "gaada", "gak ada", "ga ada", "nggak ada", "tdk ada",
  "gamau", "gak mau", "ga mau", "ogah",
  "gabisa", "gak bisa", "ga bisa", "gabsa", "tdk bisa",
  "gaperlu", "gak perlu", "ga perlu",
  // ── English ──
  "not", "no", "never", "dont", "don't", "doesnt", "doesn't", "didnt", "didn't",
  "can't", "cant", "cannot", "won't", "wont", "isnt", "isn't", "arent", "aren't",
  "wasnt", "wasn't", "werent", "weren't", "without", "barely", "hardly", "neither", "none", "nothing",
];

// Kata penguat (intensifier) — memperkuat skor sentimen kata di dekatnya tanpa memberi bias positif palsu
const INTENSIFIER_WORDS = [
  "banget", "bgt", "bngt", "bnget", "bngett", "bangetz", "begete", "bingit", "bingits", "bet", "bett",
  "pol", "poll", "polll", "pake banget", "pake bgt",
  "sekali", "skali", "kali", "pisan", "tenan", "bana", "nian", "soro", "abis", "abiss", "berat",
  "sangat", "amat", "sungguh", "super", "ultra", "ekstra", "extra", "maksimal",
  "so", "very", "really", "extremely", "hella", "totally", "completely", "absolutely", "literally", "af", "asf", "josjis"
];

// Kata penghubung antara negasi dan kata sifat (contoh: "gak terlalu bagus", "not really good", "nggak bikin bosen")
const NEGATION_BRIDGE_WORDS = new Set([
  "terlalu", "begitu", "sangat", "amat", "paling", "rada", "agak", "cukup", "lumayan",
  "bikin", "buat", "membuat", "pernah",
  "so", "very", "too", "really", "that", "quite", "ever",
]);

// Kata slang yang bermakna penguat positif bila muncul tepat setelah kata positif (contoh: "keren parah", "ramah parah")
const SLANG_POS_MODIFIERS = new Set(["parah", "parahhh", "abis", "abiss", "berat", "gila", "gilak", "badai"]);

const POSITIVE_SET = new Set(POSITIVE_WORDS.filter((w) => !w.includes(" ")));
const NEGATIVE_SET = new Set(NEGATIVE_WORDS.filter((w) => !w.includes(" ")));
const NEGATION_SET = new Set(NEGATION_WORDS);
const INTENSIFIER_SET = new Set(INTENSIFIER_WORDS.filter((w) => !w.includes(" ")));

const POSITIVE_PHRASES = POSITIVE_WORDS.filter((w) => w.includes(" "));
const NEGATIVE_PHRASES = NEGATIVE_WORDS.filter((w) => w.includes(" "));

function normalizeElongatedWord(word: string): string[] {
  const candidates = [word];
  const collapsed3 = word.replace(/([a-z])\1{2,}/g, "$1");
  if (collapsed3 !== word) candidates.push(collapsed3);
  const collapsed2 = word.replace(/([a-z])\1+/g, "$1");
  if (collapsed2 !== word && collapsed2 !== collapsed3 && collapsed2.length >= 4) {
    candidates.push(collapsed2);
  }
  return candidates;
}

function matchInSet(word: string, set: Set<string>): boolean {
  for (const candidate of normalizeElongatedWord(word)) {
    if (set.has(candidate)) return true;
  }
  return false;
}

export function analyzeSentimentLocally(text: string): SentimentAnalysisResult {
  const lower = text.toLowerCase();
  const cleanSpaced = lower.replace(/[^a-z0-9/]+/g, " ").trim();
  const padded = ` ${cleanSpaced} `;
  const words = lower.split(/[^a-zA-Z0-9_/]+/).filter(Boolean);

  let positiveScore = 0;
  let negativeScore = 0;

  // 1. Cek frasa multi-kata (bigram/trigram) dulu dengan batas kata & deteksi negasi sebelum frasa
  for (const phrase of POSITIVE_PHRASES) {
    const cleanPhrase = phrase.replace(/[^a-z0-9/]+/g, " ").trim();
    const idx = padded.indexOf(` ${cleanPhrase} `);
    if (idx !== -1) {
      const beforeTokens = padded.slice(0, idx).trim().split(/\s+/).filter(Boolean);
      const prev1 = beforeTokens[beforeTokens.length - 1] || "";
      const prev2 = beforeTokens.length >= 2 ? `${beforeTokens[beforeTokens.length - 2]} ${prev1}` : prev1;
      const phraseNegated = NEGATION_SET.has(prev1) || NEGATION_SET.has(prev2);
      if (phraseNegated) {
        negativeScore += 1.6;
      } else {
        positiveScore += 1.5;
      }
    }
  }

  for (const phrase of NEGATIVE_PHRASES) {
    const cleanPhrase = phrase.replace(/[^a-z0-9/]+/g, " ").trim();
    const idx = padded.indexOf(` ${cleanPhrase} `);
    if (idx !== -1) {
      const firstToken = cleanPhrase.split(" ")[0];
      const alreadyHasNegation = NEGATION_SET.has(firstToken);
      const beforeTokens = padded.slice(0, idx).trim().split(/\s+/).filter(Boolean);
      const prev1 = beforeTokens[beforeTokens.length - 1] || "";
      const prev2 = beforeTokens.length >= 2 ? `${beforeTokens[beforeTokens.length - 2]} ${prev1}` : prev1;
      const phraseNegated = !alreadyHasNegation && (NEGATION_SET.has(prev1) || NEGATION_SET.has(prev2));
      if (phraseNegated) {
        positiveScore += 1.0;
      } else {
        negativeScore += 1.5;
      }
    }
  }

  // 2. Cek kata per-kata dengan deteksi negasi, jembatan negasi, slang modifier, dan intensifier
  let lastWordSentiment: "pos" | "neg" | null = null;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : "";
    const prevTwoWords = i > 1 ? `${words[i - 2]} ${words[i - 1]}` : prevWord;
    const bridgedNegation =
      i > 1 && NEGATION_BRIDGE_WORDS.has(prevWord) && NEGATION_SET.has(words[i - 2]);
    const isNegated =
      NEGATION_SET.has(prevWord) || NEGATION_SET.has(prevTwoWords) || bridgedNegation;

    // Kasus khusus slang Indonesia: kata positif + "parah"/"abis"/"gila" (misal: "ramah parah", "seru parah")
    if (SLANG_POS_MODIFIERS.has(word) && lastWordSentiment === "pos" && !isNegated) {
      positiveScore += 0.5;
      continue;
    }

    if (matchInSet(word, POSITIVE_SET)) {
      if (isNegated) {
        negativeScore += 1.2;
        lastWordSentiment = "neg";
      } else {
        positiveScore += 1;
        lastWordSentiment = "pos";
      }
    } else if (matchInSet(word, NEGATIVE_SET)) {
      if (isNegated) {
        positiveScore += 0.8;
        lastWordSentiment = "pos";
      } else {
        negativeScore += 1.2;
        lastWordSentiment = "neg";
      }
    } else if (matchInSet(word, INTENSIFIER_SET)) {
      // Intensifier memperkuat sentimen kata tepat sebelumnya (misal: "seru bgt" / "panas bgt")
      if (lastWordSentiment === "pos") {
        positiveScore += 0.35;
      } else if (lastWordSentiment === "neg") {
        negativeScore += 0.35;
      }
    } else if (!NEGATION_SET.has(word) && !NEGATION_BRIDGE_WORDS.has(word)) {
      lastWordSentiment = null;
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
