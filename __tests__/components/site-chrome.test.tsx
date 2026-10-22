import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteChrome } from "@/components/site-chrome";
import { navigation } from "@tests/helpers/next";

describe("SiteChrome", () => {
  it("shows the header/footer on site pages", () => {
    for (const p of ["/", "/pri-efficacy", "/facilitator-index"]) {
      navigation.pathname = p;
      const { unmount } = render(<SiteChrome>chrome</SiteChrome>);
      expect(screen.getByText("chrome")).toBeInTheDocument();
      unmount();
    }
  });

  it("hides them on the MCP sign-in page", () => {
    navigation.pathname = "/oauth/authorize";
    const { container } = render(<SiteChrome>chrome</SiteChrome>);
    expect(container).toBeEmptyDOMElement();
  });
});
