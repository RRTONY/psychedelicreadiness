import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PsychedelicReadinessIndexPage, { metadata } from "@/app/page";
import { MEDICINES, QUESTIONS } from "@/lib/content/pri-data";

describe("/ (the Psychedelic Readiness Index)", () => {
  it("has its own title, description and canonical", () => {
    expect(metadata.title).toBe("Psychedelic Readiness Index — Find Your Medicine");
    expect(metadata.description).toMatch(/^39 plant medicines\. 50\+ readiness questions\. 6 domains\./);
    expect(metadata.alternates?.canonical).toBe("/");
  });

  it("renders one H1 and the disclaimer", () => {
    render(<PsychedelicReadinessIndexPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Find MyMedicine");
    expect(screen.getByText(/This is not medical advice\. Not a doctor\. Not Reddit\. Not gossip\./)).toBeInTheDocument();
  });

  it("lists the medicines and the interaction sections in the HTML", () => {
    const { container } = render(<PsychedelicReadinessIndexPage />);
    expect(screen.getByRole("heading", { level: 2, name: `${MEDICINES.length} Sacred Medicines` })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "MAO-B Interaction Matrix" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Medication Interaction Guide" })).toBeInTheDocument();
    expect(container.textContent).toContain("Psilocybin Mushrooms");
    expect(container.textContent).toContain("Ayahuasca");
  });

  it("starts the assessment and moves through questions with Next and Back", async () => {
    const user = userEvent.setup();
    render(<PsychedelicReadinessIndexPage />);
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

  it("links to the medicines anchor, the philosophy and ImpactSoul", () => {
    render(<PsychedelicReadinessIndexPage />);
    expect(screen.getByRole("link", { name: /Explore Medicines/ })).toHaveAttribute("href", "#medicines");
    expect(screen.getByRole("link", { name: /Read the full philosophy/ })).toHaveAttribute("href", "https://tonygreenberg.com/the-philosophy");
    expect(screen.getByRole("link", { name: /Get Your ImpactSoul Score/ })).toHaveAttribute("href", "https://impactsoul.is");
  });
});
