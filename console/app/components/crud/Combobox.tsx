// app/components/crud/Combobox.tsx

"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxProps {
  /** List of options (array of objects with value & label) */
  options: { value: string; label: string }[];

  /** Selected value */
  value?: string;

  /** Callback on selection change */
  onChange: (value: string) => void;

  /** Placeholder text */
  placeholder?: string;

  /** Loading state (for async data) */
  loading?: boolean;

  /** Custom width */
  width?: string;

  className?: string;
}

/**
 * ✅ Reusable Combobox Component
 * Works with static or dynamic data
 *
 * Example:
 * <Combobox
 *   options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
 *   value={selectedCategory}
 *   onChange={(v) => setSelectedCategory(v)}
 *   placeholder="Select category..."
 * />
 */
export function Combobox({
  options = [],
  value = "",
  onChange,
  placeholder = "Select option...",
  loading = false,
  width = "300px",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full"
          style={{ width }}
        >
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="opacity-50 h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={`p-0 w-[${width}]`}>
        <Command>
          <CommandInput
            placeholder={`Search...`}
            className="h-9"
            disabled={loading}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading..." : "No results found."}
            </CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      opt.value === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
