import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubmissionForm } from "@/components/facilitator/submission-form";
import { submitFacilitatorIndex } from "@/app/forms/actions";

vi.mock("@/app/forms/actions", () => ({ submitFacilitatorIndex: vi.fn() }));
const submit = vi.mocked(submitFacilitatorIndex);

const submitButton = () => screen.getByRole("button", { name: /submit to the index/i });

describe("SubmissionForm", () => {
  let networkDown = false;
  beforeEach(() => {
    networkDown = false;
    submit.mockImplementation(async () => {
      if (networkDown) throw new Error("network");
      return { ok: true };
    });
  });

  it("keeps Submit disabled until responses are pasted", async () => {
    const user = userEvent.setup();
    render(<SubmissionForm />);
    expect(submitButton()).toBeDisabled();
    await user.type(screen.getByLabelText(/your responses/i), "   ");
    expect(submitButton()).toBeDisabled();
    await user.type(screen.getByLabelText(/your responses/i), "1. yes");
    expect(submitButton()).toBeEnabled();
  });

  it("sends a full submission with the optional code empty and no referral", async () => {
    const user = userEvent.setup();
    render(<SubmissionForm />);
    await user.type(screen.getByLabelText(/your responses/i), "1. yes\n2. no");
    await user.click(submitButton());
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    expect(submit).toHaveBeenCalledWith({
      kind: "full",
      codedIdentity: "",
      responses: "1. yes\n2. no",
      referralConsent: false,
      referralRegion: "",
      referralContact: "",
      locale: navigator.language,
    });
    expect(await screen.findByText("Received.")).toBeInTheDocument();
  });

  it("shows the referral fields only after consent and sends them", async () => {
    const user = userEvent.setup();
    render(<SubmissionForm />);
    expect(screen.queryByLabelText(/your region/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox"));
    await user.type(screen.getByLabelText(/your code/i), "CEDAR-001");
    await user.type(screen.getByLabelText(/your region/i), "Western Europe");
    await user.type(screen.getByLabelText(/how to reach you/i), "me@example.com");
    await user.type(screen.getByLabelText(/your responses/i), "answers");
    await user.click(submitButton());
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({ codedIdentity: "CEDAR-001", referralConsent: true, referralRegion: "Western Europe", referralContact: "me@example.com" }),
      ),
    );
  });

  it("drops region and contact if consent is unticked again", async () => {
    const user = userEvent.setup();
    render(<SubmissionForm />);
    await user.click(screen.getByRole("checkbox"));
    await user.type(screen.getByLabelText(/your region/i), "Asia");
    await user.click(screen.getByRole("checkbox"));
    await user.type(screen.getByLabelText(/your responses/i), "answers");
    await user.click(submitButton());
    await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({ referralConsent: false, referralRegion: "" })));
  });

  it("shows a spinner while saving", async () => {
    let resolve!: (v: { ok: boolean }) => void;
    submit.mockReturnValue(new Promise((r) => (resolve = r)));
    const user = userEvent.setup();
    render(<SubmissionForm />);
    await user.type(screen.getByLabelText(/your responses/i), "answers");
    await user.click(submitButton());
    await waitFor(() => expect(submitButton()).toBeDisabled());
    expect(submitButton().querySelector(".animate-spin")).not.toBeNull();
    resolve({ ok: true });
    expect(await screen.findByText("Received.")).toBeInTheDocument();
  });

  it("on failure offers a pre-filled email with the responses so nothing is lost", async () => {
    networkDown = true;
    const user = userEvent.setup();
    render(<SubmissionForm />);
    await user.type(screen.getByLabelText(/your code/i), "OAK-7");
    await user.type(screen.getByLabelText(/your responses/i), "my long answers");
    await user.click(submitButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("This couldn't be saved just now.");
    const href = screen.getByRole("link", { name: /email tony directly/i }).getAttribute("href")!;
    expect(href.startsWith("mailto:tony@tonygreenberg.com")).toBe(true);
    const body = decodeURIComponent(href);
    expect(body).toContain("Code: OAK-7");
    expect(body).toContain("my long answers");
    expect(screen.queryByText("Received.")).not.toBeInTheDocument();
  });
});
