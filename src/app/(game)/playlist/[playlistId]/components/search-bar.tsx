"use client";

import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { cn, formatSongName } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Song } from "@/types/song";

interface SearchBarProps {
  onGuess: (guess: Song) => void;
  songs: Song[];
}

export function SearchBar({ onGuess, songs }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onInteractOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    // fetchSongs();

    document.addEventListener("mousedown", onInteractOutside);
    return () => document.removeEventListener("mousedown", onInteractOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <Command className="outline">
        <CommandInput placeholder="Type a command or search..." onFocus={() => setOpen(true)} />
        {open && (
          <CommandList className="absolute rounded-sm bottom-9 z-10 w-full outline bg-card max-h-[300px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Songs">
              {songs.length > 0 &&
                songs.map((song) => (
                  <CommandItem
                    key={song?.id}
                    value={formatSongName(song)}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      onGuess(song);
                    }}
                  >
                    {formatSongName(song)}
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
