export interface StudySetItem {
  id: string;
  type: "question" | "flashcard";
  content: string;
}

export interface ConceptGroup {
  conceptName: string;
  description: string;
  itemIds: string[];
}

export interface GroupConceptsInput {
  items: StudySetItem[];
  studySetTitle?: string;
}

/**
 * Service interface for grouping study set items into broader concepts.
 * Uses AI to analyze questions and flashcards and group them into 2-5 related concepts.
 */
export interface IConceptGrouperService {
  /**
   * Groups study set items into broader concepts for practice sessions.
   * @param input - Study set items and optional title
   * @returns Array of concept groups with item IDs
   */
  groupConcepts(input: GroupConceptsInput): Promise<ConceptGroup[]>;
}
