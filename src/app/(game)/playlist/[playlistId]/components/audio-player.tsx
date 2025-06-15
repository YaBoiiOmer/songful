import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getStageColor, Stage } from "./stage";

interface CustomAudioPlayerProps {
  audioUrl: string;
  onStageSkip?: (index: number) => void;
  stage: keyof typeof Stage;
  setStage: (stage: keyof typeof Stage) => void;
}

export function CustomAudioPlayer({ audioUrl, onStageSkip, stage, setStage }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const isReady = !!audioUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = audioUrl;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= Stage[stage]) {
        audio.pause();
        audio.currentTime = Stage[stage];
        setIsPlaying(false);
      }
      setProgress(Math.round(((audio.currentTime ?? 0) / Stage["COOKED"]) * 100));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioUrl, stage]);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);
  };

  const handleSkipStage = () => {
    const steps = Object.keys(Stage);
    const index = steps.indexOf(stage);

    if (index < steps.length - 1) {
      const nextStep = steps[index + 1];
      setStage(nextStep as keyof typeof Stage);
      onStageSkip?.(index);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {isReady && <audio ref={audioRef} />}
      <div className="space-y-2 w-full flex flex-col items-center justify-center">
        <div className="flex gap-2">
          <Button onClick={handlePlay} disabled={isPlaying}>
            <PlayIcon className="w-4 h-4 mr-2" />
            <span>Play (stops at {Stage[stage]}s)</span>
          </Button>
          <Button onClick={handleSkipStage} disabled={isPlaying}>
            Next Stage
          </Button>
        </div>
        <div className="w-full relative">
          <Progress value={progress} />

          <div className="absolute top-0 left-0 w-full">
            <div
              className={`w-1 h-2 ${getStageColor(stage, "bg")} absolute -translate-x-1/2 rounded-full`}
              style={{ left: `${(Stage[stage] / Stage.COOKED) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
