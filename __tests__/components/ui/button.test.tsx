import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

describe("Button", () => {
  it("defaults to the default variant and size", () => {
    render(<Button>Go</Button>);
    const b = screen.getByRole("button", { name: "Go" });
    expect(b).toHaveAttribute("data-variant", "default");
    expect(b).toHaveAttribute("data-size", "default");
    expect(b).toHaveClass("bg-primary", "h-8");
  });

  it("applies variant and size classes and merges className", () => {
    render(<Button variant="outline" size="icon" className="size-11">X</Button>);
    const b = screen.getByRole("button");
    expect(b).toHaveClass("border-border", "size-11");
    expect(b).not.toHaveClass("size-8");
    expect(buttonVariants({ variant: "destructive" })).toContain("text-destructive");
  });

  it("forwards the ref, click handler and disabled state", async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const { rerender } = render(<Button ref={ref} onClick={onClick}>Go</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<Button disabled onClick={onClick}>Go</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("asChild renders the child element (a link) with button styles", () => {
    render(<Button asChild variant="link"><Link href="/blog">Read</Link></Button>);
    const a = screen.getByRole("link", { name: "Read" });
    expect(a).toHaveAttribute("href", "/blog");
    expect(a).toHaveClass("underline-offset-4");
  });
});
