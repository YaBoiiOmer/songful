import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const playlistsTable = sqliteTable("playlists", {
  playlistId: text("playlist_id").primaryKey(),
  name: text("name").notNull(),
  addedAt: integer({ mode: "timestamp" }).notNull(),
});

export const songsTable = sqliteTable("songs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  cloudinaryUrl: text("cloudinary_url").notNull(),
  addedAt: integer({ mode: "timestamp" }).notNull(),
});

export const songArtistsTable = sqliteTable("song_artists", {
  songId: text("song_id")
    .primaryKey()
    .references(() => songsTable.id),
  artistId: text("artist_id")
    .notNull()
    .references(() => artistsTable.id),
});

export const artistsTable = sqliteTable("artists", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});
