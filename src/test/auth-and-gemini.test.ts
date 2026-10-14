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
