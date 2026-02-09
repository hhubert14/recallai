import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { GetBattleRoomUseCase } from "@/clean-architecture/use-cases/battle/get-battle-room.use-case";
import { GameContainer } from "./_components/GameContainer";
import type { BattleSlot } from "../../_components/types";
import type { QuestionData } from "@/hooks/useBattleGame";

export const dynamic = "force-dynamic";

interface PlayPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function BattlePlayPage({ params }: PlayPageProps) {
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

  // If room is not in_game, redirect to room lobby
  if (!room.isInGame()) {
    redirect(`/dashboard/battle/${publicId}`);
  }

  const slotData: BattleSlot[] = slots.map((s) => ({
    slotIndex: s.slotIndex,
    slotType: s.slotType,
    userId: s.userId,
    botName: s.botName,
  }));

  const isHost = room.hostUserId === user.id;

  // If the game already has an active question, fetch it so late-joiners
  // don't get stuck on "Starting game..." waiting for a missed broadcast
  let initialQuestion: QuestionData | null = null;
  if (
    room.currentQuestionIndex !== null &&
    room.currentQuestionStartedAt !== null &&
    room.questionIds
  ) {
    const questionId = room.questionIds[room.currentQuestionIndex];
    if (questionId !== undefined) {
      const questionRepo = new DrizzleQuestionRepository();
      const question = await questionRepo.findQuestionById(questionId);
      if (question) {
        initialQuestion = {
          index: room.currentQuestionIndex,
          text: question.questionText,
          options: question.options.map((opt) => ({
            id: opt.id,
            optionText: opt.optionText,
          })),
          startedAt: room.currentQuestionStartedAt,
        };
      }
    }
  }

  return (
    <GameContainer
      publicId={publicId}
      userId={user.id}
      isHost={isHost}
      slots={slotData}
      timeLimitSeconds={room.timeLimitSeconds}
      questionCount={room.questionCount}
      hostUserId={room.hostUserId}
      roomName={room.name}
      initialQuestion={initialQuestion}
    />
  );
}
