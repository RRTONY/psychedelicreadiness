import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

describe("Collapsible", () => {
  it("toggles its content from the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Collapsible>
        <CollapsibleTrigger>More</CollapsibleTrigger>
        <CollapsibleContent>Hidden text</CollapsibleContent>
      </Collapsible>,
    );
    const t = screen.getByRole("button", { name: "More" });
    expect(t).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Hidden text")).not.toBeInTheDocument();
    await user.click(t);
    expect(t).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Hidden text")).toHaveAttribute("data-slot", "collapsible-content");
  });

  it("forceMount keeps closed content in the HTML", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>More</CollapsibleTrigger>
        <CollapsibleContent forceMount>
          <a href="/x">Crawlable</a>
        </CollapsibleContent>
      </Collapsible>,
    );
    expect(document.querySelector('a[href="/x"]')).not.toBeNull();
  });
});
