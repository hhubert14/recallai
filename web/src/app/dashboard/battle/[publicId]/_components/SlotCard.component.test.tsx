import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlotCard } from "./SlotCard";
import type { BattleSlot } from "../../_components/types";

function createSlot(overrides: Partial<BattleSlot> = {}): BattleSlot {
  return {
    slotIndex: 0,
    slotType: "empty",
    userId: null,
    botName: null,
    ...overrides,
  };
}

describe("SlotCard", () => {
  describe("empty slot", () => {
    it("renders waiting state", () => {
      render(
        <SlotCard
          slot={createSlot({ slotType: "empty" })}
          isHost={false}
          isCurrentUser={false}
        />
      );
      expect(screen.getByText(/waiting/i)).toBeInTheDocument();
    });

    it("shows toggle button for host", () => {
      render(
        <SlotCard
          slot={createSlot({ slotType: "empty" })}
          isHost={true}
          isCurrentUser={false}
          onUpdateSlot={vi.fn()}
        />
      );
      expect(
        screen.getByRole("button", { name: /toggle slot/i })
      ).toBeInTheDocument();
    });

    it("does not show toggle button for non-hosts", () => {
      render(
        <SlotCard
          slot={createSlot({ slotType: "empty" })}
          isHost={false}
          isCurrentUser={false}
        />
      );
      expect(
        screen.queryByRole("button", { name: /toggle slot/i })
      ).not.toBeInTheDocument();
    });

    it("cycles to bot when toggle clicked on empty slot", async () => {
      const user = userEvent.setup();
      const onUpdateSlot = vi.fn();
      render(
        <SlotCard
          slot={createSlot({ slotType: "empty", slotIndex: 2 })}
          isHost={true}
          isCurrentUser={false}
          onUpdateSlot={onUpdateSlot}
        />
      );

      await user.click(screen.getByRole("button", { name: /toggle slot/i }));
      expect(onUpdateSlot).toHaveBeenCalledWith(2, "bot");
    });
  });

  describe("player slot", () => {
    it("renders player with 'You' badge for current user", () => {
      render(
        <SlotCard
          slot={createSlot({ slotType: "player", userId: "user-1" })}
          isHost={false}
          isCurrentUser={true}
        />
      );
      expect(screen.getByText("You")).toBeInTheDocument();
    });

    it("renders 'Host' badge for host player", () => {
      render(
        <SlotCard
          slot={createSlot({ slotType: "player", userId: "host-1" })}
          isHost={false}
          isCurrentUser={false}
          isSlotHost={true}
        />
      );
      expect(screen.getByText("Host")).toBeInTheDocument();
    });

    it("shows kick button for host on non-host player", () => {
      render(
        <SlotCard
          slot={createSlot({
            slotType: "player",
            userId: "other-user",
            slotIndex: 1,
          })}
          isHost={true}
          isCurrentUser={false}
          isSlotHost={false}
          onKickPlayer={vi.fn()}
        />
      );
      expect(
        screen.getByRole("button", { name: /kick/i })
      ).toBeInTheDocument();
    });

    it("does not show toggle for player slots", () => {
      render(
        <SlotCard
          slot={createSlot({ slotType: "player", userId: "other-user" })}
          isHost={true}
          isCurrentUser={false}
          isSlotHost={false}
        />
      );
      expect(
        screen.queryByRole("button", { name: /toggle slot/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("bot slot", () => {
    it("renders bot name", () => {
      render(
        <SlotCard
          slot={createSlot({
            slotType: "bot",
            botName: "Skynet",
          })}
          isHost={false}
          isCurrentUser={false}
        />
      );
      expect(screen.getByText("Skynet")).toBeInTheDocument();
    });

    it("cycles to locked when toggle clicked on bot slot", async () => {
      const user = userEvent.setup();
      const onUpdateSlot = vi.fn();
      render(
        <SlotCard
          slot={createSlot({
            slotType: "bot",
            botName: "Skynet",
            slotIndex: 3,
          })}
          isHost={true}
          isCurrentUser={false}
          onUpdateSlot={onUpdateSlot}
        />
      );

      await user.click(screen.getByRole("button", { name: /toggle slot/i }));
      expect(onUpdateSlot).toHaveBeenCalledWith(3, "locked");
    });
  });

  describe("locked slot", () => {
    it("renders locked state", () => {
      render(
        <SlotCard
          slot={createSlot({ slotType: "locked" })}
          isHost={false}
          isCurrentUser={false}
        />
      );
      expect(screen.getByText(/locked/i)).toBeInTheDocument();
    });

    it("cycles to empty when toggle clicked on locked slot", async () => {
      const user = userEvent.setup();
      const onUpdateSlot = vi.fn();
      render(
        <SlotCard
          slot={createSlot({ slotType: "locked", slotIndex: 1 })}
          isHost={true}
          isCurrentUser={false}
          onUpdateSlot={onUpdateSlot}
        />
      );

      await user.click(screen.getByRole("button", { name: /toggle slot/i }));
      expect(onUpdateSlot).toHaveBeenCalledWith(1, "empty");
    });
  });
});
