"use client";

import { Label } from "@/components/ui/label";
import { Playlist } from "@/types/playlist";
import Image from "next/image";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface PlaylistSelectionProps {
  playlists: Playlist[];
}

export default function PlaylistSelection({ playlists }: PlaylistSelectionProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | undefined>(undefined);
  const router = useRouter();

  const goNext = () => {
    if (!selectedPlaylist) return;
    router.push(`/playlist/${selectedPlaylist}`);
  };

  return (
    <Card className="max-w-128 w-full">
      <CardHeader>
        <CardTitle>Select a Playlist</CardTitle>
        <CardDescription>Select a playlist to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div
              className={cn(
                `flex flex-col gap-3 py-2 rounded-md items-center cursor-pointer hover:bg-muted/30 border-2 border-transparent`,
                selectedPlaylist === playlist.id && "bg-muted/80 border-primary/60"
              )}
              key={playlist.id}
              onClick={() => setSelectedPlaylist(playlist.id)}
            >
              <Image src={playlist.image} alt={playlist.name} width={96} height={96} className="rounded-lg" />
              <Label htmlFor={playlist.id} className="text-md font-medium truncate">
                {playlist.name}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={!selectedPlaylist} className="w-full" onClick={goNext}>
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
