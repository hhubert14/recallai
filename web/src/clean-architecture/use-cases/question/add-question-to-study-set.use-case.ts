import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";
import { STUDY_SET_ITEM_LIMIT } from "@/lib/constants/study-set";

export interface AddQuestionOption {
  optionText: string;
  isCorrect: boolean;
  explanation: string | null;
}

export interface AddQuestionInput {
  userId: string;
  studySetPublicId: string;
  questionText: string;
  options: AddQuestionOption[];
}

export class AddQuestionToStudySetUseCase {
  constructor(
    private readonly studySetRepository: IStudySetRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly reviewableItemRepository: IReviewableItemRepository
  ) {}

  async execute(
    input: AddQuestionInput
  ): Promise<MultipleChoiceQuestionEntity> {
    const { userId, studySetPublicId, questionText, options } = input;

    // Find the study set
    const studySet =
      await this.studySetRepository.findStudySetByPublicId(studySetPublicId);
    if (!studySet) {
      throw new Error("Study set not found");
    }

    // Verify ownership
    if (studySet.userId !== userId) {
      throw new Error("Not authorized to add items to this study set");
    }

    // Check item limit
    const currentCount =
      await this.reviewableItemRepository.countItemsByStudySetId(studySet.id);
    if (currentCount >= STUDY_SET_ITEM_LIMIT) {
      throw new Error(
        `Study set has reached the maximum limit of ${STUDY_SET_ITEM_LIMIT} items`
      );
    }

    // Validate question text
    if (!questionText.trim()) {
      throw new Error("Question text cannot be empty");
    }
    if (questionText.length > 1000) {
      throw new Error("Question text cannot exceed 1000 characters");
    }

    // Validate options count
    if (options.length !== 4) {
      throw new Error("Question must have exactly 4 options");
    }

    // Validate exactly one correct answer
    const correctCount = options.filter((opt) => opt.isCorrect).length;
    if (correctCount !== 1) {
      throw new Error("Question must have exactly one correct answer");
    }

    // Validate all option texts are non-empty
    if (options.some((opt) => !opt.optionText.trim())) {
      throw new Error("All option texts must be non-empty");
    }

    // Validate option text lengths
    if (options.some((opt) => opt.optionText.length > 500)) {
      throw new Error("Option text cannot exceed 500 characters");
    }

    // Create the question (use study set's videoId which may be null)
    const question = await this.questionRepository.createMultipleChoiceQuestion(
      studySet.videoId,
      questionText,
      options
    );

    // Create reviewable item for spaced repetition tracking
    await this.reviewableItemRepository.createReviewableItemsForQuestionsBatch([
      {
        userId,
        questionId: question.id,
        videoId: studySet.videoId,
        studySetId: studySet.id,
      },
    ]);

    return question;
  }
}
