"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { DownloadedSong } from "@/settings";

interface DownloadProgressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DownloadProgressDialog({ isOpen, onOpenChange }: DownloadProgressDialogProps) {
  const [song, setSong] = useState<DownloadedSong | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const eventSource = new EventSource("/api/download-progress");

    eventSource.onmessage = (event) => {
      console.log(event.data);
      const data = JSON.parse(event.data);
      setSong(data);
      setProgress(Math.round(((data.number ?? 0) / (data.total ?? 1)) * 100));
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[300px]">
        <DialogHeader>
          <DialogTitle>Downloading Songs</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {song?.number} / {song?.total}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          {song ? (
            <div className="text-sm">
              <div className="flex gap-2">
                <p className="font-medium">Song:</p>
                <p className="text-muted-foreground">{song.name}</p>
              </div>
              <div className="flex gap-2">
                <p className="font-medium">Artist:</p>
                <p className="text-muted-foreground">{song.artists.join(", ")}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              <p className="font-medium">Waiting for data...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
