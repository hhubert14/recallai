import {
  StudySetEntity,
  StudySetSourceType,
} from "../entities/study-set.entity";

export interface IStudySetRepository {
  /**
   * Create a new study set.
   */
  createStudySet(params: {
    userId: string;
    name: string;
    description: string | null;
    sourceType: StudySetSourceType;
    videoId: number | null;
  }): Promise<StudySetEntity>;

  /**
   * Find a study set by its internal ID.
   */
  findStudySetById(id: number): Promise<StudySetEntity | null>;

  /**
   * Find a study set by its public UUID.
   */
  findStudySetByPublicId(publicId: string): Promise<StudySetEntity | null>;

  /**
   * Find all study sets for a user.
   */
  findStudySetsByUserId(userId: string): Promise<StudySetEntity[]>;

  /**
   * Find the study set associated with a video.
   * Returns null if no study set exists for the video.
   */
  findStudySetByVideoId(videoId: number): Promise<StudySetEntity | null>;

  /**
   * Update a study set's name and description.
   */
  updateStudySet(
    id: number,
    params: {
      name?: string;
      description?: string | null;
    }
  ): Promise<StudySetEntity | null>;
}
