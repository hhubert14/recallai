import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { GetFolderWithStudySetsUseCase } from "@/clean-architecture/use-cases/folder/get-folder-with-study-sets.use-case";
import { UpdateFolderUseCase } from "@/clean-architecture/use-cases/folder/update-folder.use-case";
import { DeleteFolderUseCase } from "@/clean-architecture/use-cases/folder/delete-folder.use-case";
import { DrizzleFolderRepository } from "@/clean-architecture/infrastructure/repositories/folder.repository.drizzle";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";

/**
 * GET /api/v1/folders/[id]
 * Get a folder with its study sets
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { id } = await params;
    const folderId = parseInt(id, 10);

    if (isNaN(folderId)) {
      return jsendFail({ error: "Invalid folder ID" }, 400);
    }

    const useCase = new GetFolderWithStudySetsUseCase(
      new DrizzleFolderRepository(),
      new DrizzleStudySetRepository()
    );

    const result = await useCase.execute({
      folderId,
      userId: user.id,
    });

    if (!result) {
      return jsendFail({ error: "Folder not found" }, 404);
    }

    return jsendSuccess({
      folder: {
        id: result.folder.id,
        name: result.folder.name,
        description: result.folder.description,
        createdAt: result.folder.createdAt,
        updatedAt: result.folder.updatedAt,
      },
      studySets: result.studySets.map((studySet) => ({
        id: studySet.id,
        publicId: studySet.publicId,
        name: studySet.name,
        description: studySet.description,
        sourceType: studySet.sourceType,
        videoId: studySet.videoId,
        createdAt: studySet.createdAt,
        updatedAt: studySet.updatedAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsendError(message);
  }
}

/**
 * PATCH /api/v1/folders/[id]
 * Update a folder's name and/or description
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { id } = await params;
    const folderId = parseInt(id, 10);

    if (isNaN(folderId)) {
      return jsendFail({ error: "Invalid folder ID" }, 400);
    }

    const body = await request.json();
    const { name, description } = body;

    // Validate that at least one field is being updated
    if (name === undefined && description === undefined) {
      return jsendFail(
        { error: "At least one field (name or description) must be provided" },
        400
      );
    }

    const useCase = new UpdateFolderUseCase(new DrizzleFolderRepository());
    const folder = await useCase.execute({
      folderId,
      userId: user.id,
      updates: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });

    if (!folder) {
      return jsendFail({ error: "Folder not found" }, 404);
    }

    return jsendSuccess({
      folder: {
        id: folder.id,
        name: folder.name,
        description: folder.description,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Folder name cannot be empty") {
      return jsendFail({ error: message }, 400);
    }
    return jsendError(message);
  }
}

/**
 * DELETE /api/v1/folders/[id]
 * Delete a folder (study sets are not deleted, only removed from folder)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { id } = await params;
    const folderId = parseInt(id, 10);

    if (isNaN(folderId)) {
      return jsendFail({ error: "Invalid folder ID" }, 400);
    }

    const useCase = new DeleteFolderUseCase(new DrizzleFolderRepository());

    await useCase.execute({
      folderId,
      userId: user.id,
    });

    return jsendSuccess({ message: "Folder deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Folder not found") {
      return jsendFail({ error: message }, 404);
    }
    return jsendError(message);
  }
}
