import { describe, expect, it } from "vitest";
import { diffParts } from "./dates";

describe("diffParts", () => {
  it("memecah selisih menjadi hari/jam/menit/detik", () => {
    const now = new Date(0);
    const target = new Date((24 * 3600 + 3600 + 60 + 1) * 1000);
    const out = diffParts(target, now);
    expect(out.days).toBe(1);
    expect(out.hours).toBe(1);
    expect(out.minutes).toBe(1);
    expect(out.seconds).toBe(1);
  });

  it("tidak mengembalikan totalMs negatif", () => {
    const now = new Date(10_000);
    const target = new Date(0);
    const out = diffParts(target, now);
    expect(out.totalMs).toBe(0);
  });
});

