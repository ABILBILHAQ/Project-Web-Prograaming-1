import type { Sentiment } from "./gemini";

export interface FeedbackRow {
  id: string;
  name: string | null;
  prodi: string;
  comment: string;
  sentiment: Sentiment;
  confidence: number;
  created_at: string;
}

const STORAGE_KEY = "pkkmb_feedback_data";
const ADMIN_SESSION_KEY = "pkkmb_admin_session";

// Data awal evaluasi PKKMB realistis untuk memastikan dashboard & tabel admin terisi lengkap
const INITIAL_FEEDBACKS: FeedbackRow[] = [
  {
    id: "f1a2b3c4-0001-4000-8000-000000000001",
    name: "Muhammad Rizky",
    prodi: "Teknik Informatika",
    comment: "Materi pengenalan prodi dan kurikulum sangat jelas dan informatif. Kakak pendamping kelompok sangat ramah dan membantu kami!",
    sentiment: "positive",
    confidence: 0.96,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "f1a2b3c4-0002-4000-8000-000000000002",
    name: "Aisyah Putri",
    prodi: "Sistem Informasi",
    comment: "Acara pembukaannya megah dan sangat berkesan, namun waktu istirahat dan ibadah siang terasa agak terburu-buru.",
    sentiment: "neutral",
    confidence: 0.78,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "f1a2b3c4-0003-4000-8000-000000000003",
    name: "Budi Santoso",
    prodi: "Teknik Elektro",
    comment: "Sound system di aula utama beberapa kali kresek-kresek dan suara pemateri jadi kurang jelas di bagian belakang.",
    sentiment: "negative",
    confidence: 0.89,
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: "f1a2b3c4-0004-4000-8000-000000000004",
    name: "Citra Dewi",
    prodi: "Manajemen",
    comment: "Expo UKM dan organisasi mahasiswa sangat inspiratif! Saya jadi tahu minat organisasi yang ingin diikuti.",
    sentiment: "positive",
    confidence: 0.94,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: "f1a2b3c4-0005-4000-8000-000000000005",
    name: null,
    prodi: "Ilmu Komunikasi",
    comment: "Penugasan resume materi PKKMB agak terlalu banyak dalam tenggat waktu yang sempit, mahasiswa baru jadi kurang tidur.",
    sentiment: "negative",
    confidence: 0.92,
    created_at: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
  },
  {
    id: "f1a2b3c4-0006-4000-8000-000000000006",
    name: "Dimas Anggara",
    prodi: "Teknik Mesin",
    comment: "Panitia sangat disiplin dan menjaga ketertiban dengan baik tanpa ada bentak-bentakan atau perpeloncoan.",
    sentiment: "positive",
    confidence: 0.91,
    created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
  },
  {
    id: "f1a2b3c4-0007-4000-8000-000000000007",
    name: "Eka Rahmawati",
    prodi: "Akuntansi",
    comment: "Konsumsi makan siang enak dan higienis, pembagiannya juga tertib dan cepat.",
    sentiment: "positive",
    confidence: 0.95,
    created_at: new Date(Date.now() - 1000 * 60 * 750).toISOString(),
  },
  {
    id: "f1a2b3c4-0008-4000-8000-000000000008",
    name: "Fajar Nugraha",
    prodi: "Ilmu Hukum",
    comment: "Suhu ruangan gedung serbaguna agak panas saat siang hari karena beberapa pendingin ruangan tidak menyala optimal.",
    sentiment: "neutral",
    confidence: 0.81,
    created_at: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
  },
  {
    id: "f1a2b3c4-0009-4000-8000-000000000009",
    name: "Gita Permata",
    prodi: "Farmasi",
    comment: "Kegiatan campus tour sangat bermanfaat untuk mengenali lokasi laboratorium, perpustakaan, dan gedung fakultas.",
    sentiment: "positive",
    confidence: 0.93,
    created_at: new Date(Date.now() - 1000 * 60 * 1100).toISOString(),
  },
  {
    id: "f1a2b3c4-0010-4000-8000-000000000010",
    name: null,
    prodi: "Psikologi",
    comment: "Rundown acara sering molor dari jadwal yang dibagikan sebelumnya, mohon manajemen waktu diperbaiki untuk sesi berikutnya.",
    sentiment: "negative",
    confidence: 0.85,
    created_at: new Date(Date.now() - 1000 * 60 * 1300).toISOString(),
  },
  {
    id: "f1a2b3c4-0011-4000-8000-000000000011",
    name: "Hafiz Pratama",
    prodi: "Kedokteran",
    comment: "Tim medis dan K3 PKKMB sangat sigap saat ada teman yang pusing atau tidak enak badan saat upacara.",
    sentiment: "positive",
    confidence: 0.97,
    created_at: new Date(Date.now() - 1000 * 60 * 1500).toISOString(),
  },
  {
    id: "f1a2b3c4-0012-4000-8000-000000000012",
    name: "Intan Nuraini",
    prodi: "Hubungan Internasional",
    comment: "Ice breaking dan yel-yel kelompoknya seru sekali, membuat kami yang awalnya canggung jadi cepat akrab.",
    sentiment: "positive",
    confidence: 0.98,
    created_at: new Date(Date.now() - 1000 * 60 * 1700).toISOString(),
  },
];

export function getStoredFeedbacks(): FeedbackRow[] {
  if (typeof window === "undefined") return INITIAL_FEEDBACKS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACKS));
      return INITIAL_FEEDBACKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // Jika kosong, inisialisasi ulang dengan sample data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACKS));
    return INITIAL_FEEDBACKS;
  } catch (err) {
    console.error("Gagal membaca feedback dari localStorage:", err);
    return INITIAL_FEEDBACKS;
  }
}

export function saveStoredFeedbacks(feedbacks: FeedbackRow[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
    window.dispatchEvent(new CustomEvent("pkkmb-feedback-change", { detail: feedbacks }));
  } catch (err) {
    console.error("Gagal menyimpan feedback ke localStorage:", err);
  }
}

export function addStoredFeedback(
  data: Omit<FeedbackRow, "id" | "created_at">
): FeedbackRow {
  const current = getStoredFeedbacks();
  const newRow: FeedbackRow = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: data.name ? data.name.trim() : null,
    prodi: data.prodi.trim(),
    comment: data.comment.trim(),
    sentiment: data.sentiment,
    confidence: Number(data.confidence) || 0.85,
    created_at: new Date().toISOString(),
  };

  const updated = [newRow, ...current];
  saveStoredFeedbacks(updated);
  return newRow;
}

export function addBatchStoredFeedbacks(
  items: Array<Omit<FeedbackRow, "id" | "created_at">>
): FeedbackRow[] {
  const current = getStoredFeedbacks();
  const created: FeedbackRow[] = items.map((item, idx) => ({
    id: `bulk-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    name: item.name ? item.name.trim() : null,
    prodi: item.prodi.trim(),
    comment: item.comment.trim(),
    sentiment: item.sentiment,
    confidence: Number(item.confidence) || 0.85,
    created_at: new Date(Date.now() - idx * 1000).toISOString(),
  }));

  const updated = [...created, ...current];
  saveStoredFeedbacks(updated);
  return created;
}

export function deleteStoredFeedback(id: string): void {
  const current = getStoredFeedbacks();
  const updated = current.filter((item) => item.id !== id);
  saveStoredFeedbacks(updated);
}

export function deleteAllStoredFeedbacks(): void {
  saveStoredFeedbacks([]);
}

// === AUTH SESSION (ADMIN) ===
export interface AdminSession {
  user: {
    id: string;
    email: string;
  };
  role: "admin";
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAdminSession(email = "admin@pkkmb.ac.id"): AdminSession {
  const session: AdminSession = {
    user: {
      id: "admin-local-master-id",
      email,
    },
    role: "admin",
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent("pkkmb-auth-change", { detail: session }));
  }
  return session;
}

export function clearAdminSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.dispatchEvent(new CustomEvent("pkkmb-auth-change", { detail: null }));
  }
}
