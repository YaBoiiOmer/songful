"use server";

import { revalidatePath } from "next/cache";
import { SettingsFormSchema } from "./settings-form";
import { updateSettings } from "@/use-cases/settings";
import { spotify } from "@/config";
import ytsr from "@distube/ytsr";

export async function saveSettingsAction(data: SettingsFormSchema) {
  try {
    await updateSettings(data);
    downloadSongs(data.spotifyPlaylistUrl);
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

async function downloadSongs(playlistUrl: string) {
  console.log("Downloading songs from playlist:", playlistUrl);
  const playlistId = playlistUrl.split("https://open.spotify.com/playlist/")[1];
  console.log("Searching for playlist:", playlistId);
  const playlist = await spotify.playlists.getPlaylist(playlistId);
  if (!playlist) throw new Error("Failed to get playlist");
  console.log("Playlist:", playlist);

  const songs = playlist.tracks.items.map((item) => ({
    name: item.track.name,
    artists: item.track.artists.map((artist) => artist.name).join(", "),
    album: item.track.album.name,
  }));

  songs.forEach(async (song) => {
    const search = await ytsr(`${song.name} Lyrics`, { type: "video", limit: 1 });
    const video = search.items[0];
    console.log(video.name);
  });

  // downloadSong(video.url);
}
