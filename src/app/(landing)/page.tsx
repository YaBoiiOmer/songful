import { getPlaylistsUseCase } from "@/use-cases/playlist";
import RiseAnimation from "./rise-animation";
import SettingsButton from "@/components/settings-button";
import PlaylistSelection from "./playlist-selection";

export default async function Home() {
  const playlists = await getPlaylistsUseCase();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <SettingsButton />
      <div className="container mx-auto px-4 py-16">
        <RiseAnimation>
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Songful</h1>
              <p className="text-xl text-muted-foreground">Test your music knowledge and have fun guessing songs!</p>
            </div>
            <PlaylistSelection playlists={playlists} />
          </div>
        </RiseAnimation>
      </div>
    </div>
  );
}
