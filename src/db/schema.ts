import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const playlistsTable = sqliteTable("playlists", {
  playlistId: text("playlist_id").primaryKey(),
  name: text("name").notNull(),
  addedAt: integer({ mode: "timestamp" }).default(new Date()),
});
