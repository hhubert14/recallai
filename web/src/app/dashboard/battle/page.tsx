import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { ListBattleRoomsUseCase } from "@/clean-architecture/use-cases/battle/list-battle-rooms.use-case";
import { FindStudySetsByUserIdUseCase } from "@/clean-architecture/use-cases/study-set/find-study-sets-by-user-id.use-case";
import { BattleLobbyClient } from "./_components/BattleLobbyClient";
import { BattleRoomsRealtimeProvider } from "@/lib/battle-rooms-realtime-provider";
import type { BattleRoomSummary, StudySetForBattle } from "./_components/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Battle | Retenio",
  description: "Compete with others in real-time quiz battles",
};

export default async function BattleLobbyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const battleRoomRepo = new DrizzleBattleRoomRepository();
  const battleSlotRepo = new DrizzleBattleRoomSlotRepository();
  const studySetRepo = new DrizzleStudySetRepository();
  const reviewableItemRepo = new DrizzleReviewableItemRepository();

  // Fetch rooms and user's study sets in parallel
  const listRoomsUseCase = new ListBattleRoomsUseCase(
    battleRoomRepo,
    battleSlotRepo
  );
  const findStudySetsUseCase = new FindStudySetsByUserIdUseCase(studySetRepo);

  const [roomListItems, userStudySets] = await Promise.all([
    listRoomsUseCase.execute(),
    findStudySetsUseCase.execute(user.id),
  ]);

  // Enrich rooms with study set names
  const roomStudySetIds = [
    ...new Set(roomListItems.map((item) => item.room.studySetId)),
  ];
  const roomStudySets =
    await studySetRepo.findStudySetsByIds(roomStudySetIds);
  const studySetNameMap = new Map(
    roomStudySets.map((s) => [s.id, s.name])
  );

  const rooms: BattleRoomSummary[] = roomListItems.map((item) => ({
    publicId: item.room.publicId,
    name: item.room.name,
    visibility: item.room.visibility,
    timeLimitSeconds: item.room.timeLimitSeconds,
    questionCount: item.room.questionCount,
    studySetName: studySetNameMap.get(item.room.studySetId) ?? "Unknown",
    createdAt: item.room.createdAt,
    slotSummary: item.slotSummary,
  }));

  // Fetch question counts for user's study sets
  const studySetIds = userStudySets.map((s) => s.id);
  const itemCounts =
    await reviewableItemRepo.countItemsByStudySetIdsBatch(studySetIds);

  const studySets: StudySetForBattle[] = userStudySets
    .map((s) => ({
      publicId: s.publicId,
      name: s.name,
      questionCount: itemCounts[s.id]?.questions ?? 0,
    }))
    .filter((s) => s.questionCount >= 5);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />

      <main className="flex-1 container py-12 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            Battle
          </h1>
          <p className="text-lg text-muted-foreground">
            Compete with others in real-time quiz battles.
          </p>
        </div>

        <BattleRoomsRealtimeProvider>
          <BattleLobbyClient initialRooms={rooms} studySets={studySets} />
        </BattleRoomsRealtimeProvider>
      </main>
    </div>
  );
}
