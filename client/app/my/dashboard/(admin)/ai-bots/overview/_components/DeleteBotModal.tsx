"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/app/ui/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/ui/shadcn/dialog";
import { Input } from "@/app/ui/shadcn/input";
import { Label } from "@/app/ui/shadcn/label";

interface DeleteBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  botName: string;
  isDeleting: boolean;
}

export function DeleteBotModal({
  isOpen,
  onClose,
  onConfirm,
  botName,
  isDeleting,
}: DeleteBotModalProps) {
  const [inputValue, setInputValue] = useState("");

  // Reset input when modal opens
  useEffect(() => {
    if (isOpen) setInputValue("");
  }, [isOpen]);
  // FIX: Normalize whitespace for comparison.
  // This converts "Alpha  Grid" (2 spaces) and "Alpha Grid" (1 space) to "Alpha Grid" before comparing.
  // It fixes the issue where HTML visually collapses spaces but the string variable retains them.
  const normalize = (str: string) => (str || "").trim().replace(/\s+/g, " ");

  const isMatch = normalize(inputValue) === normalize(botName);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isDeleting && !open && onClose()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Bot
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the bot{" "}
            <span className="font-bold text-foreground">{botName}</span> and
            remove all associated data including trade history.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="confirm-name">
              Please type{" "}
              <span className="font-bold select-none text-destructive">
                {botName}
              </span>{" "}
              to confirm.
            </Label>
            <Input
              id="confirm-name"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={normalize(botName)}
              className="col-span-3 font-mono"
              autoComplete="off"
              disabled={isDeleting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!isMatch || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Bot"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
