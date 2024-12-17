"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  placeholder?: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  disabled?: boolean;
}

export function TagInput({
  placeholder = "Enter a value...",
  tags = [],
  setTags,
  disabled,
}: TagInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState("");

  const safeTags = Array.isArray(tags) ? tags : [];

  const handleAddTag = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !safeTags.includes(trimmedValue)) {
      setTags([...safeTags, trimmedValue]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(safeTags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && safeTags.length > 0) {
      handleRemoveTag(safeTags.length - 1);
    }
  };

  return (
    <div
      className="flex min-h-[40px] w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      onClick={() => inputRef.current?.focus()}
    >
      {safeTags.map((tag, index) => (
        <Badge
          key={`${tag}-${index}`}
          variant="secondary"
          className="gap-1 pr-0.5"
        >
          {tag}
          <button
            type="button"
            className="ml-1 rounded-full p-0.5 hover:bg-secondary-foreground/20"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveTag(index);
            }}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {tag}</span>
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        placeholder={safeTags.length === 0 ? placeholder : ""}
        disabled={disabled}
      />
    </div>
  );
}
