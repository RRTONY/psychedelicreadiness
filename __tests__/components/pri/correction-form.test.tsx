import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CorrectionForm } from "@/components/pri/correction-form";
import { submitPriCorrection } from "@/app/forms/actions";
import { MEDICINES } from "@/lib/content/pri-data";
import { getMedicineWithSafety } from "@/lib/content/pri-shared";

vi.mock("@/app/forms/actions", () => ({ submitPriCorrection: vi.fn() }));
const submit = vi.mocked(submitPriCorrection);
const medicine = getMedicineWithSafety(MEDICINES[0]);

let networkDown = false;
function renderForm() {
  const onClose = vi.fn();
  render(<CorrectionForm medicine={medicine} onClose={onClose} />);
  return { user: userEvent.setup(), onClose };
}
const submitButton = () => screen.getByRole("button", { name: /submit correction/i });

describe("CorrectionForm", () => {
  beforeEach(() => {
    networkDown = false;
    submit.mockImplementation(async () => {
      if (networkDown) throw new Error("network");
      return { ok: true };
    });
  });

  it("is titled for the medicine and keeps Submit disabled until a correction is typed", async () => {
    const { user } = renderForm();
    expect(screen.getByRole("heading", { name: `Suggest a Correction for ${medicine.name}` })).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
    await user.type(screen.getByLabelText(/your suggested correction/i), "Fix it");
    expect(submitButton()).toBeEnabled();
  });

  it("validates the source address and email, but accepts both empty", async () => {
    const { user } = renderForm();
    await user.type(screen.getByLabelText(/your suggested correction/i), "Dose range is wrong.");
    await user.type(screen.getByLabelText(/source/i), "pubmed.gov/123");
    await user.type(screen.getByLabelText(/^email/i), "nope");
    await user.click(submitButton());
    expect(await screen.findByText("Use a web address starting with http.")).toBeInTheDocument();
    expect(screen.getByText("That email address doesn't look right.")).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText(/source/i));
    await user.clear(screen.getByLabelText(/^email/i));
    await user.click(submitButton());
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  });

  it("sends the chosen section with its current text and shows the thank-you", async () => {
    const { user, onClose } = renderForm();
    await user.selectOptions(screen.getByLabelText(/which section/i), "legalStatus");
    await user.type(screen.getByLabelText(/your suggested correction/i), "Now legal in Oregon.");
    await user.type(screen.getByLabelText(/source/i), "https://example.com/law");
    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(submitButton());
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith({
        medicineId: medicine.id,
        medicineName: medicine.name,
        fieldName: "legalStatus",
        fieldLabel: "Legal Status",
        currentContent: medicine.legalStatus,
        suggestedContent: "Now legal in Oregon.",
        sourceUrl: "https://example.com/law",
        submitterName: "Ada",
        submitterEmail: "",
        website: "",
      }),
    );
    expect(await screen.findByRole("heading", { name: "Thank You" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("joins list sections into the current text", async () => {
    const { user } = renderForm();
    await user.selectOptions(screen.getByLabelText(/which section/i), "contraindications");
    await user.type(screen.getByLabelText(/your suggested correction/i), "Add lithium.");
    await user.click(submitButton());
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith(expect.objectContaining({ currentContent: medicine.contraindications.join("\n") })),
    );
  });

  it("shows a spinner while saving", async () => {
    let resolve!: (v: { ok: boolean }) => void;
    submit.mockReturnValue(new Promise((r) => (resolve = r)));
    const { user } = renderForm();
    await user.type(screen.getByLabelText(/your suggested correction/i), "Fix");
    await user.click(submitButton());
    await waitFor(() => expect(submitButton()).toBeDisabled());
    expect(submitButton().querySelector(".animate-spin")).not.toBeNull();
    resolve({ ok: true });
    expect(await screen.findByRole("heading", { name: "Thank You" })).toBeInTheDocument();
  });

  it("on failure shows the error and a pre-filled email instead of a fake thank-you", async () => {
    networkDown = true;
    const { user } = renderForm();
    await user.type(screen.getByLabelText(/your suggested correction/i), "The dose is off.");
    await user.click(submitButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("This couldn't be saved just now.");
    const body = decodeURIComponent(screen.getByRole("link", { name: /email tony directly/i }).getAttribute("href")!);
    expect(body).toContain(`Medicine: ${medicine.name} (${medicine.id})`);
    expect(body).toContain("Section: Overview");
    expect(body).toContain("The dose is off.");
    expect(screen.queryByRole("heading", { name: "Thank You" })).not.toBeInTheDocument();
  });

  it("Cancel closes without sending", async () => {
    const { user, onClose } = renderForm();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });
});
