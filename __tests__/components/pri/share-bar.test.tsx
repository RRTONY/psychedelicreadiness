import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriShareBar } from "@/components/pri/share-bar";

const URL_ = "https://psychedelicreadiness.com";

describe("PriShareBar", () => {
  it("shares this site's PRI address, never the old domain", () => {
    render(<PriShareBar />);
    for (const name of [/share on x/i, /share on linkedin/i, /share on facebook/i]) {
      const href = screen.getByRole("link", { name }).getAttribute("href")!;
      expect(href).toContain(encodeURIComponent(URL_));
      expect(href).not.toContain("onlytimebuystrust");
      expect(href).not.toContain("tonygreenberg.com");
    }
    expect(decodeURIComponent(screen.getByRole("link", { name: /send by email/i }).getAttribute("href")!)).toContain(URL_);
  });

  it("copies the link and resets after two seconds", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<PriShareBar />);
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await user.click(screen.getByRole("button", { name: /copy link/i }));
    expect(writeText).toHaveBeenCalledWith(URL_);
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(2100));
    expect(screen.getByRole("button", { name: /copy link/i })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
