import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import {
  IConceptGrouperService,
  ConceptGroup,
  StudySetItem,
} from "@/clean-architecture/domain/services/concept-grouper.interface";

export class GroupItemsIntoConceptsUseCase {
  constructor(
    private readonly studySetRepository: IStudySetRepository,
    private readonly reviewableItemRepository: IReviewableItemRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly flashcardRepository: IFlashcardRepository,
    private readonly conceptGrouperService: IConceptGrouperService
  ) {}

  async execute(
    studySetPublicId: string,
    userId: string
  ): Promise<ConceptGroup[]> {
    // 1. Verify study set exists and user owns it
    const studySet =
      await this.studySetRepository.findStudySetByPublicId(studySetPublicId);

    if (!studySet) {
      throw new Error("Study set not found");
    }

    if (studySet.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // 2. Get all reviewable items for this study set
    const reviewableItems =
      await this.reviewableItemRepository.findReviewableItemsByUserIdAndStudySetId(
        userId,
        studySet.id
      );

    // 3. Validate minimum item count
    if (reviewableItems.length < 5) {
      throw new Error("Practice requires at least 5 items in your study set");
    }

    // 4. Fetch full question and flashcard data
    const questionIds = reviewableItems
      .filter((item) => item.isQuestion() && item.questionId !== null)
      .map((item) => item.questionId!);

    const flashcardIds = reviewableItems
      .filter((item) => item.isFlashcard() && item.flashcardId !== null)
      .map((item) => item.flashcardId!);

    const [questions, flashcards] = await Promise.all([
      this.questionRepository.findQuestionsByIds(questionIds),
      this.flashcardRepository.findFlashcardsByIds(flashcardIds),
    ]);

    // 5. Build StudySetItem array for AI grouping
    const studySetItems: StudySetItem[] = [];

    // Add questions
    for (const question of questions) {
      studySetItems.push({
        id: `q-${question.id}`,
        type: "question",
        content: question.questionText,
      });
    }

    // Add flashcards
    for (const flashcard of flashcards) {
      studySetItems.push({
        id: `f-${flashcard.id}`,
        type: "flashcard",
        content: `${flashcard.front} | ${flashcard.back}`,
      });
    }

    // 6. Group items into concepts using AI
    const concepts = await this.conceptGrouperService.groupConcepts({
      items: studySetItems,
      studySetTitle: studySet.name,
    });

    return concepts;
  }
}
