import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PsychedelicReadinessIndexPage, { metadata } from "@/app/page";
import { MEDICINES, QUESTIONS } from "@/lib/content/pri-data";
import { SAFETY_DATA } from "@/lib/content/pri-safety-data";

describe("/ (the Psychedelic Readiness Index)", () => {
  it("makes the assessment available from the ibogaine link", async () => {
    render(await PsychedelicReadinessIndexPage({ searchParams: Promise.resolve({ m: "ibogaine" }) }));
    expect(screen.queryByRole("heading", { name: "This assessment is temporarily unavailable" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Begin Assessment/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Find MyMedicine");
  });

  it("holds every medicine without reviewed safety data, also when it is one of several", async () => {
    const unreviewed = MEDICINES.filter((m) => !SAFETY_DATA[m.id]);
    expect(unreviewed).toHaveLength(14);
    for (const medicine of unreviewed) {
      const { unmount } = render(await PsychedelicReadinessIndexPage({ searchParams: Promise.resolve({ m: ["psilocybin", medicine.id] }) }));
      expect(screen.getByRole("heading", { name: "This assessment is temporarily unavailable" })).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`The ${medicine.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} readiness assessment is paused`))).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Begin Assessment/ })).not.toBeInTheDocument();
      unmount();
    }
  });

  it("does not hold a reviewed medicine link", async () => {
    render(await PsychedelicReadinessIndexPage({ searchParams: Promise.resolve({ m: "psilocybin" }) }));
    expect(screen.queryByRole("heading", { name: "This assessment is temporarily unavailable" })).not.toBeInTheDocument();
  });
  it("has its own title, description and canonical", () => {
    expect(metadata.title).toBe("Psychedelic Readiness Index — Find Your Medicine");
    expect(metadata.description).toMatch(/^39 substances\. 50\+ readiness questions\. 6 domains\./);
    expect(metadata.openGraph).toMatchObject({ url: "/", siteName: "Psychedelic Readiness Index", type: "website" });
    expect(metadata.alternates?.canonical).toBe("/");
  });

  it("renders one H1 and the disclaimer", async () => {
    render(await PsychedelicReadinessIndexPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Find MyMedicine");
    expect(screen.getByText(/This is not medical advice\. Not a doctor\. Not Reddit\. Not gossip\./)).toBeInTheDocument();
  });

  it("lists the medicines and the interaction sections in the HTML", async () => {
    const { container } = render(await PsychedelicReadinessIndexPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { level: 2, name: `${MEDICINES.length} Substances` })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "MAO-B Interaction Matrix" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Medication Interaction Guide" })).toBeInTheDocument();
    expect(container.textContent).toContain("Psilocybin Mushrooms");
    expect(container.textContent).toContain("Ayahuasca");
  });

  it("starts the assessment and moves through questions with Next and Back", async () => {
    const user = userEvent.setup();
    render(await PsychedelicReadinessIndexPage({ searchParams: Promise.resolve({}) }));
    await user.click(screen.getAllByRole("button", { name: /Begin Assessment/ })[0]);

    expect(screen.getByText(`1 / ${QUESTIONS.length}`)).toBeInTheDocument();
    expect(screen.getByText(QUESTIONS[0].text)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back/ })).toBeDisabled();

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "9" } });
    expect(screen.getByText("9/10")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Next/ }));
    expect(screen.getByText(`2 / ${QUESTIONS.length}`)).toBeInTheDocument();
    expect(screen.getByText(QUESTIONS[1].text)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Back/ }));
    expect(screen.getByText(`1 / ${QUESTIONS.length}`)).toBeInTheDocument();
    expect(screen.getByText("9/10")).toBeInTheDocument();
  });

  it("links to the medicines anchor, the philosophy and ImpactSoul", async () => {
    render(await PsychedelicReadinessIndexPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("link", { name: /Explore Medicines/ })).toHaveAttribute("href", "#medicines");
    expect(screen.getByRole("link", { name: /Read the full philosophy/ })).toHaveAttribute("href", "https://tonygreenberg.com/the-philosophy");
    expect(screen.getByRole("link", { name: /Get Your ImpactSoul Score/ })).toHaveAttribute("href", "https://impactsoul.is");
  });
});
