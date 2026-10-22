import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PeyoteMescalinePage, { metadata } from "@/app/peyote-mescaline/page";

describe("/peyote-mescaline", () => {
  it("has its own title, description and canonical", () => {
    expect(metadata.title).toBe("Mescaline / Peyote Deep Dive — Psychedelic Readiness Index");
    expect(metadata.description).toMatch(/pharma-to-plant alternatives, supplement stacks/);
    expect(metadata.alternates?.canonical).toBe("/peyote-mescaline");
  });

  it("renders one H1 and the not-medical-advice warning up top", () => {
    render(<PeyoteMescalinePage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mescaline /Peyote");
    expect(screen.getAllByText(/NOT MEDICAL ADVICE\. For educational purposes only\./).length).toBeGreaterThan(0);
  });

  it("shows the pharmacology and the Latuda comparison", () => {
    const { container } = render(<PeyoteMescalinePage />);
    for (const h of ["Key Receptors", "Same Targets. Opposite Actions.", "Clinical Outcomes", "Research & References"]) {
      expect(screen.getByRole("heading", { level: 2, name: h })).toBeInTheDocument();
    }
    expect(container.textContent).toContain("mescaline has no serotonin transporter (SERT) affinity");
    expect(container.textContent).toContain("Latuda (lurasidone) and mescaline share the same receptor targets");
  });

  it("links back to the PRI and to the pharmacology anchor", () => {
    const { container } = render(<PeyoteMescalinePage />);
    for (const a of screen.getAllByRole("link", { name: /Back to PRI/ })) {
      expect(a).toHaveAttribute("href", "/");
    }
    expect(screen.getByRole("link", { name: /Explore Pharmacology/ })).toHaveAttribute("href", "#pharmacology");
    expect(container.querySelector("#pharmacology")).not.toBeNull();
  });

  it("points the supplement stack's buy links at Amazon searches", () => {
    render(<PeyoteMescalinePage />);
    const buys = screen.getAllByRole("link", { name: /^Buy/ });
    expect(buys.length).toBeGreaterThan(5);
    for (const a of buys) expect(a.getAttribute("href")).toMatch(/^https:\/\/amazon\.com\/s\?k=/);
  });
});
