import { createSong, getAllSongs, getSongById, getSongsByPlaylistId } from "@/db-access/song";
import { Playlist } from "@/types/playlist";
import { CreateSong, Song } from "@/types/song";

export async function createSongUseCase(data: CreateSong): Promise<Song> {
  return await createSong(data);
}

export async function getSongByIdUseCase(id: Song["id"]) {
  return await getSongById(id);
}

export async function getSongsByPlaylistIdUseCase(playlistId: Playlist["id"]) {
  return await getSongsByPlaylistId(playlistId);
}

export async function getAllSongsUseCase() {
  return await getAllSongs();
}
