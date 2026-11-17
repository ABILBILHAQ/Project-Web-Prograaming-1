import { describe, it, expect, beforeEach } from "vitest";
import {
  getAdminSession,
  setAdminSession,
  clearAdminSession,
  getStoredFeedbacks,
  addStoredFeedback,
  deleteStoredFeedback,
  deleteAllStoredFeedbacks,
} from "@/lib/feedbackStore";
import {
  analyzeSentimentLocally,
  generateRecommendationWithGemini,
} from "@/lib/gemini";

describe("Feedback Store & Admin Auth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should manage admin session correctly", () => {
    expect(getAdminSession()).toBeNull();

    const session = setAdminSession("admin@pkkmb.ac.id");
    expect(session.role).toBe("admin");
    expect(session.user.email).toBe("admin@pkkmb.ac.id");

    expect(getAdminSession()?.user.email).toBe("admin@pkkmb.ac.id");

    clearAdminSession();
    expect(getAdminSession()).toBeNull();
  });

  it("should initialize default feedbacks and allow CRUD operations", () => {
    const list = getStoredFeedbacks();
    expect(list.length).toBeGreaterThan(0);

    const newFeedback = addStoredFeedback({
      name: "Test User",
      prodi: "Informatika",
      comment: "Acara sangat memuaskan dan berkesan!",
      sentiment: "positive",
      confidence: 0.95,
    });

    expect(newFeedback.id).toBeDefined();
    const afterAdd = getStoredFeedbacks();
    expect(afterAdd[0].id).toBe(newFeedback.id);

    deleteStoredFeedback(newFeedback.id);
    const afterDelete = getStoredFeedbacks();
    expect(afterDelete.find((f) => f.id === newFeedback.id)).toBeUndefined();

    deleteAllStoredFeedbacks();
    expect(getStoredFeedbacks().length).toBeGreaterThan(0); // auto re-seeds if empty
  });
});

describe("Gemini & Sentiment Analysis Service", () => {
  it("should classify positive sentiment correctly", () => {
    const res = analyzeSentimentLocally("Kegiatan PKKMB sangat seru, informatif, dan kakak panitianya ramah sekali!");
    expect(res.sentiment).toBe("positive");
    expect(res.confidence).toBeGreaterThan(0.7);
    expect(res.reasoning).toBeTruthy();
  });

  it("should classify negative sentiment correctly", () => {
    const res = analyzeSentimentLocally("Acaranya membosankan, sound system rusak dan rundown molor sekali.");
    expect(res.sentiment).toBe("negative");
    expect(res.confidence).toBeGreaterThan(0.7);
    expect(res.reasoning).toBeTruthy();
  });

  it("should classify neutral sentiment correctly", () => {
    const res = analyzeSentimentLocally("Informasi mengenai jadwal orientasi kampus telah dibagikan.");
    expect(res.sentiment).toBe("neutral");
  });

  // ── Bahasa Gaul / Slang ──

  it("should detect positive slang: mantul, kece, gokil", () => {
    const res = analyzeSentimentLocally("Acaranya mantul kece abis, kakak panitianya gokil seru bgt!");
    expect(res.sentiment).toBe("positive");
  });

  it("should detect positive slang: josss, gaskeun, sabi", () => {
    const res = analyzeSentimentLocally("Josss gaskeun sabi banget nih PKKMB nya, sat set beres semua.");
    expect(res.sentiment).toBe("positive");
  });

  it("should detect negative slang: zonk, bete, males", () => {
    const res = analyzeSentimentLocally("Zonk bete banget acaranya, males ikut karena garing ngebosenin.");
    expect(res.sentiment).toBe("negative");
  });

  it("should detect negative slang: cringe, ambyar, bikin males", () => {
    const res = analyzeSentimentLocally("Cringe parah sih ice breaking nya, ambyar bikin males semua.");
    expect(res.sentiment).toBe("negative");
  });

  it("should detect negative slang: capek bgt, nyiksa, buang waktu", () => {
    const res = analyzeSentimentLocally("Capek bgt nyiksa banget, buang waktu doang acara ini.");
    expect(res.sentiment).toBe("negative");
  });

  // ── Bahasa Campuran Indo-English ──

  it("should detect positive mixed: good vibes, so fun, amazing", () => {
    const res = analyzeSentimentLocally("Good vibes banget PKKMB nya, so fun and amazing experience!");
    expect(res.sentiment).toBe("positive");
  });

  it("should detect positive mixed: worth it, well organized", () => {
    const res = analyzeSentimentLocally("Totally worth it, well organized dan super helpful kakak mentornya.");
    expect(res.sentiment).toBe("positive");
  });

  it("should detect negative mixed: so boring, waste of time", () => {
    const res = analyzeSentimentLocally("So boring, literally waste of time dan bikin exhausted.");
    expect(res.sentiment).toBe("negative");
  });

  it("should detect negative mixed: not worth it, disappointing", () => {
    const res = analyzeSentimentLocally("Not worth it sih, disappointing dan unprofessional banget panitia nya.");
    expect(res.sentiment).toBe("negative");
  });

  // ── Negasi Gaul ──

  it("should handle gaul negation: gak seru, ga bagus", () => {
    const res = analyzeSentimentLocally("Gak seru ga bagus acaranya, nggak menarik sama sekali.");
    expect(res.sentiment).toBe("negative");
  });

  it("should handle negated negative (double negation becomes positive-ish)", () => {
    const res = analyzeSentimentLocally("Ternyata gak jelek juga sih, lumayan bagus mantap.");
    expect(res.sentiment).toBe("positive");
  });

  // ── Singkatan & Typo ──

  it("should detect positive abbreviations: makasih, sipp, mantep", () => {
    const res = analyzeSentimentLocally("Makasih bgt kakak panitia, sipp mantep acaranya!");
    expect(res.sentiment).toBe("positive");
  });

  it("should generate structured recommendations", async () => {
    const res = await generateRecommendationWithGemini({
      comment: "Sound system di aula sering mati sehingga materi tidak terdengar.",
      sentiment: "negative",
      confidence: 0.88,
      prodi: "Teknik Elektro",
    });

    expect(res.text).toContain("RINGKASAN");
    expect(res.text).toContain("REKOMENDASI");
  });
});
