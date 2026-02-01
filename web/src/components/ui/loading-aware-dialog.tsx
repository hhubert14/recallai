"use client";

import { Dialog } from "@/components/ui/dialog";
import { ComponentProps } from "react";

type DialogProps = ComponentProps<typeof Dialog>;

interface LoadingAwareDialogProps extends Omit<DialogProps, "onOpenChange"> {
  /**
   * When true, prevents the dialog from being dismissed via backdrop click,
   * Escape key, or the X button.
   */
  isLoading?: boolean;
  /**
   * Called when the dialog's open state changes.
   * Will not be called with `false` while `isLoading` is true.
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * A Dialog wrapper that prevents dismissal while loading.
 *
 * Use this instead of Dialog when you have async operations that should
 * block the user from accidentally closing the modal.
 */
export function LoadingAwareDialog({
  isLoading,
  onOpenChange,
  ...props
}: LoadingAwareDialogProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open && isLoading) return;
    onOpenChange?.(open);
  };

  return <Dialog onOpenChange={handleOpenChange} {...props} />;
}
