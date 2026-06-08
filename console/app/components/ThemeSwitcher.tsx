"use client";

import * as React from "react";
import { LaptopMinimalIcon, MoonIcon, SunIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { useTheme } from "./theme-provider";

export default function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" aria-label="Toggle theme">
          {theme === "dark" ? (
            <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <SunIcon className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <SunIcon className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("system")}>
          <LaptopMinimalIcon className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <MoonIcon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
