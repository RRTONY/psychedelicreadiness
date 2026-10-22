import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DisclaimerGate } from "@/components/pri/disclaimer-gate";
import { submitPriConsent } from "@/app/forms/actions";

vi.mock("@/app/forms/actions", () => ({ submitPriConsent: vi.fn() }));
const submit = vi.mocked(submitPriConsent);
let networkDown = false;

const proceed = () => screen.getByRole("button", { name: /i understand/i });
const initialsBox = () => screen.getByPlaceholderText("e.g. TG");

describe("DisclaimerGate", () => {
  beforeEach(() => {
    networkDown = false;
    submit.mockImplementation(async () => {
      if (networkDown) throw new Error("down");
      return { ok: true };
    });
  });

  it("needs the box ticked and at least two initials before going on", async () => {
    const user = userEvent.setup();
    render(<DisclaimerGate onConsent={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Before You Go In" })).toBeInTheDocument();
    expect(proceed()).toBeDisabled();
    await user.type(initialsBox(), "t");
    await user.click(screen.getByRole("checkbox"));
    expect(proceed()).toBeDisabled();
    await user.type(initialsBox(), "g");
    expect(proceed()).toBeEnabled();
  });

  it("upper-cases and caps the initials at five letters", async () => {
    const user = userEvent.setup();
    render(<DisclaimerGate onConsent={vi.fn()} />);
    await user.type(initialsBox(), "abcdefg");
    expect(initialsBox()).toHaveValue("ABCDE");
  });

  it("saves the initials, remembers consent for the session and lets them in", async () => {
    const onConsent = vi.fn();
    const user = userEvent.setup();
    render(<DisclaimerGate onConsent={onConsent} />);
    await user.click(screen.getByRole("checkbox"));
    await user.type(initialsBox(), "tg");
    await user.click(proceed());
    await waitFor(() => expect(onConsent).toHaveBeenCalled());
    expect(submit).toHaveBeenCalledWith({ initials: "TG" });
    expect(sessionStorage.getItem("pri-consent")).toBe("true");
  });

  it("shows a spinner while saving", async () => {
    let resolve!: (v: { ok: boolean }) => void;
    submit.mockReturnValue(new Promise((r) => (resolve = r)));
    const user = userEvent.setup();
    render(<DisclaimerGate onConsent={vi.fn()} />);
    await user.click(screen.getByRole("checkbox"));
    await user.type(initialsBox(), "tg");
    await user.click(proceed());
    expect(proceed()).toBeDisabled();
    expect(proceed().querySelector(".animate-spin")).not.toBeNull();
    resolve({ ok: true });
  });

  it("still lets them in when saving fails", async () => {
    networkDown = true;
    const onConsent = vi.fn();
    const user = userEvent.setup();
    render(<DisclaimerGate onConsent={onConsent} />);
    await user.click(screen.getByRole("checkbox"));
    await user.type(initialsBox(), "tg");
    await user.click(proceed());
    await waitFor(() => expect(onConsent).toHaveBeenCalled());
  });

  it("the initials field has a label linked to it", () => {
    render(<DisclaimerGate onConsent={vi.fn()} />);
    expect(screen.getByLabelText(/type your initials/i)).toBeInTheDocument();
  });
});
