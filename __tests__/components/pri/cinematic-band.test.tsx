import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CinematicBand } from "@/components/pri/cinematic-band";

describe("CinematicBand", () => {
  it("renders the photo with its alt text and the chosen fade", () => {
    const { container } = render(<CinematicBand src="https://cdn.sanity.io/images/x.webp" alt="Forest at dawn" fadeTo="ink" />);
    expect(screen.getByRole("img", { name: "Forest at dawn" })).toHaveAttribute("src", "https://cdn.sanity.io/images/x.webp");
    expect(container.querySelector(".to-pri-ink")).not.toBeNull();
    expect(container.querySelector(".to-pri-cream")).toBeNull();
  });

  it("uses the default height and position unless given others", () => {
    const { container, rerender } = render(<CinematicBand src="/a.webp" alt="a" fadeTo="cream" />);
    expect(container.firstChild).toHaveClass("h-[clamp(180px,25vw,320px)]");
    expect(screen.getByRole("img")).toHaveClass("object-center");
    rerender(<CinematicBand src="/a.webp" alt="a" fadeTo="cream" heightClass="h-40" objectPosition="object-top" className="mt-4" />);
    expect(container.firstChild).toHaveClass("h-40", "mt-4");
    expect(screen.getByRole("img")).toHaveClass("object-top");
    expect(container.querySelector(".to-pri-cream")).not.toBeNull();
  });
});
