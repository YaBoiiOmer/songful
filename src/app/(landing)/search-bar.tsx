"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Song } from "@/settings";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent } from "@/components/ui/dropdown-menu";

interface SearchBarProps {
  onGuess: (guess: Song) => void;
}

export function SearchBar({ onGuess }: SearchBarProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [songs, setSongs] = React.useState<Song[]>([]);

  React.useEffect(() => {
    const fetchSongs = async () => {
      const response = await fetch("/api/songs");
      const songs = await response.json();
      setSongs(songs);
    };
    fetchSongs();
  }, []);

  return (
    <div className="relative w-full">
      <Command className="outline">
        <CommandInput
          placeholder="Type a command or search..."
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />
        {open && (
          <CommandList className="absolute rounded-sm top-10 z-10 w-full outline bg-card max-h-[300px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {songs.length > 0 &&
                songs.map((song) => (
                  <CommandItem
                    key={song?.url}
                    value={song?.name}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      onGuess(song);
                    }}
                  >
                    {song?.name} - {song?.artists.join(", ")}
                    <Check className={cn("ml-auto", value === song?.name ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  );
}
