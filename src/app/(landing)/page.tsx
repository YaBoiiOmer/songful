"use client";

import { useEffect, useState } from "react";
import useRandomSong from "../../components/hooks/use-random-song";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsButton from "@/components/settings-button";
import { SearchBar } from "./search-bar";
import { Input } from "@/components/ui/input";
import { CustomAudioPlayer } from "./audio-player";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getStageColor, Stage } from "./stage";

type Guess = {
  name: string;
  isCorrect: boolean;
};

export default function Home() {
  const { songDetails: chosenSong, audioUrl } = useRandomSong();
  const [stage, setStage] = useState<keyof typeof Stage>("FIRST");
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const handleStageSkip = (index: number) => {
    setGuesses((prev) => [...prev, { name: "SKIP", isCorrect: false }]);
    setStage(Object.keys(Stage)[index + 1] as keyof typeof Stage);
  };

  useEffect(() => {
    if (guesses.length === 7 || guesses.some((guess) => guess.isCorrect)) {
      setIsGameOver(true);
    }
  }, [guesses]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Card className={cn("w-full max-w-lg", isGameOver && "pointer-events-none")}>
        <SettingsButton />
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">🎶 Songful 🎶</CardTitle>
          <CardDescription className="text-center">
            A song guessing game, lets see how well do you know your playlist. <br />
            Guess the song before it finishes.
            <br />
            <p className="text-sm mt-2">
              Current Stage:{" "}
              <span className={getStageColor(stage, "text")}>
                {stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase()}
              </span>
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 items-center w-full">
          <GuessBoxes guesses={guesses} />
          <SearchBar
            onGuess={(guess) => {
              setGuesses((prev) => [...prev, { name: guess.name, isCorrect: guess.url === chosenSong?.url }]);
              if (guess.url === chosenSong?.url) {
                setIsGameOver(true);
              } else if (Object.keys(Stage).indexOf(stage) < Object.keys(Stage).length - 1) {
                setStage(Object.keys(Stage)[Object.keys(Stage).indexOf(stage) + 1] as keyof typeof Stage);
              }
            }}
          />
          <CustomAudioPlayer audioUrl={audioUrl} onStageSkip={handleStageSkip} stage={stage} setStage={setStage} />
        </CardContent>
        <CardFooter className="flex items-center justify-center text-muted-foreground/30">
          {chosenSong ? `${chosenSong.title} - ${chosenSong.artist}` : "Loading..."}
        </CardFooter>
      </Card>
      {isGameOver && <GameOver />}
    </div>
  );
}

function GuessBoxes({ guesses }: { guesses: Guess[] }) {
  return (
    <div className="space-y-2 w-full">
      {Array.from({ length: 7 }).map((_, index) => {
        const variant = () => {
          if (!guesses[index]) return "default";
          else if (guesses[index]?.name === "SKIP") return "skip";
          else if (guesses[index]?.isCorrect) return "green";
          else return "red";
        };
        return (
          <Input variant={variant()} key={index} value={guesses[index]?.name || ""} className="text-center" disabled />
        );
      })}
    </div>
  );
}

function GameOver() {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center">
      <Card className="w-full max-w-lg animate-fade-in-up duration-500">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">Game Over</CardTitle>
        </CardHeader>
        <CardFooter className="flex items-center justify-center">
          <Button onClick={() => (window.location.href = "/")} className="w-full">
            Play Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
