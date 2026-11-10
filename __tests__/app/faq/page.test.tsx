import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FaqPage, { metadata } from "@/app/faq/page";
import { FAQ } from "@/lib/content/faq";
import { CRISIS_RESOURCES } from "@/lib/content/pri-data";
import { ALL_PAGES } from "@/lib/site-nav";

describe("/faq", () => {
  it("has its own title, description, canonical and og:url, and is in the footer", () => {
    expect(metadata.title).toBe("FAQ — Psychedelic Readiness Index");
    expect(String(metadata.description).length).toBeLessThanOrEqual(160);
    expect(metadata.alternates?.canonical).toBe("/faq");
    expect(metadata.openGraph).toMatchObject({ url: "/faq" });
    expect(ALL_PAGES).toContain("/faq");
  });

  it("shows every question and answer, and the same list as FAQPage structured data", () => {
    const { container } = render(<FaqPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    for (const f of FAQ) {
      expect(screen.getByRole("heading", { level: 2, name: f.question })).toBeInTheDocument();
      expect(screen.getByText(f.answer)).toBeInTheDocument();
    }
    const ld = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(FAQ.length);
    expect(ld.mainEntity[0]).toEqual({ "@type": "Question", name: FAQ[0].question, acceptedAnswer: { "@type": "Answer", text: FAQ[0].answer } });
  });

  it("answers come from the approved text and the live crisis list", () => {
    expect(FAQ.find((f) => f.question === "Is this medical advice?")!.answer).toMatch(/not medical advice/);
    const crisis = FAQ.find((f) => f.question.startsWith("What if I need help"))!.answer;
    for (const r of CRISIS_RESOURCES) expect(crisis).toContain(r.contact);
  });
});
