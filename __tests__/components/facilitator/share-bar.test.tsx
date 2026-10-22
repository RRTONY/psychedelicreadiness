import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FacilitatorShareBar } from "@/components/facilitator/share-bar";

const URL_ = "https://psychedelicreadiness.com/facilitator-index";

describe("FacilitatorShareBar", () => {
  it("shares the real site URL (not the old domain)", () => {
    render(<FacilitatorShareBar />);
    for (const name of [/x \/ twitter/i, /linkedin/i, /facebook/i]) {
      const href = screen.getByRole("link", { name }).getAttribute("href")!;
      expect(href).toContain(encodeURIComponent(URL_));
      expect(href).not.toContain("onlytimebuystrust");
      expect(href).not.toContain("tonygreenberg.com");
    }
    expect(decodeURIComponent(screen.getByRole("link", { name: /send by email/i }).getAttribute("href")!)).toContain(URL_);
  });

  it("copies the link and shows Copied for two seconds", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<FacilitatorShareBar />);
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await user.click(screen.getByRole("button", { name: /copy link/i }));
    expect(writeText).toHaveBeenCalledWith(URL_);
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(2100));
    expect(screen.getByRole("button", { name: /copy link/i })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
