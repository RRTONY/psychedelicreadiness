import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteMobileMenu } from "@/components/site-mobile-menu";
import { FOOTER_NAV } from "@/lib/site-nav";
import { navigation } from "@tests/helpers/next";

describe("SiteMobileMenu", () => {
  it("starts closed, opens with every page, and closes again", async () => {
    const user = userEvent.setup();
    render(<SiteMobileMenu />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAccessibleName("Close menu");
    const nav = within(screen.getByRole("navigation", { name: "Main" }));
    for (const l of FOOTER_NAV.flatMap((g) => g.links)) expect(nav.getByRole("link", { name: l.label })).toHaveAttribute("href", l.href);

    await user.click(toggle);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("marks the current page", async () => {
    navigation.pathname = "/pri-calibration";
    const user = userEvent.setup();
    render(<SiteMobileMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("link", { name: "Deep Calibration" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Efficacy Report" })).not.toHaveAttribute("aria-current");
  });

  it("closes when the page changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SiteMobileMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    navigation.pathname = "/pri-efficacy";
    rerender(<SiteMobileMenu />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });
});
