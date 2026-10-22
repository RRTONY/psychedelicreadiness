import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IbogaPharmaTable } from "@/components/pri/iboga-pharma-table";
import { IBOGA_PHARMA_ALTERNATIVES } from "@/lib/content/pri-iboga-module";

const bodyRows = () => within(screen.getByRole("table")).getAllByRole("row").slice(1);

describe("IbogaPharmaTable", () => {
  it("shows five rows and toggles between all and fewer", async () => {
    const user = userEvent.setup();
    render(<IbogaPharmaTable rows={IBOGA_PHARMA_ALTERNATIVES} />);
    expect(bodyRows()).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: `Show all ${IBOGA_PHARMA_ALTERNATIVES.length}` }));
    expect(bodyRows()).toHaveLength(IBOGA_PHARMA_ALTERNATIVES.length);
    expect(bodyRows()[0]).toHaveTextContent("Methadone");
    await user.click(screen.getByRole("button", { name: "Show fewer" }));
    expect(bodyRows()).toHaveLength(5);
  });

  it("has no toggle for five rows or fewer", () => {
    render(<IbogaPharmaTable rows={IBOGA_PHARMA_ALTERNATIVES.slice(0, 3)} />);
    expect(bodyRows()).toHaveLength(3);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
