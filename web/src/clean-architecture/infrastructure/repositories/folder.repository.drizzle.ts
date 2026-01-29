import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";
import { db as defaultDb } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { folders, folderStudySets } from "@/drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export class DrizzleFolderRepository implements IFolderRepository {
  constructor(private readonly db: PostgresJsDatabase = defaultDb) {}

  async createFolder(
    userId: string,
    name: string,
    description?: string | null
  ): Promise<FolderEntity> {
    const [data] = await dbRetry(() =>
      this.db
        .insert(folders)
        .values({
          userId,
          name,
          description: description ?? null,
        })
        .returning()
    );

    return this.toEntity(data);
  }

  async findFolderById(id: number): Promise<FolderEntity | null> {
    const [data] = await dbRetry(() =>
      this.db
        .select()
        .from(folders)
        .where(eq(folders.id, id))
        .limit(1)
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async findFoldersByUserId(userId: string): Promise<FolderEntity[]> {
    const data = await dbRetry(() =>
      this.db
        .select()
        .from(folders)
        .where(eq(folders.userId, userId))
        .orderBy(desc(folders.createdAt), desc(folders.id))
    );

    return data.map((folder) => this.toEntity(folder));
  }

  async updateFolder(
    id: number,
    updates: { name?: string; description?: string | null }
  ): Promise<FolderEntity | null> {
    // Build update object only with provided fields
    const updateData: Partial<typeof folders.$inferInsert> = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }

    // If no fields to update, just return the existing folder
    if (Object.keys(updateData).length === 0) {
      return this.findFolderById(id);
    }

    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date().toISOString();

    const [data] = await dbRetry(() =>
      this.db
        .update(folders)
        .set(updateData)
        .where(eq(folders.id, id))
        .returning()
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async deleteFolder(id: number): Promise<void> {
    await dbRetry(() =>
      this.db.delete(folders).where(eq(folders.id, id))
    );
  }

  async addStudySetToFolder(folderId: number, studySetId: number): Promise<void> {
    await dbRetry(() =>
      this.db.insert(folderStudySets).values({
        folderId,
        studySetId,
      })
    );
  }

  async removeStudySetFromFolder(folderId: number, studySetId: number): Promise<void> {
    await dbRetry(() =>
      this.db
        .delete(folderStudySets)
        .where(
          and(
            eq(folderStudySets.folderId, folderId),
            eq(folderStudySets.studySetId, studySetId)
          )
        )
    );
  }

  async findStudySetIdsByFolderId(folderId: number): Promise<number[]> {
    const data = await dbRetry(() =>
      this.db
        .select({ studySetId: folderStudySets.studySetId })
        .from(folderStudySets)
        .where(eq(folderStudySets.folderId, folderId))
    );

    return data.map((row) => row.studySetId);
  }

  async findFolderIdsByStudySetId(studySetId: number): Promise<number[]> {
    const data = await dbRetry(() =>
      this.db
        .select({ folderId: folderStudySets.folderId })
        .from(folderStudySets)
        .where(eq(folderStudySets.studySetId, studySetId))
    );

    return data.map((row) => row.folderId);
  }

  private toEntity(data: typeof folders.$inferSelect): FolderEntity {
    return new FolderEntity(
      data.id,
      data.userId,
      data.name,
      data.description,
      data.createdAt,
      data.updatedAt
    );
  }
}
