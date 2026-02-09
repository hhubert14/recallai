export { GetBattleRoomUseCase } from "./get-battle-room.use-case";
export type { GetBattleRoomResult } from "./get-battle-room.use-case";

export { ListBattleRoomsUseCase } from "./list-battle-rooms.use-case";
export type {
  BattleRoomListItem,
  SlotSummary,
} from "./list-battle-rooms.use-case";

export { CreateBattleRoomUseCase } from "./create-battle-room.use-case";
export type {
  CreateBattleRoomInput,
  CreateBattleRoomResult,
} from "./create-battle-room.use-case";

export { JoinBattleRoomUseCase } from "./join-battle-room.use-case";
export type { JoinBattleRoomInput } from "./join-battle-room.use-case";

export { LeaveBattleRoomUseCase } from "./leave-battle-room.use-case";
export type { LeaveBattleRoomInput } from "./leave-battle-room.use-case";

export { UpdateBattleRoomSlotUseCase } from "./update-battle-room-slot.use-case";
export type { UpdateBattleRoomSlotInput } from "./update-battle-room-slot.use-case";

export { KickPlayerUseCase } from "./kick-player.use-case";
export type { KickPlayerInput } from "./kick-player.use-case";

export { StartBattleGameUseCase } from "./start-battle-game.use-case";
export type {
  StartBattleGameInput,
  StartBattleGameResult,
} from "./start-battle-game.use-case";

export { AdvanceQuestionUseCase } from "./advance-question.use-case";
export type {
  AdvanceQuestionInput,
  AdvanceQuestionResult,
} from "./advance-question.use-case";

export { SubmitBattleAnswerUseCase } from "./submit-battle-answer.use-case";
export type {
  SubmitBattleAnswerInput,
  SubmitBattleAnswerResult,
} from "./submit-battle-answer.use-case";

export { SimulateBotAnswersUseCase } from "./simulate-bot-answers.use-case";
export type {
  SimulateBotAnswersInput,
  BotAnswerResult,
  SimulateBotAnswersResult,
} from "./simulate-bot-answers.use-case";

export { FinishBattleGameUseCase } from "./finish-battle-game.use-case";
export type { FinishBattleGameInput } from "./finish-battle-game.use-case";

export { GetQuestionResultsUseCase } from "./get-question-results.use-case";
export type {
  GetQuestionResultsInput,
  QuestionResult,
  GetQuestionResultsResult,
} from "./get-question-results.use-case";

export { GetBattleResultsUseCase } from "./get-battle-results.use-case";
export type {
  GetBattleResultsInput,
  PlayerResult,
  GetBattleResultsResult,
} from "./get-battle-results.use-case";

export { calculateAnswerScore, rankGameResults } from "@/lib/battle/scoring";
export type { RankedResult } from "@/lib/battle/scoring";

export { simulateBotAnswer } from "@/lib/battle/bot-simulation";
export type { BotAnswer } from "@/lib/battle/bot-simulation";
