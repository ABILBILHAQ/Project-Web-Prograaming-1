import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Search, Trash2, Loader2, AlertTriangle, Eye, Key, CheckCircle, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Layout } from "@/components/Layout";
import { SentimentBadge, type Sentiment } from "@/components/SentimentBadge";
import { supabase } from "@/integrations/supabase/client";
import {
  getStoredFeedbacks,
  deleteStoredFeedback,
  deleteAllStoredFeedbacks,
  getAdminSession,
  type FeedbackRow,
} from "@/lib/feedbackStore";
import {
  generateRecommendationWithGemini,
  getGeminiApiKey,
  setGeminiApiKey,
  testGeminiApiKey,
} from "@/lib/gemini";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const Admin = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSentiment, setFilterSentiment] = useState<string>("all");
  const [filterProdi, setFilterProdi] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [detailRow, setDetailRow] = useState<FeedbackRow | null>(null);

  // Gemini API Key management
  const [showGeminiDialog, setShowGeminiDialog] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Saran Generation Dialog State
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [showGeneratedDialog, setShowGeneratedDialog] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 1. Cek sesi admin lokal
      const localSession = getAdminSession();
      if (localSession && localSession.role === "admin") {
        setIsAdmin(true);
        setAuthChecked(true);
        load();
        return;
      }

      // 2. Fallback cek sesi Supabase
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", sessionData.session.user.id);
          const admin = (roleData || []).some((r) => r.role === "admin");
          if (admin) {
            setIsAdmin(true);
            setAuthChecked(true);
            load();
            return;
          }
        }
      } catch (err) {
        console.warn("Supabase auth check failed:", err);
      }

      setIsAdmin(false);
      setAuthChecked(true);
      navigate("/auth");
    };

    init();

    const handleFeedbackChange = () => {
      load();
    };
    window.addEventListener("pkkmb-feedback-change", handleFeedbackChange);

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session && !getAdminSession()) navigate("/auth");
    });

    return () => {
      window.removeEventListener("pkkmb-feedback-change", handleFeedbackChange);
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const load = async () => {
    const localData = getStoredFeedbacks();
    if (localData && localData.length > 0) {
      setData(localData);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const { data: sbData, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && sbData && sbData.length > 0) {
        setData(sbData as FeedbackRow[]);
      }
    } catch {}
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteStoredFeedback(deleteId);
    try {
      await supabase.from("feedback").delete().eq("id", deleteId);
    } catch {}
    setData((d) => d.filter((x) => x.id !== deleteId));
    toast.success("Feedback berhasil dihapus");
    setDeleteId(null);
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    deleteAllStoredFeedbacks();
    try {
      await supabase.from("feedback").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch {}
    setData([]);
    toast.success("Seluruh data feedback berhasil dibersihkan");
    setDeletingAll(false);
    setShowDeleteAll(false);
  };

  const prodiList = useMemo(
    () => Array.from(new Set(data.map((d) => d.prodi))).sort(),
    [data]
  );

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (filterSentiment !== "all" && d.sentiment !== filterSentiment) return false;
      if (filterProdi !== "all" && d.prodi !== filterProdi) return false;
      if (
        search &&
        !d.comment.toLowerCase().includes(search.toLowerCase()) &&
        !(d.name || "").toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [data, filterSentiment, filterProdi, search]);

  const exportCSV = () => {
    const header = ["Nama", "Prodi", "Komentar", "Sentimen", "Confidence", "Tanggal"];
    const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const rows = filtered.map((f) => [
      escape(f.name || ""),
      escape(f.prodi),
      escape(f.comment),
      escape(f.sentiment),
      f.confidence.toString(),
      escape(format(new Date(f.created_at), "yyyy-MM-dd HH:mm")),
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-pkkmb-${format(new Date(), "yyyyMMdd-HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data berhasil diekspor ke format CSV");
  };

  const handleGenerateSaran = async (row: FeedbackRow) => {
    setGenerating(true);
    try {
      const res = await generateRecommendationWithGemini({
        comment: row.comment,
        sentiment: row.sentiment,
        confidence: row.confidence,
        prodi: row.prodi,
      });

      setGeneratedText(res.text);
      setShowGeneratedDialog(true);
      toast.success("Rekomendasi evaluasi berhasil disusun.");
    } catch (err: any) {
      console.error("Gagal menyusun saran:", err);
      toast.error("Gagal memproses rekomendasi evaluasi.");
    } finally {
      setGenerating(false);
    }
  };

  const downloadGenerated = () => {
    if (!generatedText) return;
    const blob = new Blob([generatedText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekomendasi-evaluasi-pkkmb-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Dokumen rekomendasi berhasil diunduh.");
  };

  const openGeminiModal = () => {
    setGeminiKeyInput(getGeminiApiKey());
    setTestResult(null);
    setShowGeminiDialog(true);
  };

  const handleSaveGeminiKey = () => {
    setGeminiApiKey(geminiKeyInput.trim());
    toast.success("Kunci API berhasil disimpan.");
    setShowGeminiDialog(false);
  };

  const handleTestGeminiKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    const res = await testGeminiApiKey(geminiKeyInput.trim());
    setTestResult(res);
    setIsTestingKey(false);
  };

  const currentApiKey = getGeminiApiKey();

  if (!authChecked) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container py-20 max-w-md text-center">
          <Card className="p-8">
            <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
            <p className="text-sm text-muted-foreground">
              Akun Anda tidak memiliki hak akses administrator.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10 md:py-12 space-y-6">
        {/* Header Panel */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight mb-1">Panel Evaluasi &amp; Data</h1>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <CheckCircle className="h-3 w-3" /> Administrator
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Kelola data feedback mahasiswa dan hasil evaluasi sentimen PKKMB secara terstruktur.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={openGeminiModal} variant="outline" size="sm" className="gap-1.5" id="btn-gemini-config">
              <Key className="h-4 w-4 text-primary" />
              Pengaturan API
              {currentApiKey ? (
                <span className="h-2 w-2 rounded-full bg-primary ml-1" title="API Key aktif" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-amber-500 ml-1" title="API Key belum diatur" />
              )}
            </Button>
            <Button onClick={exportCSV} variant="outline" size="sm" disabled={!filtered.length}>
              <Download className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => setShowDeleteAll(true)}
              variant="destructive"
              size="sm"
              disabled={!data.length}
              id="delete-all-btn"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Hapus Semua Data
            </Button>
          </div>
        </div>

        {/* Filter Card */}
        <Card className="p-4 shadow-card">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari komentar atau nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterSentiment} onValueChange={setFilterSentiment}>
              <SelectTrigger>
                <SelectValue placeholder="Filter sentimen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sentimen</SelectItem>
                <SelectItem value="positive">Positif</SelectItem>
                <SelectItem value="neutral">Netral</SelectItem>
                <SelectItem value="negative">Negatif</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterProdi} onValueChange={setFilterProdi}>
              <SelectTrigger>
                <SelectValue placeholder="Filter prodi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Prodi</SelectItem>
                {prodiList.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Feedback Table */}
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Prodi</TableHead>
                  <TableHead className="min-w-[300px]">Komentar</TableHead>
                  <TableHead>Sentimen</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-center">Saran Evaluasi</TableHead>
                  <TableHead className="text-right">Hapus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      Tidak ada data feedback yang cocok dengan filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {f.name || <span className="text-muted-foreground italic">Anonim</span>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{f.prodi}</TableCell>
                      <TableCell className="max-w-md">
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-left group w-full"
                          onClick={() => setDetailRow(f)}
                        >
                          <p className="truncate flex-1 font-normal text-sm">{f.comment}</p>
                          <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      </TableCell>
                      <TableCell>
                        <SentimentBadge sentiment={f.sentiment} />
                      </TableCell>
                      <TableCell>{(f.confidence * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(f.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateSaran(f)}
                          disabled={generating}
                          className="gap-1.5 text-xs"
                        >
                          {generating ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Menyusun...
                            </>
                          ) : (
                            <>
                              <FileText className="h-3.5 w-3.5 text-primary" />
                              Rekomendasi
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteId(f.id)}
                          aria-label="Hapus"
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <p className="text-sm text-muted-foreground text-center">
          Menampilkan {filtered.length} dari {data.length} feedback evaluasi PKKMB
        </p>
      </div>

      {/* Dialog Detail Komentar */}
      <AlertDialog open={!!detailRow} onOpenChange={(o) => !o && setDetailRow(null)}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Detail Masukan Mahasiswa</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span><strong>Nama:</strong> {detailRow?.name || "Anonim"}</span>
                  <span><strong>Prodi:</strong> {detailRow?.prodi}</span>
                  <span><strong>Sentimen:</strong> {detailRow?.sentiment} ({(Number(detailRow?.confidence || 0) * 100).toFixed(0)}%)</span>
                  <span><strong>Waktu:</strong> {detailRow ? format(new Date(detailRow.created_at), "dd MMM yyyy, HH:mm", { locale: localeId }) : ""}</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-1 py-2">
            <div className="rounded-lg bg-muted/60 p-4 max-h-72 overflow-y-auto border">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{detailRow?.comment}</p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Tutup</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Konfirmasi Hapus Satu Feedback */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus feedback ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Baris feedback akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Konfirmasi Hapus Semua */}
      <AlertDialog open={showDeleteAll} onOpenChange={(o) => !o && setShowDeleteAll(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus seluruh data feedback?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>Perhatian:</strong> Tindakan ini akan menghapus seluruh data masukan (
              <strong>{data.length} baris</strong>) secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAll}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingAll}
            >
              {deletingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Ya, Hapus Semua"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Hasil Rekomendasi Evaluasi */}
      <AlertDialog
        open={showGeneratedDialog}
        onOpenChange={(o) => !o && setShowGeneratedDialog(false)}
      >
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Rekomendasi Tindak Lanjut Evaluasi PKKMB
            </AlertDialogTitle>
            <AlertDialogDescription>
              Usulan langkah penanganan konkret berdasarkan masukan dan sentimen mahasiswa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <div className="rounded-lg bg-muted/50 p-4 border max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {generatedText}
              </pre>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowGeneratedDialog(false)}>
              Tutup
            </AlertDialogCancel>
            <AlertDialogAction onClick={downloadGenerated} className="bg-primary text-primary-foreground gap-1.5">
              <Download className="h-4 w-4" />
              Unduh Catatan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Pengaturan Kunci API */}
      <AlertDialog open={showGeminiDialog} onOpenChange={setShowGeminiDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Pengaturan API Analisis Sentimen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Konfigurasikan API Key Google Gemini untuk pemrosesan teks dan rekomendasi evaluasi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                Gemini API Key (Google AI Studio)
              </label>
              <Input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Dapatkan kunci di{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  aistudio.google.com/apikey
                </a>
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-md text-xs border ${
                  testResult.success
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>
          <AlertDialogFooter className="flex-row items-center justify-between sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestGeminiKey}
              disabled={isTestingKey || !geminiKeyInput.trim()}
              className="gap-1.5"
            >
              {isTestingKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Uji Koneksi
            </Button>
            <div className="flex gap-2">
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <Button onClick={handleSaveGeminiKey} className="bg-primary text-primary-foreground">
                Simpan
              </Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Admin;
