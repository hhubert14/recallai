import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";

export interface ConceptInput {
  conceptName: string;
  description: string;
  itemIds: string[];
}

export interface PracticeContext {
  conceptName: string;
  conceptDescription: string;
  relatedItems: string[];
}

export class BuildPracticeContextUseCase {
  constructor(
    private readonly studySetRepository: IStudySetRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly flashcardRepository: IFlashcardRepository
  ) {}

  async execute(
    studySetPublicId: string,
    userId: string,
    concept: ConceptInput
  ): Promise<PracticeContext> {
    // 1. Verify study set exists and user owns it
    const studySet =
      await this.studySetRepository.findStudySetByPublicId(studySetPublicId);

    if (!studySet) {
      throw new Error("Study set not found");
    }

    if (studySet.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // 2. Parse item IDs to separate questions and flashcards
    const questionIds: number[] = [];
    const flashcardIds: number[] = [];

    for (const itemId of concept.itemIds) {
      if (itemId.startsWith("q-")) {
        questionIds.push(parseInt(itemId.substring(2)));
      } else if (itemId.startsWith("f-")) {
        flashcardIds.push(parseInt(itemId.substring(2)));
      }
    }

    // 3. Fetch full question and flashcard data
    const [questions, flashcards] = await Promise.all([
      this.questionRepository.findQuestionsByIds(questionIds),
      this.flashcardRepository.findFlashcardsByIds(flashcardIds),
    ]);

    // 4. Build related items array (maintaining order from itemIds)
    const relatedItems: string[] = [];

    for (const itemId of concept.itemIds) {
      if (itemId.startsWith("q-")) {
        const id = parseInt(itemId.substring(2));
        const question = questions.find((q) => q.id === id);
        if (question) {
          relatedItems.push(question.questionText);
        }
      } else if (itemId.startsWith("f-")) {
        const id = parseInt(itemId.substring(2));
        const flashcard = flashcards.find((f) => f.id === id);
        if (flashcard) {
          relatedItems.push(`${flashcard.front} | ${flashcard.back}`);
        }
      }
    }

    return {
      conceptName: concept.conceptName,
      conceptDescription: concept.description,
      relatedItems,
    };
  }
}
