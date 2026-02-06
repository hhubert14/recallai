import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import {
  StudySetEntity,
  StudySetSourceType,
} from "@/clean-architecture/domain/entities/study-set.entity";
import { db as defaultDb } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { studySets } from "@/drizzle/schema";
import { eq, desc, inArray } from "drizzle-orm";
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
    const [data] = await dbRetry(() =>
      this.db
        .insert(studySets)
        .values({
          userId: params.userId,
          name: params.name,
          description: params.description,
          sourceType: params.sourceType,
          videoId: params.videoId,
        })
        .returning()
    );

    return this.toEntity(data);
  }

  async findStudySetById(id: number): Promise<StudySetEntity | null> {
    const [data] = await dbRetry(() =>
      this.db.select().from(studySets).where(eq(studySets.id, id)).limit(1)
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async findStudySetByPublicId(
    publicId: string
  ): Promise<StudySetEntity | null> {
    const [data] = await dbRetry(() =>
      this.db
        .select()
        .from(studySets)
        .where(eq(studySets.publicId, publicId))
        .limit(1)
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async findStudySetsByUserId(userId: string): Promise<StudySetEntity[]> {
    const data = await dbRetry(() =>
      this.db
        .select()
        .from(studySets)
        .where(eq(studySets.userId, userId))
        .orderBy(desc(studySets.createdAt), desc(studySets.id))
    );

    return data.map((studySet) => this.toEntity(studySet));
  }

  async findStudySetByVideoId(videoId: number): Promise<StudySetEntity | null> {
    const [data] = await dbRetry(() =>
      this.db
        .select()
        .from(studySets)
        .where(eq(studySets.videoId, videoId))
        .limit(1)
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async findStudySetsByIds(ids: number[]): Promise<StudySetEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    const data = await dbRetry(() =>
      this.db.select().from(studySets).where(inArray(studySets.id, ids))
    );

    return data.map((studySet) => this.toEntity(studySet));
  }

  async updateStudySet(
    id: number,
    params: {
      name?: string;
      description?: string | null;
    }
  ): Promise<StudySetEntity | null> {
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

    const [data] = await dbRetry(() =>
      this.db
        .update(studySets)
        .set(updateData)
        .where(eq(studySets.id, id))
        .returning()
    );

    if (!data) return null;
    return this.toEntity(data);
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
