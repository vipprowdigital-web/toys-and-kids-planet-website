// app/components/crud/TagsInput.tsx

import React, { useState } from "react";
import { XIcon } from "lucide-react";

export default function TagsInput({ value = [], onChange }: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="w-full">
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
          >
            {tag}
            <button
              type="button"
              className="ml-1 text-primary hover:text-red-500"
              onClick={() => removeTag(tag)}
            >
              <XIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <input
        className="border px-3 py-2 rounded w-full"
        placeholder="Press Enter to add tag"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
          if (e.key === "Backspace" && input === "") {
            onChange(value.slice(0, -1));
          }
        }}
      />
    </div>
  );
}
