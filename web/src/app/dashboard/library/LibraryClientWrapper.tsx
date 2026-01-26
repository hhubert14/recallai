"use client";

import { useState, useCallback, useMemo, createContext, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FoldersView } from "./FoldersView";
import { CreateFolderModal } from "@/components/CreateFolderModal";
import { EditFolderModal } from "@/components/EditFolderModal";
import { AddToFolderModal, FolderOption } from "@/components/AddToFolderModal";
import { ClientStudySetList, StudySetWithCounts } from "./ClientStudySetList";
import { LibrarySearchSort, SortOption } from "./LibrarySearchSort";

interface FolderData {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  studySetCount: number;
}

// Context for study set actions
export interface StudySetActionsContextType {
  onAddToFolder: (studySet: StudySetWithCounts) => void;
}

export const StudySetActionsContext = createContext<StudySetActionsContextType | null>(
  null
);

export function useStudySetActions() {
  return useContext(StudySetActionsContext);
}

interface LibraryClientWrapperProps {
  folders: FolderData[];
  studySets: StudySetWithCounts[];
  isViewingFolder: boolean;
}

export function LibraryClientWrapper({
  folders: initialFolders,
  studySets,
  isViewingFolder,
}: LibraryClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folder");

  const [folders, setFolders] = useState(initialFolders);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderData | null>(null);

  // Search and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  // Filter and sort study sets
  const filteredAndSortedStudySets = useMemo(() => {
    // Filter by search query (case-insensitive name match)
    const filtered = studySets.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort by selected option
    return [...filtered].sort((a, b) => {
      if (sortOption === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // alphabetical
      return a.name.localeCompare(b.name);
    });
  }, [studySets, searchQuery, sortOption]);

  // Check if search yielded no results (vs empty library)
  const hasSearchResults = filteredAndSortedStudySets.length > 0;
  const hasStudySets = studySets.length > 0;
  const isSearchActive = searchQuery.trim().length > 0;

  // Add to folder modal state
  const [addToFolderStudySet, setAddToFolderStudySet] =
    useState<StudySetWithCounts | null>(null);
  const [addToFolderOptions, setAddToFolderOptions] = useState<FolderOption[]>(
    []
  );
  const [isAddToFolderLoading, setIsAddToFolderLoading] = useState(false);
  const [isFetchingFolders, setIsFetchingFolders] = useState(false);
  const [addToFolderError, setAddToFolderError] = useState<string | null>(null);

  const handleFolderClick = useCallback(
    (folder: FolderData) => {
      router.push(`/dashboard/library?folder=${folder.id}`);
    },
    [router]
  );

  const handleCreateSuccess = useCallback(
    (newFolder: {
      id: number;
      name: string;
      description: string | null;
      createdAt: string;
      updatedAt: string;
    }) => {
      setFolders((prev) => [...prev, { ...newFolder, studySetCount: 0 }]);
      setIsCreateModalOpen(false);
    },
    []
  );

  const handleEditSuccess = useCallback(
    (updatedFolder: {
      id: number;
      name: string;
      description: string | null;
      createdAt: string;
      updatedAt: string;
    }) => {
      setFolders((prev) =>
        prev.map((f) =>
          f.id === updatedFolder.id
            ? { ...updatedFolder, studySetCount: f.studySetCount }
            : f
        )
      );
      setEditingFolder(null);
    },
    []
  );

  const handleDeleteFolder = useCallback(
    (deletedFolderId: number) => {
      setFolders((prev) => prev.filter((f) => f.id !== deletedFolderId));
      setEditingFolder(null);

      // If we're viewing the deleted folder, go back to library
      if (searchParams.get("folder") === String(deletedFolderId)) {
        router.push("/dashboard/library");
      }
    },
    [router, searchParams]
  );

  const handleAddToFolder = useCallback(
    async (studySet: StudySetWithCounts) => {
      setAddToFolderStudySet(studySet);
      setIsFetchingFolders(true);
      setAddToFolderError(null);

      try {
        // Fetch which folders this study set is already in
        const response = await fetch(
          `/api/v1/study-sets/${studySet.publicId}/folders`
        );
        const data = await response.json();

        if (response.ok && data.status === "success") {
          const studySetFolderIds = new Set(
            data.data.folders.map((f: { id: number }) => f.id)
          );

          // Build folder options with checked state
          const options: FolderOption[] = folders.map((folder) => ({
            id: folder.id,
            name: folder.name,
            isChecked: studySetFolderIds.has(folder.id),
          }));

          setAddToFolderOptions(options);
        } else {
          // If error fetching, show all folders as unchecked with error message
          setAddToFolderOptions(
            folders.map((folder) => ({
              id: folder.id,
              name: folder.name,
              isChecked: false,
            }))
          );
          setAddToFolderError(
            "Failed to load current folder assignments. Showing all folders as unchecked."
          );
        }
      } catch {
        // On error, show all folders as unchecked with error message
        setAddToFolderOptions(
          folders.map((folder) => ({
            id: folder.id,
            name: folder.name,
            isChecked: false,
          }))
        );
        setAddToFolderError(
          "Failed to load current folder assignments. Showing all folders as unchecked."
        );
      } finally {
        setIsFetchingFolders(false);
      }
    },
    [folders]
  );

  const handleSaveFolders = useCallback(
    async (folderIds: number[]) => {
      if (!addToFolderStudySet) return;

      setIsAddToFolderLoading(true);
      setAddToFolderError(null);

      try {
        const response = await fetch(
          `/api/v1/study-sets/${addToFolderStudySet.publicId}/folders`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ folderIds }),
          }
        );

        if (response.ok) {
          // Update folder counts locally
          const previousFolderIds = new Set(
            addToFolderOptions.filter((f) => f.isChecked).map((f) => f.id)
          );
          const newFolderIds = new Set(folderIds);

          setFolders((prev) =>
            prev.map((folder) => {
              const wasInFolder = previousFolderIds.has(folder.id);
              const isInFolder = newFolderIds.has(folder.id);

              if (wasInFolder && !isInFolder) {
                // Removed from folder
                return {
                  ...folder,
                  studySetCount: Math.max(0, folder.studySetCount - 1),
                };
              } else if (!wasInFolder && isInFolder) {
                // Added to folder
                return {
                  ...folder,
                  studySetCount: folder.studySetCount + 1,
                };
              }
              return folder;
            })
          );

          setAddToFolderStudySet(null);
        } else {
          // Handle error response
          const data = await response.json().catch(() => ({}));
          setAddToFolderError(
            data.data?.error || "Failed to update folders. Please try again."
          );
        }
      } catch {
        setAddToFolderError("An error occurred. Please try again.");
      } finally {
        setIsAddToFolderLoading(false);
      }
    },
    [addToFolderStudySet, addToFolderOptions]
  );

  return (
    <StudySetActionsContext.Provider value={{ onAddToFolder: handleAddToFolder }}>
      {!isViewingFolder && (
        <div className="mb-8">
          <FoldersView
            folders={folders}
            onFolderClick={handleFolderClick}
            onCreateClick={() => setIsCreateModalOpen(true)}
            onEditFolder={setEditingFolder}
            onDeleteFolder={(folder) => setEditingFolder(folder)}
          />
        </div>
      )}

      {/* Study sets section */}
      <div>
        {!isViewingFolder && (
          <h2 className="text-lg font-semibold mb-4">Study Sets</h2>
        )}

        {/* Search and Sort controls */}
        {hasStudySets && (
          <LibrarySearchSort
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
        )}

        {/* Study sets list or empty state */}
        {isSearchActive && !hasSearchResults ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No study sets match &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          <ClientStudySetList
            studySets={filteredAndSortedStudySets}
            isViewingFolder={isViewingFolder}
          />
        )}
      </div>

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Folder Modal */}
      {editingFolder && (
        <EditFolderModal
          isOpen={!!editingFolder}
          folder={editingFolder}
          onClose={() => setEditingFolder(null)}
          onSuccess={handleEditSuccess}
          onDelete={handleDeleteFolder}
        />
      )}

      {/* Add to Folder Modal */}
      <AddToFolderModal
        isOpen={!!addToFolderStudySet}
        studySetName={addToFolderStudySet?.name ?? ""}
        folders={isFetchingFolders ? [] : addToFolderOptions}
        onClose={() => setAddToFolderStudySet(null)}
        onSave={handleSaveFolders}
        isLoading={isAddToFolderLoading || isFetchingFolders}
        error={addToFolderError}
      />
    </StudySetActionsContext.Provider>
  );
}
