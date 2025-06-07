"use client";
import { useEffect, useState } from "react";

export type SongDetails = {
  title: string;
  artist: string;
  url: string;
  spotifyTrackId: string;
};

export default function useRandomSong() {
  const [songDetails, setSongDetails] = useState<SongDetails | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomSong = async () => {
      const response = await fetch("/api/song");
      const songBlob = await response.blob();
      const headers = response.headers;
      if (response.ok) {
        const title = Buffer.from(headers.get("X-Song-Title") || "", "base64").toString("utf-8");
        const artists = Buffer.from(headers.get("X-Song-Artist") || "", "base64").toString("utf-8");

        setSongDetails({
          title: title,
          artist: artists,
          url: headers.get("X-Youtube-Url") || "",
          spotifyTrackId: headers.get("X-Spotify-Track-Id") || "",
        });
      }
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
