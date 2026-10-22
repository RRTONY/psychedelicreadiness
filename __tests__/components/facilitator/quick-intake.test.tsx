import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickIntake } from "@/components/facilitator/quick-intake";
import { submitFacilitatorIndex } from "@/app/forms/actions";
import { QUICK_QUESTIONS, deriveArchetype } from "@/lib/content/facilitator-index-data";

vi.mock("@/app/forms/actions", () => ({ submitFacilitatorIndex: vi.fn() }));
const submit = vi.mocked(submitFacilitatorIndex);

// Threshold Keeper: high philosophy (q3, q4 high; q5, q6 low), spirit-centred (q11 <= 5), map not structured.
const THRESHOLD: Record<string, number> = { q3: 10, q4: 10, q5: 1, q6: 1 };

async function answerAll(user: ReturnType<typeof userEvent.setup>, answers: Record<string, number> = {}) {
  await user.click(screen.getByRole("button", { name: /discover my archetype/i }));
  for (const q of QUICK_QUESTIONS) {
    expect(screen.getByText(q.q)).toBeInTheDocument();
    if (answers[q.id] !== undefined) fireEvent.change(screen.getByRole("slider"), { target: { value: String(answers[q.id]) } });
    await user.click(screen.getByRole("button", { name: /next|reveal my archetype/i }));
  }
  expect(await screen.findByText("Your Practitioner Archetype", {}, { timeout: 3000 })).toBeInTheDocument();
}

describe("QuickIntake", () => {
  beforeEach(() => {
    submit.mockResolvedValue({ ok: true });
  });

  it("starts on the intro and can skip straight to the full index", async () => {
    const onGoDeeper = vi.fn();
    const user = userEvent.setup();
    render(<QuickIntake onGoDeeper={onGoDeeper} />);
    expect(screen.getByRole("heading", { name: "Know Who You Go With" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /skip to full 108-item index/i }));
    expect(onGoDeeper).toHaveBeenCalled();
  });

  it("shows progress, keeps the answer when going back, and disables Back on the first question", async () => {
    const user = userEvent.setup();
    render(<QuickIntake onGoDeeper={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /discover my archetype/i }));
    expect(screen.getByText(`1 / ${QUICK_QUESTIONS.length}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
    expect(screen.getByRole("slider")).toHaveValue("5");
    fireEvent.change(screen.getByRole("slider"), { target: { value: "8" } });
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(`2 / ${QUICK_QUESTIONS.length}`)).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("5");
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText(QUICK_QUESTIONS[0].q)).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("8");
  });

  it("all-middle answers give the Integrative Guide, matching deriveArchetype", async () => {
    expect(deriveArchetype({}).title).toBe("The Integrative Guide");
    const user = userEvent.setup();
    render(<QuickIntake onGoDeeper={vi.fn()} />);
    await answerAll(user);
    expect(screen.getByRole("heading", { level: 2, name: "The Integrative Guide" })).toBeInTheDocument();
    expect(screen.getByText("Philosophy").nextElementSibling).toHaveTextContent("5/10");
  });

  it("philosophical, spirit-centred answers give the Threshold Keeper and log the answers", async () => {
    expect(deriveArchetype(THRESHOLD).title).toBe("The Threshold Keeper");
    const user = userEvent.setup();
    render(<QuickIntake onGoDeeper={vi.fn()} />);
    await answerAll(user, THRESHOLD);
    expect(screen.getByRole("heading", { level: 2, name: "The Threshold Keeper" })).toBeInTheDocument();
    expect(screen.getByText("Philosophy").nextElementSibling).toHaveTextContent("10/10");

    await user.click(screen.getByRole("button", { name: /log my responses/i }));
    await user.type(screen.getByPlaceholderText(/cedar-001/i), "CEDAR-9");
    await user.click(screen.getByRole("button", { name: /submit & log/i }));
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    const sent = submit.mock.calls[0][0];
    expect(sent).toMatchObject({ kind: "quick", codedIdentity: "CEDAR-9", archetype: "The Threshold Keeper", referralConsent: false, referralContact: "" });
    expect(sent.responses).toContain(`Philosophy — ${QUICK_QUESTIONS[2].q}: 10/10`);
    expect(sent.responses).toContain(`${QUICK_QUESTIONS[0].q}: 5/10`);
    expect(await screen.findByRole("heading", { name: "You're in the record." })).toBeInTheDocument();
  });

  it("a contact counts as referral consent; failure offers the email fallback", async () => {
    submit.mockResolvedValue({ ok: false, error: "Saving is down." });
    const user = userEvent.setup();
    render(<QuickIntake onGoDeeper={vi.fn()} />);
    await answerAll(user);
    await user.click(screen.getByRole("button", { name: /log my responses/i }));
    await user.type(screen.getByPlaceholderText(/email or signal/i), "signal:me");
    await user.click(screen.getByRole("button", { name: /submit & log/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Saving is down.");
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ referralConsent: true, referralContact: "signal:me" }));
    const href = decodeURIComponent(screen.getByRole("link", { name: /email tony directly/i }).getAttribute("href")!);
    expect(href).toContain("Archetype: The Integrative Guide");
    expect(href).toContain("Contact for introduction: signal:me");
    await user.click(screen.getByRole("button", { name: /back to my profile/i }));
    expect(screen.getByText("Your Practitioner Archetype")).toBeInTheDocument();
  });

  it("shows a spinner while logging", async () => {
    let resolve!: (v: { ok: boolean }) => void;
    submit.mockReturnValue(new Promise((r) => (resolve = r)));
    const user = userEvent.setup();
    render(<QuickIntake onGoDeeper={vi.fn()} />);
    await answerAll(user);
    await user.click(screen.getByRole("button", { name: /log my responses/i }));
    await user.click(screen.getByRole("button", { name: /submit & log/i }));
    const button = screen.getByRole("button", { name: /submit & log/i });
    expect(button).toBeDisabled();
    expect(button.querySelector(".animate-spin")).not.toBeNull();
    resolve({ ok: true });
    expect(await screen.findByRole("heading", { name: "You're in the record." })).toBeInTheDocument();
  });

  it("the optional name/code and contact fields have labels linked to them", async () => {
    const user = userEvent.setup();
    render(<QuickIntake onGoDeeper={vi.fn()} />);
    await answerAll(user);
    await user.click(screen.getByRole("button", { name: /log my responses/i }));
    expect(screen.getByLabelText(/name or code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact for introduction/i)).toBeInTheDocument();
  });
});
