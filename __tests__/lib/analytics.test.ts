import { afterEach, describe, expect, it, vi } from "vitest";
import { readMeasurementId } from "@/lib/analytics";

describe("analytics switch", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("accepts only a real GA4 measurement id", () => {
    expect(readMeasurementId("G-4GVW40S47N")).toBe("G-4GVW40S47N");
    expect(readMeasurementId("  G-ABC123  ")).toBe("G-ABC123");
    expect(readMeasurementId(undefined)).toBe("");
    expect(readMeasurementId("")).toBe("");
    expect(readMeasurementId("UA-12345-1")).toBe("");
    expect(readMeasurementId('G-ABC");alert(1);//')).toBe("");
  });

  it("is off when the env var is unset, on when it holds an id", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
    expect((await import("@/lib/analytics")).ANALYTICS_ON).toBe(false);
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST1234");
    const on = await import("@/lib/analytics");
    expect(on.ANALYTICS_ON).toBe(true);
    expect(on.GA_MEASUREMENT_ID).toBe("G-TEST1234");
  });
});
