"use client";

import { Input } from "@/app/ui/shadcn/input";
import { Button } from "@/app/ui/shadcn/button";
import { Badge } from "@/app/ui/shadcn/badge";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

export function TagInput({ tags, onAdd, onRemove }: TagInputProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const clean = value.trim();
    if (clean.length > 0 && !tags.includes(clean)) {
      onAdd(clean);
      setValue("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Add tag"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={submit}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button onClick={() => onRemove(tag)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
