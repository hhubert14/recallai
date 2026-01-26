"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FoldersView } from "./FoldersView";
import { CreateFolderModal } from "@/components/CreateFolderModal";
import { EditFolderModal } from "@/components/EditFolderModal";

interface FolderData {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  studySetCount: number;
}

interface LibraryClientWrapperProps {
  folders: FolderData[];
  children: React.ReactNode;
}

export function LibraryClientWrapper({
  folders: initialFolders,
  children,
}: LibraryClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folder");

  const [folders, setFolders] = useState(initialFolders);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderData | null>(null);

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
      setFolders((prev) => [
        ...prev,
        { ...newFolder, studySetCount: 0 },
      ]);
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
    (folderId: number) => {
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      setEditingFolder(null);

      // If we're viewing the deleted folder, go back to library
      if (searchParams.get("folder") === String(folderId)) {
        router.push("/dashboard/library");
      }
    },
    [router, searchParams]
  );

  // If viewing a specific folder, show study sets in that folder
  // (handled by parent component passing filtered children)
  // Here we just render the folders section when not in a folder view
  const isViewingFolder = !!folderId;

  return (
    <>
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
        {children}
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
    </>
  );
}
