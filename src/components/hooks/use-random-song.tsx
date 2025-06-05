"use client";
import { useEffect, useState } from "react";

type SongDetails = {
  title: string;
  artist: string;
  url: string;
};

export default function useRandomSong() {
  const [songDetails, setSongDetails] = useState<SongDetails | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomSong = async () => {
      const response = await fetch("/api/song");
      const songBlob = await response.blob();
      const headers = response.headers;
      setSongDetails({
        title: headers.get("X-Song-Title") || "",
        artist: headers.get("X-Song-Artist") || "",
        url: headers.get("X-Spotify-Url") || "",
      });
      const url = URL.createObjectURL(songBlob);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    };
    fetchRandomSong();
  }, []);
  return { songDetails, audioUrl };
}
