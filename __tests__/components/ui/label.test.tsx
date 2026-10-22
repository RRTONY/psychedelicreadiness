import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("labels its input and focuses it on click", async () => {
    render(
      <>
        <Label htmlFor="email" className="text-xs">Email</Label>
        <input id="email" />
      </>,
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText("Email")).toHaveClass("text-xs");
    await userEvent.setup().click(screen.getByText("Email"));
    expect(screen.getByLabelText("Email")).toHaveFocus();
  });
});
