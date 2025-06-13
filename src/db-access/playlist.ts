import db from "../db";
import { CreatePlaylist, Playlist } from "@/types/playlist";

const includeSongs = { include: { songs: true } };

export async function createPlaylist(data: CreatePlaylist): Promise<Partial<Playlist>> {
  return await db.playlist.create({
    data: {
      ...data,
      songs: {
        create: data.songs.map((song) => ({
          song: { connect: { id: song.id } },
        })),
      },
    },
  });
}

export async function getPlaylistById(id: Playlist["id"]): Promise<Partial<Playlist> | null> {
  return await db.playlist.findUnique({
    where: { id },
  });
}
