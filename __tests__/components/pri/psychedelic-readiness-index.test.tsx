import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import userEvent from "@testing-library/user-event";
import { PsychedelicReadinessIndex } from "@/components/pri/psychedelic-readiness-index";
import { submitPriConsent } from "@/app/forms/actions";
import { DIM_LABELS, MEDICINES, PATHWAY_QUESTIONS, QUESTIONS, SLIDER_LABELS, type DimKey } from "@/lib/content/pri-data";
import { computeScores } from "@/lib/content/pri-shared";

vi.mock("@/app/forms/actions", () => ({ submitPriConsent: vi.fn(), submitPriCorrection: vi.fn() }));

type User = ReturnType<typeof userEvent.setup>;
const button = (name: string | RegExp) => screen.getByRole("button", { name });
// A medicine card is clicked through its own button ("Open X", "Compare X",
// "Open X: match #1"), the way a keyboard or screen-reader user reaches it.
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const card = (name: string) => screen.getAllByRole("button", { name: new RegExp(`^(Open|Compare) ${esc(name)}`) })[0];

async function startQuiz(user: User) {
  await user.click(button(/see where you actually stand/i));
  await user.click(button(new RegExp(`begin ${QUESTIONS.length}-question assessment`, "i")));
}

// Answers every readiness question (value per question index) and every pathway question.
// fireEvent rather than userEvent for the 60-odd slider steps: this page is
// large, and userEvent's per-click pointer simulation makes the walk-through slow.
async function finishQuiz(value: (i: number) => number) {
  for (let i = 0; i < QUESTIONS.length; i++) {
    expect(screen.getByText(`${i + 1} / ${QUESTIONS.length}`)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider"), { target: { value: String(value(i)) } });
    fireEvent.click(button(i === QUESTIONS.length - 1 ? /a few more questions/i : /^next$/i));
  }
  expect(screen.getByRole("heading", { name: "How You Want to Go" })).toBeInTheDocument();
  for (let i = 0; i < PATHWAY_QUESTIONS.length; i++) {
    fireEvent.click(button(i === PATHWAY_QUESTIONS.length - 1 ? /see my results/i : /^next$/i));
  }
}

async function consent(user: User) {
  await user.click(screen.getByRole("checkbox", { name: /yes, i read it/i }));
  fireEvent.change(screen.getByPlaceholderText("e.g. TG"), { target: { value: "tg" } });
  await user.click(button(/i understand/i));
}

// A large page: under a full parallel run the walk-throughs need extra time.
describe("PsychedelicReadinessIndex", { timeout: 120000 }, () => {
  beforeEach(() => {
    vi.mocked(submitPriConsent).mockResolvedValue({ ok: true });
  });

  it("shows every medicine and walks philosophy, intro, then the first question", async () => {
    const user = userEvent.setup();
    render(<PsychedelicReadinessIndex />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Find My\s*Medicine/);
    expect(screen.getByRole("heading", { name: `${MEDICINES.length} Sacred Medicines` })).toBeInTheDocument();
    await startQuiz(user);
    expect(screen.getByText(QUESTIONS[0].text)).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("5");
    expect(button(/back/i)).toBeDisabled();
  });

  it("labels the slider value and keeps answers when going back", async () => {
    const user = userEvent.setup();
    render(<PsychedelicReadinessIndex />);
    await startQuiz(user);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "10" } });
    expect(screen.getByText(`... ${SLIDER_LABELS[4]}`, { exact: false })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "1" } });
    expect(screen.getByText(`... ${SLIDER_LABELS[0]}`, { exact: false })).toBeInTheDocument();
    await user.click(button(/^next$/i));
    expect(screen.getByText(`2 / ${QUESTIONS.length}`)).toBeInTheDocument();
    await user.click(button(/back/i));
    expect(screen.getByRole("slider")).toHaveValue("1");
  });

  it("asks for consent before the results, then scores exactly as computeScores does", async () => {
    const user = userEvent.setup();
    render(<PsychedelicReadinessIndex />);
    await startQuiz(user);
    const value = (i: number) => (i % 3 === 0 ? 9 : i % 3 === 1 ? 6 : 3);
    await finishQuiz(value);
    expect(screen.getByRole("heading", { name: "Before You Go In" })).toBeInTheDocument();
    await consent(user);

    const expected = computeScores(QUESTIONS.map((_, i) => value(i)));
    expect(await screen.findByText(expected.level.label, {}, { timeout: 15000 })).toBeInTheDocument();
    expect(screen.getByText(String(expected.overall), { selector: "div" })).toBeInTheDocument();
    for (const d of Object.keys(expected.dimScores) as DimKey[]) {
      const cell = screen.getAllByText(DIM_LABELS[d]).map((el) => el.parentElement!).find((el) => el.textContent?.includes("/100"));
      expect(cell).toHaveTextContent(`${expected.dimScores[d]}/100`);
    }
    for (const m of expected.topMatches) expect(screen.getAllByText(m.name).length).toBeGreaterThan(0);
    for (const s of expected.sequence) expect(screen.getAllByText(s.name).length).toBeGreaterThan(0);
    expect(sessionStorage.getItem("pri-consent")).toBe("true");
  });

  it("skips the gate once consented, gives the top level for all-10 answers, and Retake resets", async () => {
    sessionStorage.setItem("pri-consent", "true");
    const user = userEvent.setup();
    render(<PsychedelicReadinessIndex />);
    await startQuiz(user);
    await finishQuiz(() => 10);
    expect(screen.queryByRole("heading", { name: "Before You Go In" })).not.toBeInTheDocument();
    expect(screen.getByText("Ready to Go Deep")).toBeInTheDocument();
    expect(computeScores(QUESTIONS.map(() => 10)).overall).toBe(100);
    await user.click(button(/retake assessment/i));
    expect(screen.getByRole("heading", { name: "Your Readiness Assessment" })).toBeInTheDocument();
    await user.click(button(/begin \d+-question assessment/i));
    expect(screen.getByRole("slider")).toHaveValue("5");
    expect(screen.getByText(`1 / ${QUESTIONS.length}`)).toBeInTheDocument();
  });

  it("Back on the first pathway question returns to the last readiness question", async () => {
    const user = userEvent.setup();
    render(<PsychedelicReadinessIndex />);
    await startQuiz(user);
    for (let i = 0; i < QUESTIONS.length; i++) fireEvent.click(button(i === QUESTIONS.length - 1 ? /a few more questions/i : /^next$/i));
    await user.click(button(/back/i));
    expect(screen.getByText(`${QUESTIONS.length} / ${QUESTIONS.length}`)).toBeInTheDocument();
  });

  it("opening a medicine before consenting shows the gate, then opens that medicine", async () => {
    const user = userEvent.setup();
    const m = MEDICINES.find((x) => x.id === "sananga")!;
    render(<PsychedelicReadinessIndex />);
    await user.click(card(m.name));
    expect(screen.getByRole("heading", { name: "Before You Go In" })).toBeInTheDocument();
    await consent(user);
    // The modal is loaded with next/dynamic, so allow it time to arrive.
    expect(await screen.findByText(m.latin, {}, { timeout: 15000 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Suggest Correction" })).toBeInTheDocument();
  });

  it("saves medicines to a shortlist kept in localStorage", async () => {
    const user = userEvent.setup();
    render(<PsychedelicReadinessIndex />);
    await user.click(screen.getAllByTitle("Save medicine")[0]);
    expect(JSON.parse(localStorage.getItem("pri-saved-medicines")!)).toEqual([MEDICINES[0].id]);
    expect(screen.getByRole("heading", { name: /my saved medicines \(1\)/i })).toBeInTheDocument();
    await user.click(screen.getAllByTitle("Remove from saved")[0]);
    expect(JSON.parse(localStorage.getItem("pri-saved-medicines")!)).toEqual([]);
    expect(screen.queryByRole("heading", { name: /my saved medicines/i })).not.toBeInTheDocument();
  });

  it("compare mode picks up to three medicines and shows them side by side", async () => {
    const user = userEvent.setup();
    render(<PsychedelicReadinessIndex />);
    await user.click(button("Compare Medicines"));
    expect(screen.queryAllByTitle("Save medicine")).toHaveLength(0);
    const pick = (i: number) => user.click(card(MEDICINES[i].name));
    await pick(0);
    expect(screen.getByText("Select 1 more medicine to compare")).toBeInTheDocument();
    await pick(1);
    expect(screen.getByRole("heading", { name: "Medicine Comparison" })).toBeInTheDocument();
    await pick(2);
    await pick(3);
    expect(button("Compare (3/3)")).toBeInTheDocument();
    await pick(0);
    expect(button("Compare (2/3)")).toBeInTheDocument();
    await user.click(button("Close"));
    expect(button("Compare Medicines")).toBeInTheDocument();
  });

  it("the referral request needs email and region, then confirms", async () => {
    sessionStorage.setItem("pri-consent", "true");
    vi.spyOn(console, "error").mockImplementation(() => {}); // jsdom can't open the mailto: link
    const user = userEvent.setup();
    render(<PsychedelicReadinessIndex />);
    await startQuiz(user);
    await finishQuiz(() => 5);
    await user.click(screen.getByRole("checkbox", { name: /connect me with a vetted facility/i }));
    const send = button(/send introduction request/i);
    expect(send).toBeDisabled();
    await user.type(screen.getByPlaceholderText("Your email"), "ada@example.com");
    expect(send).toBeDisabled();
    await user.type(screen.getByPlaceholderText(/your region/i), "London");
    expect(send).toBeEnabled();
    await user.click(send);
    await waitFor(() => expect(screen.getByText("Your email client should be open.")).toBeInTheDocument());
  });

  it("Back on a later pathway question goes to the previous one, and its slider shows the chosen value", async () => {
    const user = userEvent.setup();
    render(<PsychedelicReadinessIndex />);
    await startQuiz(user);
    for (let i = 0; i < QUESTIONS.length; i++) fireEvent.click(button(i === QUESTIONS.length - 1 ? /a few more questions/i : /^next$/i));
    expect(screen.getByText(PATHWAY_QUESTIONS[0].text)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "8" } });
    expect(screen.getByText("8/10")).toBeInTheDocument();
    fireEvent.click(button(/^next$/i));
    expect(screen.getByText(PATHWAY_QUESTIONS[1].text)).toBeInTheDocument();
    expect(screen.getByText("5/10")).toBeInTheDocument();
    await user.click(button(/back/i));
    expect(screen.getByText(PATHWAY_QUESTIONS[0].text)).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("8");
  });

  it("with consent given, a medicine card opens its details straight away and Close shuts them", async () => {
    sessionStorage.setItem("pri-consent", "true");
    const user = userEvent.setup();
    const m = MEDICINES.find((x) => x.id === "sananga")!;
    render(<PsychedelicReadinessIndex />);
    await user.click(card(m.name));
    expect(screen.queryByRole("heading", { name: "Before You Go In" })).not.toBeInTheDocument();
    expect(await screen.findByText(m.latin, {}, { timeout: 15000 })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByText(m.latin)).not.toBeInTheDocument());
  });

  describe("a ?m= deep link", () => {
    beforeEach(() => {
      window.history.pushState({}, "", "/psychedelic-readiness-index?m=sananga");
    });

    afterEach(() => {
      window.history.pushState({}, "", "/");
    });

    it("opens that medicine when consent was already given", async () => {
      sessionStorage.setItem("pri-consent", "true");
      const m = MEDICINES.find((x) => x.id === "sananga")!;
      render(<PsychedelicReadinessIndex />);
      expect(await screen.findByText(m.latin, {}, { timeout: 15000 })).toBeInTheDocument();
    });

    it("asks for consent first, then opens that medicine", async () => {
      const user = userEvent.setup();
      const m = MEDICINES.find((x) => x.id === "sananga")!;
      render(<PsychedelicReadinessIndex />);
      expect(screen.getByRole("heading", { name: "Before You Go In" })).toBeInTheDocument();
      expect(sessionStorage.getItem("pri-pending-medicine")).toBe("sananga");
      await consent(user);
      expect(await screen.findByText(m.latin, {}, { timeout: 15000 })).toBeInTheDocument();
      expect(sessionStorage.getItem("pri-pending-medicine")).toBeNull();
    });

    it("ignores an unknown medicine id", () => {
      window.history.pushState({}, "", "/psychedelic-readiness-index?m=not-a-medicine");
      render(<PsychedelicReadinessIndex />);
      expect(screen.queryByRole("heading", { name: "Before You Go In" })).not.toBeInTheDocument();
      expect(sessionStorage.getItem("pri-pending-medicine")).toBeNull();
    });
  });

  it("treats unreadable session storage as no consent", async () => {
    const real = Storage.prototype.getItem;
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key: string) {
      if (key === "pri-consent") throw new Error("blocked");
      return real.call(this, key);
    });
    const user = userEvent.setup();
    render(<PsychedelicReadinessIndex />);
    await user.click(card(MEDICINES[0].name));
    expect(screen.getByRole("heading", { name: "Before You Go In" })).toBeInTheDocument();
    vi.mocked(Storage.prototype.getItem).mockRestore();
  });

  it("renders on the server without consent or a shortlist", () => {
    localStorage.setItem("pri-saved-medicines", JSON.stringify([MEDICINES[0].id]));
    sessionStorage.setItem("pri-consent", "true");
    const html = renderToString(<PsychedelicReadinessIndex />);
    expect(html.replace(/<!-- -->/g, "")).toContain(`${MEDICINES.length} Sacred Medicines`);
    // The server snapshot is empty, so no shortlist is rendered even though the browser has one.
    expect(html).not.toContain("My Saved Medicines");
  });

  describe("the saved shortlist", () => {
    it("skips ids that aren't medicines and survives broken stored data", () => {
      localStorage.setItem("pri-saved-medicines", JSON.stringify(["not-a-medicine", MEDICINES[1].id]));
      const { unmount } = render(<PsychedelicReadinessIndex />);
      const panel = document.querySelector<HTMLElement>("[data-saved-panel]")!;
      expect(within(panel).getByText(MEDICINES[1].name)).toBeInTheDocument();
      expect(within(panel).getAllByTitle("Remove from saved")).toHaveLength(1);
      unmount();
      localStorage.setItem("pri-saved-medicines", "{not json");
      render(<PsychedelicReadinessIndex />);
      expect(screen.queryByRole("heading", { name: /my saved medicines/i })).not.toBeInTheDocument();
    });

    it("Clear All asks first and only clears on yes", async () => {
      localStorage.setItem("pri-saved-medicines", JSON.stringify([MEDICINES[0].id, MEDICINES[1].id]));
      const confirm = vi.fn(() => false);
      vi.stubGlobal("confirm", confirm);
      const user = userEvent.setup();
      render(<PsychedelicReadinessIndex />);
      expect(screen.getByRole("heading", { name: /my saved medicines \(2\)/i })).toBeInTheDocument();
      await user.click(button("Clear All"));
      expect(confirm).toHaveBeenCalledWith("Clear all saved medicines?");
      expect(screen.getByRole("heading", { name: /my saved medicines \(2\)/i })).toBeInTheDocument();
      confirm.mockReturnValue(true);
      await user.click(button("Clear All"));
      expect(screen.queryByRole("heading", { name: /my saved medicines/i })).not.toBeInTheDocument();
      expect(JSON.parse(localStorage.getItem("pri-saved-medicines")!)).toEqual([]);
    });

    it("a saved card opens the medicine, and its remove button only removes it", async () => {
      sessionStorage.setItem("pri-consent", "true");
      const [a, b] = [MEDICINES.find((x) => x.id === "sananga")!, MEDICINES.find((x) => x.id !== "sananga")!];
      localStorage.setItem("pri-saved-medicines", JSON.stringify([a.id, b.id]));
      const user = userEvent.setup();
      render(<PsychedelicReadinessIndex />);
      const panel = document.querySelector<HTMLElement>("[data-saved-panel]")!;
      await user.click(within(panel).getAllByTitle("Remove from saved")[1]);
      expect(JSON.parse(localStorage.getItem("pri-saved-medicines")!)).toEqual([a.id]);
      // Removing didn't open anything.
      expect(screen.queryByText(b.latin)).not.toBeInTheDocument();
      await user.click(within(panel).getByRole("button", { name: `Open ${a.name}` }));
      expect(await screen.findByText(a.latin, {}, { timeout: 15000 })).toBeInTheDocument();
    });
  });

  describe("compare mode", () => {
    const pick = (user: User, i: number) => user.click(card(MEDICINES[i].name));

    it("turning compare off from its button clears the selection", async () => {
      const user = userEvent.setup();
      render(<PsychedelicReadinessIndex />);
      await user.click(button("Compare Medicines"));
      await pick(user, 0);
      await user.click(button("Compare (1/3)"));
      await user.click(button("Compare Medicines"));
      expect(button("Compare (0/3)")).toBeInTheDocument();
    });

    it("Cancel on the floating bar leaves compare mode", async () => {
      const user = userEvent.setup();
      render(<PsychedelicReadinessIndex />);
      await user.click(button("Compare Medicines"));
      await pick(user, 0);
      await pick(user, 1);
      expect(screen.getByText("2 medicines selected")).toBeInTheDocument();
      await user.click(button("Cancel"));
      expect(screen.queryByRole("heading", { name: "Medicine Comparison" })).not.toBeInTheDocument();
      expect(button("Compare Medicines")).toBeInTheDocument();
    });

    it("Full Details leaves compare mode and opens that medicine", async () => {
      sessionStorage.setItem("pri-consent", "true");
      const user = userEvent.setup();
      render(<PsychedelicReadinessIndex />);
      await user.click(button("Compare Medicines"));
      await pick(user, 0);
      await pick(user, 1);
      await user.click(screen.getAllByRole("button", { name: "Full Details" })[1]);
      expect(screen.queryByRole("heading", { name: "Medicine Comparison" })).not.toBeInTheDocument();
      expect(await screen.findByText(MEDICINES[1].latin, {}, { timeout: 15000 })).toBeInTheDocument();
    });
  });

  describe("on the results", () => {
    beforeEach(() => {
      sessionStorage.setItem("pri-consent", "true");
    });

    // The report is a React component (<PriReport>), hidden on screen, that the print dialog prints.
    const report = () => document.querySelector("article")!;

    it("Save My Results renders the printable report of the scores, matches, sequence and shortlist, then prints", async () => {
      const saved = MEDICINES.find((x) => x.id === "sananga")!;
      localStorage.setItem("pri-saved-medicines", JSON.stringify([saved.id, "gone"]));
      let titleWhilePrinting = "";
      const print = vi.spyOn(window, "print").mockImplementation(() => {
        titleWhilePrinting = document.title;
      });
      const open = vi.spyOn(window, "open");
      document.title = "Page title";
      const user = userEvent.setup();
      render(<PsychedelicReadinessIndex />);
      await startQuiz(user);
      const value = (i: number) => (i % 2 ? 9 : 4);
      await finishQuiz(value);
      const expected = computeScores(QUESTIONS.map((_, i) => value(i)));
      expect(document.querySelector("article")).toBeNull();

      await user.click(button(/save my results/i));
      expect(print).toHaveBeenCalledTimes(1);
      expect(open).not.toHaveBeenCalled();
      expect(titleWhilePrinting).toBe("Psychedelic Readiness Index - Personal Report");
      expect(document.title).toBe("Page title");

      const r = within(report());
      expect(report()).toHaveClass("hidden", "print:block");
      expect(r.getByText(/Personal Report/)).toBeInTheDocument();
      for (const d of Object.keys(expected.dimScores) as DimKey[]) {
        expect(r.getByText(DIM_LABELS[d]).closest("tr")).toHaveTextContent(`${expected.dimScores[d]}/100`);
      }
      for (const m of expected.topMatches) expect(r.getByText(m.name).closest("tr")).toHaveTextContent(`${m.matchScore}%`);
      for (const st of expected.sequence) expect(r.getByText(st.name)).toBeInTheDocument();
      expect(r.getByRole("heading", { name: "My Saved Medicines" })).toBeInTheDocument();
      expect(r.getByText(saved.name)).toBeInTheDocument();
      expect(report()).toHaveTextContent("Generated at psychedelicreadiness.com");
    });

    it("the report has no shortlist without saved medicines", async () => {
      vi.spyOn(window, "print").mockImplementation(() => {});
      const user = userEvent.setup();
      render(<PsychedelicReadinessIndex />);
      await startQuiz(user);
      await finishQuiz(() => 5);
      await user.click(button(/save my results/i));
      expect(report()).not.toHaveTextContent("My Saved Medicines");
    });

    it("a top match opens its details, and View Saved scrolls to the shortlist", async () => {
      localStorage.setItem("pri-saved-medicines", JSON.stringify([MEDICINES[0].id]));
      const user = userEvent.setup();
      render(<PsychedelicReadinessIndex />);
      await startQuiz(user);
      await finishQuiz(() => 7);
      const expected = computeScores(QUESTIONS.map(() => 7));
      const scroll = vi.mocked(Element.prototype.scrollIntoView);
      scroll.mockClear();
      await user.click(button("View Saved (1)"));
      expect(scroll.mock.contexts.at(-1)).toBe(document.querySelector("[data-saved-panel]"));

      const top = expected.topMatches[0];
      await user.click(button(`Open ${top.name}: match #1`));
      expect(await screen.findByText(MEDICINES.find((x) => x.id === top.id)!.latin, {}, { timeout: 15000 })).toBeInTheDocument();
    });

    it("the referral form keeps the optional name", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const user = userEvent.setup();
      render(<PsychedelicReadinessIndex />);
      await startQuiz(user);
      await finishQuiz(() => 5);
      await user.click(screen.getByRole("checkbox", { name: /connect me with a vetted facility/i }));
      await user.type(screen.getByPlaceholderText("Your name"), "Ada");
      expect(screen.getByPlaceholderText("Your name")).toHaveValue("Ada");
    });
  });

  it("every medicine card is a real button keyboard users can reach", () => {
    render(<PsychedelicReadinessIndex />);
    expect(screen.getByRole("button", { name: `Open ${MEDICINES[0].name}` })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Open / })).toHaveLength(MEDICINES.length);
  });
});
