import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "./Dialog";

describe("Dialog (F-11 a11y)", () => {
  it("is hidden when closed", () => {
    render(<Dialog open={false} onClose={() => {}} title="T" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes dialog semantics", () => {
    render(<Dialog open onClose={() => {}} title="My Dialog" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("My Dialog")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="T">
        <button>inside</button>
      </Dialog>
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("traps focus within the dialog", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>outside-before</button>
        <Dialog open onClose={() => {}} title="T">
          <button>first</button>
          <button>last</button>
        </Dialog>
        <button>outside-after</button>
      </>
    );
    const panel = screen.getByRole("dialog");
    const inside = screen.getAllByRole("button").filter((b) => panel.contains(b));
    const first = screen.getByRole("button", { name: "first" });
    first.focus();
    // after several tabs focus must stay inside the dialog
    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(inside).toContain(document.activeElement);
    }
  });

  it("locks body scroll while open", () => {
    const { unmount } = render(<Dialog open onClose={() => {}} title="T" />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
