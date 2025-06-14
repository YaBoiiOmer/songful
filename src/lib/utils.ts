import { Song } from "@/types/song";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSongName(song: Song) {
  return `${song.name} - ${song.artists.map((artist) => artist.name).join(", ")}`;
}
