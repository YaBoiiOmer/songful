import { APP_CONFIG, spotify } from "@/config";
import ytsr from "@distube/ytsr";
import fs from "fs";
import { downloadSong } from "./lib/download-song";

export interface Settings {
  spotifyPlaylistUrl: string;
}

export interface Song {
  name: string;
  artists: string[];
  album: string;
  url: string;
  filePath: string;
  spotifyTrackId: string;
}

export interface DownloadedSong extends Song {
  number: number;
  total: number;
}

const defaultSettings: Settings = {
  spotifyPlaylistUrl: "",
};

let settings: Settings = await loadSettings();
let songs: Song[] = await loadSongs();

async function loadSettings() {
  try {
    if (!fs.existsSync(APP_CONFIG.outputDir)) {
      fs.mkdirSync(APP_CONFIG.outputDir, { recursive: true });
    }
    if (!fs.existsSync(APP_CONFIG.settingsPath)) {
      fs.writeFileSync(APP_CONFIG.settingsPath, JSON.stringify(defaultSettings, null, 2));
    }
    const settingsFile = fs.readFileSync(APP_CONFIG.settingsPath, "utf8");
    return JSON.parse(settingsFile) as Settings;
  } catch (error) {
    console.error("Failed to get settings, returning default settings:", error);
    return defaultSettings;
  }
}

export async function updateSettings(newSettings: Settings) {
  try {
    const oldSettings = settings;
    fs.writeFileSync(APP_CONFIG.settingsPath, JSON.stringify(newSettings, null, 2));
    settings = newSettings;
    const isNewPlaylist = newSettings.spotifyPlaylistUrl !== oldSettings.spotifyPlaylistUrl;
    if (isNewPlaylist) {
      songs = await loadSongs(true);
    }
    return {
      isNewPlaylist,
      songsLoaded: songs.length,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("404 - Not Found")) {
      console.error("Playlist not found, returning default settings");
      return {
        error: "Playlist not found",
      };
    }

    console.error("Failed to save settings:", error);
  }
}

export async function getSettings() {
  if (!settings) {
    settings = await loadSettings();
  }
  return settings;
}

async function loadSongs(newPlaylist: boolean = false) {
  const settings = await getSettings();
  if (!fs.existsSync(APP_CONFIG.outputDir)) {
    fs.mkdirSync(APP_CONFIG.outputDir, { recursive: true });
  }
  if (!newPlaylist && fs.existsSync(APP_CONFIG.songsPath)) {
    console.log("Loading songs from file:", APP_CONFIG.songsPath);
    const songsFile = fs.readFileSync(APP_CONFIG.songsPath, "utf8");
    return JSON.parse(songsFile) as Song[];
  }

  console.log("Songs file not found, Loading songs from Spotify:");
  const playlistId = settings.spotifyPlaylistUrl.split("https://open.spotify.com/playlist/")[1];

  const playlist = await spotify.playlists.getPlaylist(playlistId);
  const concatArtists = (artists: any[]) => artists.map((artist) => artist.name).join(", ");
  const artistNames = (artists: any[]) => artists.map((artist) => artist.name as string);

  let songsFailed = 0;

  const songs = await Promise.all(
    playlist.tracks.items.map(async (item) => {
      const searchQuery = `${concatArtists(item.track.artists)} - ${item.track.name} Lyrics Audio`;
      const search = await ytsr(searchQuery, { type: "video", limit: 1 });
      const video = search.items[0];
      try {
        const result = await downloadSong(video.url, item.track.name);
        if (!result.success) {
          console.error("Failed to download song:", result.message);
          songsFailed++;
          return undefined;
        }
        return {
          name: item.track.name,
          artists: artistNames(item.track.artists),
          album: item.track.album.name,
          url: video.url,
          filePath: result.filePath,
          spotifyTrackId: item.track.id,
        };
      } catch (error) {
        console.error("Failed to download song:", error);
        songsFailed++;
        return undefined;
      }
    })
  );

  fs.writeFileSync(APP_CONFIG.songsPath, JSON.stringify(songs, null, 2));

  return songs.filter((song) => song !== undefined);
}

export async function getSongs(forceLoad: boolean = false) {
  if (!songs || forceLoad) {
    songs = await loadSongs();
  }
  return songs;
}

export async function getRandomSong() {
  const songs = await getSongs(true);
  return songs[Math.floor(Math.random() * songs.length)];
}
