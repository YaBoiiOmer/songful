import { Artist } from "./artist";

export type Song = {
  id: string;
  name: string;
  youtubeUrl: string;
  cloudinaryUrl: string;
  addedAt: Date;
  artists: Artist[];
};
export type PreUploadedSong = Omit<Song, "youtubeUrl" | "cloudinaryUrl" | "addedAt">;
export type CreateSong = Omit<Song, "addedAt">;
export type DownloadSong = Omit<Song, "youtubeUrl" | "cloudinaryUrl" | "addedAt">;
