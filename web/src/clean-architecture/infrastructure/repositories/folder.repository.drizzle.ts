import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";
import { db as defaultDb } from "@/drizzle";
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
    try {
      const [data] = await this.db
        .insert(folders)
        .values({
          userId,
          name,
          description: description ?? null,
        })
        .returning();

      return this.toEntity(data);
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  }

  async findFolderById(id: number): Promise<FolderEntity | null> {
    try {
      const [data] = await this.db
        .select()
        .from(folders)
        .where(eq(folders.id, id))
        .limit(1);

      if (!data) return null;
      return this.toEntity(data);
    } catch (error) {
      console.error("Error finding folder by ID:", error);
      throw error;
    }
  }

  async findFoldersByUserId(userId: string): Promise<FolderEntity[]> {
    try {
      const data = await this.db
        .select()
        .from(folders)
        .where(eq(folders.userId, userId))
        .orderBy(desc(folders.createdAt), desc(folders.id));

      return data.map((folder) => this.toEntity(folder));
    } catch (error) {
      console.error("Error finding folders by user ID:", error);
      throw error;
    }
  }

  async updateFolder(
    id: number,
    updates: { name?: string; description?: string | null }
  ): Promise<FolderEntity | null> {
    try {
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

      const [data] = await this.db
        .update(folders)
        .set(updateData)
        .where(eq(folders.id, id))
        .returning();

      if (!data) return null;
      return this.toEntity(data);
    } catch (error) {
      console.error("Error updating folder:", error);
      throw error;
    }
  }

  async deleteFolder(id: number): Promise<void> {
    try {
      await this.db.delete(folders).where(eq(folders.id, id));
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw error;
    }
  }

  async addStudySetToFolder(folderId: number, studySetId: number): Promise<void> {
    try {
      await this.db.insert(folderStudySets).values({
        folderId,
        studySetId,
      });
    } catch (error) {
      console.error("Error adding study set to folder:", error);
      throw error;
    }
  }

  async removeStudySetFromFolder(folderId: number, studySetId: number): Promise<void> {
    try {
      await this.db
        .delete(folderStudySets)
        .where(
          and(
            eq(folderStudySets.folderId, folderId),
            eq(folderStudySets.studySetId, studySetId)
          )
        );
    } catch (error) {
      console.error("Error removing study set from folder:", error);
      throw error;
    }
  }

  async findStudySetIdsByFolderId(folderId: number): Promise<number[]> {
    try {
      const data = await this.db
        .select({ studySetId: folderStudySets.studySetId })
        .from(folderStudySets)
        .where(eq(folderStudySets.folderId, folderId));

      return data.map((row) => row.studySetId);
    } catch (error) {
      console.error("Error finding study set IDs by folder ID:", error);
      throw error;
    }
  }

  async findFolderIdsByStudySetId(studySetId: number): Promise<number[]> {
    try {
      const data = await this.db
        .select({ folderId: folderStudySets.folderId })
        .from(folderStudySets)
        .where(eq(folderStudySets.studySetId, studySetId));

      return data.map((row) => row.folderId);
    } catch (error) {
      console.error("Error finding folder IDs by study set ID:", error);
      throw error;
    }
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
