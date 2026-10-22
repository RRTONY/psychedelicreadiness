import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { PrintedOn } from "@/components/facilitator/printed-on";

describe("PrintedOn", () => {
  it("shows today's date in the browser", () => {
    const { container } = render(<PrintedOn />);
    expect(container).toHaveTextContent(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
  });

  it("is empty in the server HTML (the page is static, so a server date would be the build date)", () => {
    expect(renderToString(<PrintedOn />)).toBe("");
  });
});
