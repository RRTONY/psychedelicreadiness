import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IbogaCompassAssessment } from "@/components/pri/iboga-compass-assessment";
import {
  DIMENSION_LABELS,
  getInitialRankOrder,
  scoreAllFacilities,
  type CompassAnswers,
} from "@/lib/content/pri-iboga-compass-engine";


type User = ReturnType<typeof userEvent.setup>;
const option = (name: string) => screen.getByRole("button", { name });
const next = () => screen.getByRole("button", { name: /^(next|rank priorities)$/i });

// The answers this walk-through gives, as the engine sees them.
const ANSWERS: CompassAnswers = { Q1: 1, Q2: 3, Q3: [2], Q4: 0, Q9: 0 };

async function answerAndRank(user: User) {
  await user.click(option("PTSD, trauma, or treatment-resistant depression"));
  await user.click(option("No rush — finding the right fit matters most"));
  await user.click(option("Alcohol"));
  await user.click(option("Nicotine"));
  await user.click(option("Nicotine")); // multi-select toggles off again
  await user.click(next());
  await user.click(option("No known cardiac issues"));
  await user.click(option("No"));
  for (let i = 0; i < 6; i++) await user.click(next());
  expect(screen.getByRole("heading", { name: "Priority Rank" })).toBeInTheDocument();
}

const rankLabels = () => screen.getAllByRole("button", { name: /^Move .* up$/ }).map((b) => b.closest("[draggable]")!.querySelector(".flex-1")!.textContent);

describe("IbogaCompassAssessment", () => {
  it("tracks section and progress, and Previous/Next move between sections", async () => {
    const user = userEvent.setup();
    render(<IbogaCompassAssessment />);
    expect(screen.getByText("Section 1 of 7")).toBeInTheDocument();
    expect(screen.getByText("0% complete")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    await user.click(option("Alcohol"));
    expect(screen.getByText("4% complete")).toBeInTheDocument();
    await user.click(next());
    expect(screen.getByRole("heading", { name: "Medical Safety" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(screen.getByRole("heading", { name: "What You're Seeking" })).toBeInTheDocument();
  });

  it("warns on significant cardiac history and on pregnancy", async () => {
    const user = userEvent.setup();
    render(<IbogaCompassAssessment />);
    await user.click(next());
    expect(screen.queryByText(/only the highest-safety facilities/)).not.toBeInTheDocument();
    await user.click(option("Significant — arrhythmia, prolonged QT, prior cardiac event"));
    expect(screen.getByText(/only the highest-safety facilities/)).toBeInTheDocument();
    await user.click(option("Yes — pregnant"));
    expect(screen.getByText(/absolutely contraindicated during pregnancy/)).toBeInTheDocument();
  });

  it("pre-ranks priorities from the answers; arrows reorder them", async () => {
    const user = userEvent.setup();
    render(<IbogaCompassAssessment />);
    await answerAndRank(user);
    const order = getInitialRankOrder(ANSWERS);
    expect(rankLabels()).toEqual(order.map((k) => DIMENSION_LABELS[k]));
    expect(screen.getAllByRole("button", { name: /^Move .* up$/ })[0]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: /^Move .* down$/ }).at(-1)).toBeDisabled();
    await user.click(screen.getAllByRole("button", { name: /^Move .* down$/ })[0]);
    expect(rankLabels().slice(0, 2)).toEqual([DIMENSION_LABELS[order[1]], DIMENSION_LABELS[order[0]]]);
    await user.click(screen.getByRole("button", { name: /back to questions/i }));
    expect(screen.getByText("Section 7 of 7")).toBeInTheDocument();
  });

  it("gates the matches behind name, email, situation and consent, then shows the engine's ranking", async () => {
    const user = userEvent.setup();
    render(<IbogaCompassAssessment />);
    await answerAndRank(user);
    const order = getInitialRankOrder(ANSWERS);
    await user.click(screen.getByRole("button", { name: /show my matches/i }));
    expect(screen.getByRole("heading", { name: "Your matches are ready." })).toBeInTheDocument();
    const submit = screen.getByRole("button", { name: /show my matches/i });
    expect(submit).toBeDisabled();
    await user.type(screen.getByPlaceholderText("Your full name"), "Ada");
    await user.type(screen.getByPlaceholderText("your@email.com"), "ada@example.com");
    await user.type(screen.getByPlaceholderText(/veteran with treatment-resistant ptsd/i), "PTSD help");
    expect(screen.getByText("9/200")).toBeInTheDocument();
    expect(submit).toBeDisabled();
    await user.click(screen.getByLabelText(/i consent to tony greenberg/i));
    expect(submit).toBeEnabled();
    vi.spyOn(console, "error").mockImplementation(() => {}); // jsdom can't open the mailto: link
    await user.click(submit);

    const expected = scoreAllFacilities(ANSWERS, order);
    const eligible = expected.filter((r) => !r.eliminated);
    expect(screen.getByRole("heading", { name: "Your Compass Results" })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`^${eligible.length} facilities matched your profile`))).toBeInTheDocument();
    const cards = screen.getAllByRole("heading", { level: 3 }).filter((h) => h.textContent !== `Filtered Out (${expected.length - eligible.length})`);
    expect(cards.slice(0, Math.min(5, eligible.length)).map((h) => h.textContent)).toEqual(eligible.slice(0, 5).map((r) => r.facility.name));
    expect(within(cards[0].closest(".p-6")!.parentElement!).getByText(`${eligible[0].matchPercent}%`)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /retake assessment/i })[0]);
    expect(screen.getByText("Section 1 of 7")).toBeInTheDocument();
    expect(screen.getByText("0% complete")).toBeInTheDocument();
  });

  it("filters out every facility for a pregnant user", async () => {
    const user = userEvent.setup();
    render(<IbogaCompassAssessment />);
    await user.click(next());
    await user.click(option("Yes — pregnant"));
    for (let i = 0; i < 6; i++) await user.click(next());
    await user.click(screen.getByRole("button", { name: /show my matches/i }));
    await user.type(screen.getByPlaceholderText("Your full name"), "A");
    await user.type(screen.getByPlaceholderText("your@email.com"), "a@b.co");
    await user.type(screen.getByPlaceholderText(/veteran/i), "x");
    await user.click(screen.getByLabelText(/i consent/i));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await user.click(screen.getByRole("button", { name: /show my matches/i }));
    expect(screen.getByRole("heading", { name: "No Facilities Match" })).toBeInTheDocument();
  });

  it("dragging a priority onto another's place reorders the ranking and its weights stay by position", async () => {
    const user = userEvent.setup();
    render(<IbogaCompassAssessment />);
    await answerAndRank(user);
    const order = getInitialRankOrder(ANSWERS);
    const rows = () => [...document.querySelectorAll<HTMLElement>("[draggable=true]")];
    const weights = () => rows().map((r) => r.querySelector(".font-mono.text-xs")!.textContent);
    const before = weights();
    expect(before[0]).toBe("2.0x");
    expect(before.at(-1)).toBe("0.5x");

    fireEvent.dragStart(rows()[3]);
    expect(rows()[3]).toHaveClass("border-brand-gold");
    fireEvent.dragOver(rows()[0]);
    const moved = [order[3], order[0], order[1], order[2], ...order.slice(4)];
    expect(rankLabels()).toEqual(moved.map((k) => DIMENSION_LABELS[k]));
    fireEvent.dragOver(rows()[0]); // over itself: no change
    expect(rankLabels()).toEqual(moved.map((k) => DIMENSION_LABELS[k]));
    fireEvent.dragEnd(rows()[0]);
    expect(rows().some((r) => r.classList.contains("border-brand-gold"))).toBe(false);
    fireEvent.dragOver(rows()[5]); // nothing picked up: no change
    expect(rankLabels()).toEqual(moved.map((k) => DIMENSION_LABELS[k]));
    // The weights belong to the position, not the dimension.
    expect(weights()).toEqual(before);

    // The results are scored with the dragged order.
    await user.click(screen.getByRole("button", { name: /show my matches/i }));
    await user.type(screen.getByPlaceholderText("Your full name"), "Ada");
    await user.type(screen.getByPlaceholderText("your@email.com"), "ada@example.com");
    await user.type(screen.getByPlaceholderText(/veteran/i), "x");
    await user.click(screen.getByLabelText(/i consent/i));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await user.click(screen.getByRole("button", { name: /show my matches/i }));
    const top = scoreAllFacilities(ANSWERS, moved).filter((r) => !r.eliminated)[0];
    expect(screen.getAllByRole("heading", { level: 3 })[0]).toHaveTextContent(top.facility.name);
  });

  it("the gate's name, email and situation fields each have a linked label", async () => {
    const user = userEvent.setup();
    render(<IbogaCompassAssessment />);
    for (let i = 0; i < 7; i++) await user.click(next());
    await user.click(screen.getByRole("button", { name: /show my matches/i }));
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what are you seeking/i)).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
