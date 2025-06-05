"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import useRandomSong from "../../components/hooks/use-random-song";
import { PlayIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadSong } from "./download-song";

const Stage = {
  FIRST: 0.1,
  SECOND: 0.5,
  THIRD: 1,
  FOURTH: 3,
  FIFTH: 5,
  SIXTH: 15,
  COOKED: 30,
};

const getFormattedStage = (stage: keyof typeof Stage) => {
  switch (stage) {
    case "FIRST":
      return <span className="text-red-600">First</span>;
    case "SECOND":
      return <span className="text-orange-600">Second</span>;
    case "THIRD":
      return <span className="text-orange-400">Third</span>;
    case "FOURTH":
      return <span className="text-yellow-400">Fourth</span>;
    case "FIFTH":
      return <span className="text-green-400">Fifth</span>;
    case "SIXTH":
      return <span className="text-purple-500">Sixth</span>;
    case "COOKED":
      return <span className="text-black font-semibold">BRUH YOU'RE COOKED 💀</span>;
  }
};

export default function Home() {
  const { songDetails, audioUrl } = useRandomSong();
  const handleDownload = async () => {
    const result = await downloadSong(
      "https://www.youtube.com/watch?v=6ipqQlQrQH0&pp=ygUWd2hpdGUgbXVzdGFuZyBseXJ1aWNzIA%3D%3D",
      "test"
    );
    console.log(result);
  };
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <Button onClick={handleDownload}>test</Button>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">Songful - A song guessing game</CardTitle>
          <CardDescription className="text-center">Guess the song before it finishes.</CardDescription>
        </CardHeader>
        <CardContent>{audioUrl && <CustomAudioPlayer audioUrl={audioUrl} />}</CardContent>
        {songDetails && (
          <CardFooter className="flex items-center justify-center text-muted-foreground/30">
            {songDetails.title} - {songDetails.artist}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

function CustomAudioPlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [stage, setStage] = useState<keyof typeof Stage>("FIRST");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

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

  const handleNextStep = () => {
    const steps = Object.keys(Stage);
    const index = steps.indexOf(stage);
    console.log("Current step:", stage, index);

    if (index < steps.length - 1) {
      const nextStep = steps[index + 1];
      setStage(nextStep as keyof typeof Stage);
      console.log("Moved to next step:", nextStep);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <audio ref={audioRef} src={audioUrl} />
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground mb-2">Current Stage: {getFormattedStage(stage)}</div>
        <div className="flex gap-2">
          <Button onClick={handlePlay} disabled={isPlaying}>
            <PlayIcon className="w-4 h-4 mr-2" />
            <span>Play (stops at {Stage[stage]}s)</span>
          </Button>
          <Button onClick={handleNextStep} disabled={isPlaying}>
            Next Stage
          </Button>
        </div>
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
}
