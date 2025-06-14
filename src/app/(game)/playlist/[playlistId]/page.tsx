"use client";

import { useEffect, useState } from "react";
import useRandomSong, { SongDetails } from "../../../../components/hooks/use-random-song";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsButton from "@/components/settings-button";
import { SearchBar } from "./components/search-bar";
import { Input } from "@/components/ui/input";
import { CustomAudioPlayer } from "./components/audio-player";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getStageColor, Stage } from "./components/stage";

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

  if (!chosenSong)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">🎶 Songful 🎶</CardTitle>
            <CardDescription className="text-center">Loading your song...</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          </CardContent>
        </Card>
      </div>
    );

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
      </Card>
      {isGameOver && <GameOver song={chosenSong} guesses={guesses} stage={stage} />}
    </div>
  );
}

function GuessBoxes({ guesses }: { guesses: Guess[] }) {
  const formatGuess = (guess: Guess | undefined, index: number) => {
    if (!guess) return <Input variant="default" key={index} value={""} className="text-center" disabled />;
    if (guess.isCorrect) {
      return <Input variant="green" key={index} value={`✓ ${guess.name}`} className="text-center" disabled />;
    } else if (guess.name === "SKIP") {
      return <Input variant="skip" key={index} value={`→ ${guess.name}`} className="text-center" disabled />;
    }
    return <Input variant="red" key={index} value={`✗ ${guess.name}`} className="text-center" disabled />;
  };

  return (
    <div className="space-y-2 w-full">
      {Array.from({ length: 7 }).map((_, index) => {
        return formatGuess(guesses[index], index);
      })}
    </div>
  );
}

function GameOver({ song, guesses, stage }: { song: SongDetails; guesses: Guess[]; stage: keyof typeof Stage }) {
  const SpotifyEmbed = () => (
    <iframe
      src={`https://open.spotify.com/embed/track/${song.spotifyTrackId}`}
      className="rounded-xl border-2 border-foreground"
      height="84"
      allow="encrypted-media"
    />
  );
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center">
      <Card className="w-full max-w-lg animate-fade-in-up duration-500 ">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">Game Over</CardTitle>
          <CardDescription className="text-center">
            You guessed{" "}
            <span className="font-bold text-white">
              {song.title} - {song.artist}
            </span>{" "}
            in <span className={`font-bold ${getStageColor(stage, "text")}`}>{guesses.length}</span> guesses.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <SpotifyEmbed />
        </CardContent>
        <CardFooter className="flex items-center justify-center">
          <Button onClick={() => (window.location.href = "/")} className="w-1/2" variant="outline">
            Play Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
