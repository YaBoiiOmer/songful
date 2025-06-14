import { createPlaylist, getPlaylistById, getPlaylists } from "@/db-access/playlist";
import { CreatePlaylist, Playlist } from "@/types/playlist";

export async function createPlaylistUseCase(data: CreatePlaylist) {
  return await createPlaylist(data);
}

export async function getPlaylistByIdUseCase(id: Playlist["id"]) {
  return await getPlaylistById(id);
}

export async function getPlaylistsUseCase() {
  return await getPlaylists();
}
