import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export const APP_CONFIG = {
  outputDir: "./songs",
  songsPath: "./songs/songs.json",
  settingsPath: "./settings.json",
  songDuration: 30,
};

export const spotify = SpotifyApi.withClientCredentials(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!
);
