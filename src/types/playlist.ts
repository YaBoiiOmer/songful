import { Song } from "./song";

export type Playlist = {
  id: string;
  name: string;
  addedAt: Date;
  songs: Song[];
};

export type CreatePlaylist = Omit<Playlist, "addedAt">;
