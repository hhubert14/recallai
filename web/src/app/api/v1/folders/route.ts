import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { CreateFolderUseCase } from "@/clean-architecture/use-cases/folder/create-folder.use-case";
import { GetFoldersByUserIdUseCase } from "@/clean-architecture/use-cases/folder/get-folders-by-user-id.use-case";
import { DrizzleFolderRepository } from "@/clean-architecture/infrastructure/repositories/folder.repository.drizzle";

/**
 * GET /api/v1/folders
 * List all folders for the authenticated user
 */
export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const useCase = new GetFoldersByUserIdUseCase(
      new DrizzleFolderRepository()
    );
    const folders = await useCase.execute(user.id);

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
 * POST /api/v1/folders
 * Create a new folder
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return jsendFail({ error: "Folder name is required" }, 400);
    }

    const useCase = new CreateFolderUseCase(new DrizzleFolderRepository());
    const folder = await useCase.execute({
      userId: user.id,
      name,
      description: description ?? undefined,
    });

    return jsendSuccess(
      {
        folder: {
          id: folder.id,
          name: folder.name,
          description: folder.description,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
        },
      },
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Folder name is required") {
      return jsendFail({ error: message }, 400);
    }
    return jsendError(message);
  }
}
