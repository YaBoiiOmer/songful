import { createPlaylistUseCase, getPlaylistByIdUseCase } from "./use-cases/playlist";
import { spotify } from "./config";
import { createSongUseCase, getSongByIdUseCase } from "./use-cases/song";
import { Track } from "@spotify/web-api-ts-sdk";
import { downloadSong } from "./lib/download-song";
import { Artist } from "./types/artist";
import { Song } from "./types/song";

export async function updatePlaylist({ url }: { url: string }) {
  const playlistId = url.split("https://open.spotify.com/playlist/")[1];
  if (!playlistId) {
    throw new Error("Invalid playlist URL");
  }
  console.log("playlistId", playlistId);
  const playlist = await getPlaylistByIdUseCase(playlistId);
  if (!playlist) {
    console.log("playlist not found in database, creating playlist");
    await handlePlaylistCreation(playlistId);
  }
  console.log("playlist found in database!");
}

export async function handlePlaylistCreation(playlistId: string) {
  new Promise(async (resolve, reject) => {
    const playlist = await spotify.playlists.getPlaylist(playlistId).catch((error) => {
      reject(error);
    });
    if (!playlist) return reject(new Error("Playlist not found"));
    const songs = playlist.tracks.items.map((item) => item.track);
    const { existingSongs, missingSongs } = await sortSongs(songs);
    const newSongs = (await Promise.all(missingSongs.map(downloadMissingSong))).filter(
      (song) => song !== null
    ) as Song[];
    const allSongs = [...existingSongs, ...newSongs];
    if (allSongs.length === 0) {
      reject(new Error("No songs found to create playlist with"));
    }
    const createdPlaylist = await createPlaylistUseCase({
      id: playlistId,
      name: playlist.name,
      songs: allSongs,
    });
    resolve(createdPlaylist);
  });
}
async function sortSongs(songs: Track[]) {
  const existingSongs: Song[] = [];
  const missingSongs = await Promise.allSettled(
    songs.map(async (song) => {
      const findSong = await getSongByIdUseCase(song.id);
      if (findSong) {
        console.log("---found song", song.id);
        existingSongs.push(findSong);
        return null;
      }
      const artists = song.artists.map((artist) => ({ id: artist.id, name: artist.name } as Artist));
      return {
        id: song.id,
        name: song.name,
        artists,
      };
    })
  ).then((songs) => songs.filter((song) => song !== null));
  return { existingSongs, missingSongs };
}

async function downloadMissingSong(song: { id: string; name: string; artists: Artist[] }) {
  try {
    const result = await downloadSong(song);
    if (result.success) {
      return await createSongUseCase({
        id: song.id,
        name: song.name,
        cloudinaryUrl: result.cloudinaryUrl,
        youtubeUrl: result.youtubeUrl,
        artists: song.artists,
      });
    } else {
      console.error(result.error);
      return null;
    }
  } catch (err) {
    console.error("Error downloading song:", err);
    return null;
  }
}
