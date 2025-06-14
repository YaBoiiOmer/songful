import { getSongsByPlaylistIdUseCase } from "@/use-cases/song";
import GameComponent from "./components/game";
import { getPlaylistByIdUseCase } from "@/use-cases/playlist";

interface GamePageProps {
  params: Promise<{ playlistId: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { playlistId } = await params;
  const playlist = await getPlaylistByIdUseCase(playlistId);
  const songs = await getSongsByPlaylistIdUseCase(playlistId);
  if (!playlist) {
    return <div>Playlist not found</div>;
  }
  return <GameComponent playlist={playlist} songs={songs} />;
}
