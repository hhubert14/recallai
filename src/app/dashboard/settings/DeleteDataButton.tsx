"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteDataButton() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!showConfirm) {
            setShowConfirm(true);
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch("/api/v1/user/data", {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete data");
            }

            // Refresh the page to update the data counts
            router.refresh();

            // Reset the confirmation state
            setShowConfirm(false);
        } catch (error) {
            console.error("Error deleting data:", error);
            // You might want to show a toast notification here
            alert("Failed to delete data. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        setShowConfirm(false);
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isDeleting}
                >
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2"
                >
                    {isDeleting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Deleting...
                        </>
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4" />
                            Confirm Delete
                        </>
                    )}
                </Button>
            </div>
        );
    }

    return (
        <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
        >
            <Trash2 className="h-4 w-4" />
            Delete Data
        </Button>
    );
}
