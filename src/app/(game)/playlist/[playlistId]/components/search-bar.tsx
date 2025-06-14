"use client";

import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Song } from "@/settings";

interface SearchBarProps {
  onGuess: (guess: Song) => void;
}

export function SearchBar({ onGuess }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      const response = await fetch("/api/songs");
      const songs = await response.json();
      setSongs(songs);
    };

    const onInteractOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    fetchSongs();

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
                    key={song?.url}
                    value={song?.name + " " + song?.artists.join(" ")}
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
