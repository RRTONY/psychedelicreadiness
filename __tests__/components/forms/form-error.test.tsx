import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormError, mailtoHref } from "@/components/forms/form-error";

describe("mailtoHref", () => {
  it("encodes the subject and joins only the non-empty lines", () => {
    const href = mailtoHref("tony@tonygreenberg.com", "Hi & bye", ["Name: Ada", "", false, null, undefined, "   ", "Q?"]);
    expect(href).toBe(`mailto:tony@tonygreenberg.com?subject=Hi%20%26%20bye&body=${encodeURIComponent("Name: Ada\nQ?")}`);
  });
});

describe("FormError", () => {
  it("shows the error as an alert with the email fallback link", () => {
    render(<FormError error="Couldn't save." mailto="mailto:x@y.z" className="text-red" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Couldn't save.");
    expect(alert).toHaveClass("text-red");
    expect(screen.getByRole("link", { name: "Or email Tony directly." })).toHaveAttribute("href", "mailto:x@y.z");
  });
});
