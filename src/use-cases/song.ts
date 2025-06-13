import { createSong, getAllSongs, getSongById } from "@/db-access/song";
import { CreateSong, Song } from "@/types/song";

export async function createSongUseCase(data: CreateSong): Promise<Song> {
  return await createSong(data);
}

export async function getSongByIdUseCase(id: Song["id"]) {
  return await getSongById(id);
}

export async function getAllSongsUseCase() {
  return await getAllSongs();
}
