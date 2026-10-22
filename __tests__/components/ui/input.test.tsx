import { describe, expect, it } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("passes through type, props and className", () => {
    render(<Input type="email" placeholder="you@x.com" className="w-40" aria-invalid />);
    const i = screen.getByPlaceholderText("you@x.com");
    expect(i).toHaveAttribute("type", "email");
    expect(i).toHaveAttribute("data-slot", "input");
    expect(i).toHaveClass("w-40", "rounded-lg");
  });

  it("forwards the ref and accepts typing", async () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Name" />);
    await userEvent.setup().type(screen.getByLabelText("Name"), "Tony");
    expect(ref.current?.value).toBe("Tony");
  });
});
