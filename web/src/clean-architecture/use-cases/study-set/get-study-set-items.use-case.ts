import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";

export type StudySetItem =
  | { itemType: "flashcard"; flashcard: FlashcardEntity }
  | { itemType: "question"; question: MultipleChoiceQuestionEntity };

export interface GetStudySetItemsResult {
  items: StudySetItem[];
}

export class GetStudySetItemsUseCase {
  constructor(
    private readonly reviewableItemRepository: IReviewableItemRepository,
    private readonly flashcardRepository: IFlashcardRepository,
    private readonly questionRepository: IQuestionRepository
  ) {}

  async execute(studySetId: number): Promise<GetStudySetItemsResult> {
    // Get all reviewable items for this study set (ordered by ID = insertion order)
    const reviewableItems =
      await this.reviewableItemRepository.findReviewableItemsByStudySetId(
        studySetId
      );

    if (reviewableItems.length === 0) {
      return { items: [] };
    }

    // Extract IDs by type
    const flashcardIds = reviewableItems
      .filter(
        (item) => item.itemType === "flashcard" && item.flashcardId !== null
      )
      .map((item) => item.flashcardId as number);

    const questionIds = reviewableItems
      .filter(
        (item) => item.itemType === "question" && item.questionId !== null
      )
      .map((item) => item.questionId as number);

    // Fetch actual entities in parallel
    const [flashcards, questions] = await Promise.all([
      flashcardIds.length > 0
        ? this.flashcardRepository.findFlashcardsByIds(flashcardIds)
        : Promise.resolve([]),
      questionIds.length > 0
        ? this.questionRepository.findQuestionsByIds(questionIds)
        : Promise.resolve([]),
    ]);

    // Create maps for quick lookup
    const flashcardMap = new Map(flashcards.map((f) => [f.id, f]));
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Build result in reviewable items order (preserves insertion order)
    const items: StudySetItem[] = [];
    for (const reviewableItem of reviewableItems) {
      if (
        reviewableItem.itemType === "flashcard" &&
        reviewableItem.flashcardId
      ) {
        const flashcard = flashcardMap.get(reviewableItem.flashcardId);
        if (flashcard) {
          items.push({ itemType: "flashcard", flashcard });
        }
      } else if (
        reviewableItem.itemType === "question" &&
        reviewableItem.questionId
      ) {
        const question = questionMap.get(reviewableItem.questionId);
        if (question) {
          items.push({ itemType: "question", question });
        }
      }
    }

    return { items };
  }
}
