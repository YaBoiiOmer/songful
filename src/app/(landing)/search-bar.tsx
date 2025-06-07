"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Song } from "@/settings";

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
      console.log(songs);
    };
    fetchSongs();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full min-w-full justify-center relative"
          disabled={songs.length === 0}
        >
          {value ? songs.find((song) => song?.name === value)?.name : "Guess a song..."}
          <ChevronsUpDown className="opacity-50 absolute right-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-full p-0">
        <Command>
          <CommandInput placeholder="Search song..." className="h-9" />
          <CommandList>
            <CommandEmpty>No song found.</CommandEmpty>
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
        </Command>
      </PopoverContent>
    </Popover>
  );
}
