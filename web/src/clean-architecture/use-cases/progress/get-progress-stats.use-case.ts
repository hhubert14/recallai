import { IProgressRepository } from "@/clean-architecture/domain/repositories/progress.repository.interface";

export type ReviewStatsDto = {
  questionsDueToday: number;
  totalQuestionsInSystem: number;
  questionsInBox1: number;
  questionsInBox2: number;
  questionsInBox3: number;
  questionsInBox4: number;
  questionsInBox5: number;
};

export class GetProgressStatsUseCase {
  constructor(private progressRepository: IProgressRepository) {}

  async execute(userId: string): Promise<ReviewStatsDto> {
    return this.progressRepository.getProgressStats(userId);
  }
}
