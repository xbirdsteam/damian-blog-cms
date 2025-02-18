"use client";

import { cn } from "@/lib/utils";
import { X, Trash2 } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface TagInputProps {
  placeholder?: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function TagInput({
  placeholder = "Enter a value...",
  tags = [],
  setTags,
  disabled,
  className,
}: TagInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const safeTags = Array.isArray(tags) ? tags : [];

  const handleAddTag = (value: string) => {
    // Split by commas or newlines and handle multiple entries
    const newTags = value
      .split(/[,\n]/)
      .map((tag) => tag.trim())
      .filter((tag) => tag && !safeTags.includes(tag));

    if (newTags.length > 0) {
      setTags([...safeTags, ...newTags]);
      setInputValue("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(safeTags.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setTags([]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue) {
        handleAddTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && safeTags.length > 0) {
      handleRemoveTag(safeTags.length - 1);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full rounded-md border border-input bg-background p-3 text-sm ring-offset-background",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap gap-2 flex-1">
          {safeTags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-3 py-1.5 text-sm gap-1 pr-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(index)}
                disabled={disabled}
                className="ml-1 rounded-md p-1 hover:bg-secondary-foreground/20 transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove {tag}</span>
              </button>
            </Badge>
          ))}
        </div>
        {safeTags.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={disabled}
            className="ml-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Clear all tags</span>
          </Button>
        )}
      </div>
      <Textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "min-h-[80px] resize-none bg-transparent outline-none placeholder:text-muted-foreground",
          disabled && "cursor-not-allowed"
        )}
        placeholder={
          safeTags.length === 0
            ? placeholder
            : "Press Enter to add more tags, or use commas..."
        }
        disabled={disabled}
      />
    </div>
  );
}
