import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { GetBattleRoomUseCase } from "@/clean-architecture/use-cases/battle/get-battle-room.use-case";
import { RoomLobby } from "./_components/RoomLobby";
import type { BattleRoomDetail, BattleSlot } from "../_components/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Battle Room | Retenio",
  description: "Battle room lobby",
};

interface RoomPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function BattleRoomPage({ params }: RoomPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { publicId } = await params;

  const useCase = new GetBattleRoomUseCase(
    new DrizzleBattleRoomRepository(),
    new DrizzleBattleRoomSlotRepository()
  );

  let result;
  try {
    result = await useCase.execute(publicId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Battle room not found") {
      notFound();
    }
    throw error;
  }

  const { room, slots } = result;

  // If room is not in waiting status, redirect appropriately
  if (room.status !== "waiting") {
    if (room.status === "in_game") {
      redirect(`/dashboard/battle/${publicId}/play`);
    }
    redirect("/dashboard/battle");
  }

  // Look up study set name
  const studySetRepo = new DrizzleStudySetRepository();
  const studySet = await studySetRepo.findStudySetById(room.studySetId);

  const isHost = room.hostUserId === user.id;

  const roomDetail: BattleRoomDetail = {
    publicId: room.publicId,
    hostUserId: room.hostUserId,
    name: room.name,
    visibility: room.visibility,
    status: room.status,
    timeLimitSeconds: room.timeLimitSeconds,
    questionCount: room.questionCount,
    studySetId: room.studySetId,
    studySetName: studySet?.name ?? "Unknown",
    createdAt: room.createdAt,
  };

  const slotData: BattleSlot[] = slots.map((s) => ({
    slotIndex: s.slotIndex,
    slotType: s.slotType,
    userId: s.userId,
    botName: s.botName,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />

      <main className="flex-1 container py-12 px-6 md:px-8 max-w-4xl mx-auto">
        <RoomLobby
          room={roomDetail}
          slots={slotData}
          userId={user.id}
          isHost={isHost}
        />
      </main>
    </div>
  );
}
