"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface DownloadProgressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DownloadProgressDialog({ isOpen, onOpenChange }: DownloadProgressDialogProps) {
  const currentSong = "Song 1";
  const progress = 19;

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
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          {currentSong && (
            <div className="text-sm">
              <p className="font-medium">Current Song:</p>
              <p className="text-muted-foreground">{currentSong}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
