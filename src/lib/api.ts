import type { Sentiment } from "./gemini";
import type { FeedbackRow } from "./feedbackStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface FeedbackQueryParams {
  page?: number;
  limit?: number;
  sentiment?: string;
  prodi?: string;
  search?: string;
  sort?: "created_at" | "confidence";
  order?: "asc" | "desc";
}

export interface FeedbackListResponse {
  data: FeedbackRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FeedbackStatsResponse {
  total: number;
  sentiments: {
    positive: number;
    negative: number;
    neutral: number;
  };
  prodiDistribution: Array<{ prodi: string; count: number }>;
}

/**
 * Cek status koneksi ke Backend & Database MySQL
 */
export async function checkServerHealth(): Promise<{ ok: boolean; database: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { ok: false, database: "disconnected" };
    const json = await res.json();
    return { ok: true, database: json.database || "connected" };
  } catch {
    return { ok: false, database: "offline" };
  }
}

/**
 * Ambil daftar feedback dari MySQL
 */
export async function fetchFeedbacksApi(params?: FeedbackQueryParams): Promise<FeedbackListResponse | null> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.sentiment && params.sentiment !== "all") searchParams.set("sentiment", params.sentiment);
    if (params?.prodi && params.prodi !== "all") searchParams.set("prodi", params.prodi);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.order) searchParams.set("order", params.order);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const res = await fetch(`${API_BASE}/api/v1/feedback${query}`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("[API] Gagal mengambil feedback dari MySQL backend:", err);
    return null;
  }
}

/**
 * Tambah feedback baru ke database MySQL
 */
export async function createFeedbackApi(data: {
  name?: string | null;
  prodi: string;
  comment: string;
  sentiment: Sentiment;
  confidence: number;
}): Promise<FeedbackRow | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "Gagal menyimpan ke MySQL");
    }

    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn("[API] Gagal simpan feedback ke MySQL backend:", err);
    return null;
  }
}

/**
 * Bulk import feedback ke database MySQL
 */
export async function bulkCreateFeedbackApi(items: Array<{
  name?: string | null;
  prodi: string;
  comment: string;
  sentiment: Sentiment;
  confidence: number;
}>): Promise<{ success: boolean; count: number } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/feedback/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "Gagal bulk import ke MySQL");
    }

    return await res.json();
  } catch (err) {
    console.warn("[API] Gagal bulk import ke MySQL backend:", err);
    return null;
  }
}

/**
 * Update feedback di database MySQL
 */
export async function updateFeedbackApi(
  id: string,
  data: Partial<{
    name?: string | null;
    prodi: string;
    comment: string;
    sentiment: Sentiment;
    confidence: number;
  }>
): Promise<FeedbackRow | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/feedback/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn("[API] Gagal update feedback ke MySQL:", err);
    return null;
  }
}

/**
 * Hapus feedback dari database MySQL
 */
export async function deleteFeedbackApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/feedback/${id}`, {
      method: "DELETE",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch (err) {
    console.warn("[API] Gagal delete feedback dari MySQL:", err);
    return false;
  }
}

/**
 * Hapus semua feedback dari database MySQL
 */
export async function deleteAllFeedbackApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/feedback`, {
      method: "DELETE",
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch (err) {
    console.warn("[API] Gagal hapus semua feedback dari MySQL:", err);
    return false;
  }
}

/**
 * Login admin via MySQL
 */
export async function loginAdminApi(email: string, password: string): Promise<{
  success: boolean;
  user?: { id: string; email: string; role: string };
  token?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(5000),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || "Gagal masuk" };
    }
    return json;
  } catch (err: any) {
    return { success: false, error: err?.message || "Koneksi backend gagal" };
  }
}
