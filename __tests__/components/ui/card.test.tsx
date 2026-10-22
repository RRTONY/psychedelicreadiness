import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

describe("Card", () => {
  it("renders every part with its data-slot", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
          <CardAction>Act</CardAction>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Title")).toHaveAttribute("data-slot", "card-title");
    expect(screen.getByText("Desc")).toHaveAttribute("data-slot", "card-description");
    expect(screen.getByText("Act")).toHaveAttribute("data-slot", "card-action");
    expect(screen.getByText("Body")).toHaveAttribute("data-slot", "card-content");
    expect(screen.getByText("Foot")).toHaveAttribute("data-slot", "card-footer");
  });

  it("supports the small size and merges className and props", () => {
    render(<Card size="sm" className="border-red-500" data-testid="c">x</Card>);
    const c = screen.getByTestId("c");
    expect(c).toHaveAttribute("data-size", "sm");
    expect(c).toHaveClass("rounded-xl", "border-red-500");
  });
});
