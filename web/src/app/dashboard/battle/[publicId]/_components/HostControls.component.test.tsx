import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HostControls } from "./HostControls";

describe("HostControls", () => {
  it("renders Start Game button", () => {
    render(
      <HostControls
        onStartGame={vi.fn()}
        isStarting={false}
        startError={null}
      />
    );
    expect(
      screen.getByRole("button", { name: /start game/i })
    ).toBeInTheDocument();
  });

  it("calls onStartGame when clicked", async () => {
    const user = userEvent.setup();
    const onStartGame = vi.fn();
    render(
      <HostControls
        onStartGame={onStartGame}
        isStarting={false}
        startError={null}
      />
    );

    await user.click(screen.getByRole("button", { name: /start game/i }));
    expect(onStartGame).toHaveBeenCalled();
  });

  it("shows loading state when starting", () => {
    render(
      <HostControls
        onStartGame={vi.fn()}
        isStarting={true}
        startError={null}
      />
    );
    expect(
      screen.getByRole("button", { name: /starting/i })
    ).toBeDisabled();
  });

  it("shows error message", () => {
    render(
      <HostControls
        onStartGame={vi.fn()}
        isStarting={false}
        startError="Not enough questions available"
      />
    );
    expect(
      screen.getByText("Not enough questions available")
    ).toBeInTheDocument();
  });
});
