import { describe, expect, it } from "vitest";
import {
  formatDateShort,
  formatDateLong,
  formatBRL,
  isLate,
  formatHMS,
  formatHours,
  slugify,
  generateChave,
} from "./format";

describe("formatDateShort", () => {
  it("formats an ISO date as dd/mm", () => {
    expect(formatDateShort("2026-07-02")).toBe("02/07");
  });
  it("returns empty string for null/undefined", () => {
    expect(formatDateShort(null)).toBe("");
    expect(formatDateShort(undefined)).toBe("");
  });
});

describe("formatDateLong", () => {
  it("formats an ISO date as 'dd mmm' in Portuguese", () => {
    expect(formatDateLong("2026-07-02")).toBe("02 jul");
    expect(formatDateLong("2026-01-15")).toBe("15 jan");
    expect(formatDateLong("2026-12-31")).toBe("31 dez");
  });
});

describe("formatBRL", () => {
  it("formats currency with pt-BR thousands separator and no cents", () => {
    expect(formatBRL(8400)).toBe("R$ 8.400");
    expect(formatBRL(8400.6)).toBe("R$ 8.401");
    expect(formatBRL(0)).toBe("R$ 0");
  });
});

describe("isLate", () => {
  it("is true when the deadline is before the reference date", () => {
    expect(isLate("2026-06-01", "2026-07-02")).toBe(true);
  });
  it("is false when the deadline is today or in the future", () => {
    expect(isLate("2026-07-02", "2026-07-02")).toBe(false);
    expect(isLate("2026-08-01", "2026-07-02")).toBe(false);
  });
  it("is false when there is no deadline", () => {
    expect(isLate(null, "2026-07-02")).toBe(false);
    expect(isLate(undefined, "2026-07-02")).toBe(false);
  });
});

describe("formatHMS", () => {
  it("pads hours, minutes and seconds to two digits", () => {
    expect(formatHMS(0)).toBe("00:00:00");
    expect(formatHMS(65)).toBe("00:01:05");
    expect(formatHMS(3725)).toBe("01:02:05");
  });
  it("clamps negative input to zero instead of producing garbage", () => {
    expect(formatHMS(-5)).toBe("00:00:00");
  });
});

describe("formatHours", () => {
  it("formats with a comma decimal and trailing h", () => {
    expect(formatHours(4.25)).toBe("4,3h");
    expect(formatHours(0)).toBe("0,0h");
  });
});

describe("slugify", () => {
  it("strips accents and non-alphanumerics", () => {
    expect(slugify("Clínica Vitalle")).toBe("clinica-vitalle");
    expect(slugify("  São Paulo!! ")).toBe("sao-paulo");
  });
});

describe("generateChave", () => {
  it("produces an uppercase XXXXXXXX-XXXXXXXX token", () => {
    const chave = generateChave();
    expect(chave).toMatch(/^[A-F0-9]{8}-[A-F0-9]{8}$/);
  });
  it("is not deterministic across calls", () => {
    expect(generateChave()).not.toBe(generateChave());
  });
});
