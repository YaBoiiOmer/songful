import { Song } from "./song";

export type Playlist = {
  id: string;
  name: string;
  image: string;
  addedAt: Date;
  songs?: Song[];
};

export type PlaylistWithSongs = Playlist & {
  songs: Song[];
};

export type CreatePlaylist = Omit<PlaylistWithSongs, "addedAt">;
