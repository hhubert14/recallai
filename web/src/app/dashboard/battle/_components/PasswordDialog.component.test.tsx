import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordDialog } from "./PasswordDialog";

describe("PasswordDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open", () => {
    render(
      <PasswordDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={false}
        error={null}
      />
    );
    expect(
      screen.getByRole("heading", { name: /enter password/i })
    ).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <PasswordDialog
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={false}
        error={null}
      />
    );
    expect(
      screen.queryByRole("heading", { name: /enter password/i })
    ).not.toBeInTheDocument();
  });

  it("calls onSubmit with password value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <PasswordDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        isLoading={false}
        error={null}
      />
    );

    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: /join/i }));
    expect(onSubmit).toHaveBeenCalledWith("secret123");
  });

  it("disables submit when password is empty", () => {
    render(
      <PasswordDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByRole("button", { name: /join/i })).toBeDisabled();
  });

  it("shows error message", () => {
    render(
      <PasswordDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={false}
        error="Incorrect password"
      />
    );

    expect(screen.getByText("Incorrect password")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <PasswordDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={true}
        error={null}
      />
    );

    expect(screen.getByRole("button", { name: /joining/i })).toBeDisabled();
  });

  it("calls onClose when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <PasswordDialog
        isOpen={true}
        onClose={onClose}
        onSubmit={vi.fn()}
        isLoading={false}
        error={null}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
