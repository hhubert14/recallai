import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { GetStudySetFoldersUseCase } from "@/clean-architecture/use-cases/folder/get-study-set-folders.use-case";
import { UpdateStudySetFoldersUseCase } from "@/clean-architecture/use-cases/folder/update-study-set-folders.use-case";
import { DrizzleFolderRepository } from "@/clean-architecture/infrastructure/repositories/folder.repository.drizzle";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";

/**
 * GET /api/v1/study-sets/[publicId]/folders
 * Get all folders that contain a study set
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { publicId } = await params;

    if (!publicId) {
      return jsendFail({ error: "Missing publicId" }, 400);
    }

    // Look up study set by publicId
    const studySetRepository = new DrizzleStudySetRepository();
    const studySet = await studySetRepository.findStudySetByPublicId(publicId);

    if (!studySet) {
      return jsendFail({ error: "Study set not found" }, 404);
    }

    // Verify user owns the study set
    if (studySet.userId !== user.id) {
      return jsendFail({ error: "Study set not found" }, 404);
    }

    const useCase = new GetStudySetFoldersUseCase(new DrizzleFolderRepository());
    const folders = await useCase.execute({
      studySetId: studySet.id,
      userId: user.id,
    });

    return jsendSuccess({
      folders: folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        description: folder.description,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsendError(message);
  }
}

/**
 * PUT /api/v1/study-sets/[publicId]/folders
 * Update folder memberships for a study set
 * Replaces the entire folder membership list with the provided folder IDs
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { publicId } = await params;

    if (!publicId) {
      return jsendFail({ error: "Missing publicId" }, 400);
    }

    const body = await request.json();
    const { folderIds } = body;

    if (!Array.isArray(folderIds)) {
      return jsendFail({ error: "folderIds must be an array" }, 400);
    }

    // Validate array size to prevent DoS
    if (folderIds.length > 100) {
      return jsendFail({ error: "Too many folder IDs (max 100)" }, 400);
    }

    // Validate all folder IDs are numbers
    if (!folderIds.every((id) => typeof id === "number")) {
      return jsendFail({ error: "All folder IDs must be numbers" }, 400);
    }

    // Look up study set by publicId
    const studySetRepository = new DrizzleStudySetRepository();
    const studySet = await studySetRepository.findStudySetByPublicId(publicId);

    if (!studySet) {
      return jsendFail({ error: "Study set not found" }, 404);
    }

    // Verify user owns the study set
    if (studySet.userId !== user.id) {
      return jsendFail({ error: "Study set not found" }, 404);
    }

    const useCase = new UpdateStudySetFoldersUseCase(
      new DrizzleFolderRepository(),
      studySetRepository
    );

    await useCase.execute({
      studySetId: studySet.id,
      userId: user.id,
      folderIds,
    });

    return jsendSuccess({ message: "Folders updated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Study set not found") {
      return jsendFail({ error: message }, 404);
    }
    if (message === "Invalid folder") {
      return jsendFail({ error: message }, 400);
    }
    return jsendError(message);
  }
}
