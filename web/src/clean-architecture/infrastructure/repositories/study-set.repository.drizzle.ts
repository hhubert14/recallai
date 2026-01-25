import {
  IStudySetRepository,
} from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import {
  StudySetEntity,
  StudySetSourceType,
} from "@/clean-architecture/domain/entities/study-set.entity";
import { db as defaultDb } from "@/drizzle";
import { studySets } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export class DrizzleStudySetRepository implements IStudySetRepository {
  constructor(private readonly db: PostgresJsDatabase = defaultDb) {}

  async createStudySet(params: {
    userId: string;
    name: string;
    description: string | null;
    sourceType: StudySetSourceType;
    videoId: number | null;
  }): Promise<StudySetEntity> {
    try {
      const [data] = await this.db
        .insert(studySets)
        .values({
          userId: params.userId,
          name: params.name,
          description: params.description,
          sourceType: params.sourceType,
          videoId: params.videoId,
        })
        .returning();

      return this.toEntity(data);
    } catch (error) {
      console.error("Error creating study set:", error);
      throw error;
    }
  }

  async findStudySetById(id: number): Promise<StudySetEntity | null> {
    try {
      const [data] = await this.db
        .select()
        .from(studySets)
        .where(eq(studySets.id, id))
        .limit(1);

      if (!data) return null;
      return this.toEntity(data);
    } catch (error) {
      console.error("Error finding study set by ID:", error);
      throw error;
    }
  }

  async findStudySetByPublicId(publicId: string): Promise<StudySetEntity | null> {
    try {
      const [data] = await this.db
        .select()
        .from(studySets)
        .where(eq(studySets.publicId, publicId))
        .limit(1);

      if (!data) return null;
      return this.toEntity(data);
    } catch (error) {
      console.error("Error finding study set by public ID:", error);
      throw error;
    }
  }

  async findStudySetsByUserId(userId: string): Promise<StudySetEntity[]> {
    try {
      const data = await this.db
        .select()
        .from(studySets)
        .where(eq(studySets.userId, userId))
        .orderBy(desc(studySets.createdAt), desc(studySets.id));

      return data.map((studySet) => this.toEntity(studySet));
    } catch (error) {
      console.error("Error finding study sets by user ID:", error);
      throw error;
    }
  }

  async findStudySetByVideoId(videoId: number): Promise<StudySetEntity | null> {
    try {
      const [data] = await this.db
        .select()
        .from(studySets)
        .where(eq(studySets.videoId, videoId))
        .limit(1);

      if (!data) return null;
      return this.toEntity(data);
    } catch (error) {
      console.error("Error finding study set by video ID:", error);
      throw error;
    }
  }

  async updateStudySet(
    id: number,
    params: {
      name?: string;
      description?: string | null;
    }
  ): Promise<StudySetEntity | null> {
    try {
      // Build update object only with provided fields
      const updateData: Partial<typeof studySets.$inferInsert> = {};

      if (params.name !== undefined) {
        updateData.name = params.name;
      }
      if (params.description !== undefined) {
        updateData.description = params.description;
      }

      // If no fields to update, just return the existing study set
      if (Object.keys(updateData).length === 0) {
        return this.findStudySetById(id);
      }

      // Always update the updatedAt timestamp
      updateData.updatedAt = new Date().toISOString();

      const [data] = await this.db
        .update(studySets)
        .set(updateData)
        .where(eq(studySets.id, id))
        .returning();

      if (!data) return null;
      return this.toEntity(data);
    } catch (error) {
      console.error("Error updating study set:", error);
      throw error;
    }
  }

  private toEntity(data: typeof studySets.$inferSelect): StudySetEntity {
    return new StudySetEntity(
      data.id,
      data.publicId,
      data.userId,
      data.name,
      data.description,
      data.sourceType as StudySetSourceType,
      data.videoId,
      data.createdAt,
      data.updatedAt
    );
  }
}
