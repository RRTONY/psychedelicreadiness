import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MedicineModal } from "@/components/pri/medicine-modal";
import { MEDICINES } from "@/lib/content/pri-data";
import { getMedicineWithSafety } from "@/lib/content/pri-shared";

vi.mock("@/app/forms/actions", () => ({ submitPriCorrection: vi.fn() }));

const med = (id: string) => getMedicineWithSafety(MEDICINES.find((m) => m.id === id)!);

describe("MedicineModal", () => {
  it("opens on the overview with name, intensity, pricing and a safety summary", () => {
    const m = med("psilocybin");
    render(<MedicineModal medicine={m} onClose={vi.fn()} />);
    expect(screen.getByText(m.name)).toBeInTheDocument();
    expect(screen.getByText(`${Math.round(m.intensity * 100)}%`)).toBeInTheDocument();
    expect(screen.getByText(m.overview)).toBeInTheDocument();
    for (const p of m.pricing) expect(screen.getAllByText(p.amount).length).toBeGreaterThan(0);
    expect(
      screen.getByText(new RegExp(`${m.contraindications.length} contraindications and ${m.drugInteractions.length} known drug interactions`)),
    ).toBeInTheDocument();
  });

  it("switches to the safety tab from the tab bar or the summary link", async () => {
    const m = med("psilocybin");
    const user = userEvent.setup();
    render(<MedicineModal medicine={m} onClose={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /view safety & risks tab/i }));
    expect(screen.getByText(m.safetyWarning)).toBeInTheDocument();
    expect(screen.queryByText(m.overview)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Overview" }));
    expect(screen.getByText(m.overview)).toBeInTheDocument();
  });

  it("the correction tab shows the form; its Cancel closes the modal", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<MedicineModal medicine={med("psilocybin")} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Suggest Correction" }));
    expect(screen.getByRole("heading", { name: /suggest a correction for/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("links the deep dives for iboga and mescaline only", () => {
    const { unmount } = render(<MedicineModal medicine={med("iboga")} onClose={vi.fn()} />);
    expect(screen.getByRole("link", { name: /iboga vs ibogaine deep dive/i })).toHaveAttribute("href", "/iboga-ibogaine");
    expect(screen.getByRole("link", { name: /take the compass/i })).toHaveAttribute("href", "/iboga-compass");
    unmount();
    const second = render(<MedicineModal medicine={med("mescaline")} onClose={vi.fn()} />);
    expect(screen.getByRole("link", { name: /explore full module/i })).toHaveAttribute("href", "/peyote-mescaline");
    second.unmount();
    render(<MedicineModal medicine={med("psilocybin")} onClose={vi.fn()} />);
    expect(screen.queryByText("Deep Dive Available")).not.toBeInTheDocument();
  });

  it("closes on a backdrop click but not a click inside, and toggles saved", async () => {
    const onClose = vi.fn();
    const onToggleSaved = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<MedicineModal medicine={med("psilocybin")} onClose={onClose} isSaved={false} onToggleSaved={onToggleSaved} />);
    await user.click(screen.getByText(med("psilocybin").overview));
    expect(onClose).not.toHaveBeenCalled();
    await user.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(screen.getByTitle("Save medicine"));
    expect(onToggleSaved).toHaveBeenCalledWith("psilocybin");
  });

  it("the close (X) button has an accessible name", () => {
    render(<MedicineModal medicine={med("psilocybin")} onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });
});
