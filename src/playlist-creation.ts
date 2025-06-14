import { createPlaylistUseCase, getPlaylistByIdUseCase } from "./use-cases/playlist";
import { spotify } from "./config";
import { createSongUseCase, getSongByIdUseCase } from "./use-cases/song";
import { Track } from "@spotify/web-api-ts-sdk";
import { downloadSong } from "./lib/download-song";
import { Artist } from "./types/artist";
import { PreUploadedSong, Song } from "./types/song";
import { Playlist } from "./types/playlist";

export async function updatePlaylist({ url }: { url: string }) {
  const playlistId = url.split("https://open.spotify.com/playlist/")[1].split("?")[0];
  if (!playlistId) {
    throw new Error("Invalid playlist URL");
  }
  const playlist = await getPlaylistByIdUseCase(playlistId);
  if (!playlist) {
    return await handlePlaylistCreation(playlistId);
  }
  return playlist;
}

export async function handlePlaylistCreation(playlistId: string): Promise<Partial<Playlist>> {
  try {
    const playlist = await spotify.playlists.getPlaylist(playlistId);
    if (!playlist) {
      throw new Error("Playlist not found");
    }

    console.log("-fetched playlist from spotify successfully-");
    const songs = playlist.tracks.items.map((item) => item.track);
    const { existingSongs, missingSongs } = await sortSongs(songs);
    console.log("existingSongs:", existingSongs);
    console.log("missingSongs:", missingSongs);
    const downloadedSongs = await Promise.allSettled(missingSongs.map(downloadMissingSong)).then(getSettledResults);
    console.log("---downloadedSongs---", downloadedSongs);

    const playlistSongs = [...existingSongs, ...downloadedSongs];

    if (playlistSongs.length === 0) {
      throw new Error("No songs found to create playlist with");
    }

    const createdPlaylist = await createPlaylistUseCase({
      id: playlistId,
      name: playlist.name,
      image: playlist.images[0]?.url ?? "",
      songs: playlistSongs,
    });
    return createdPlaylist;
  } catch (error) {
    throw error;
  }
}

async function sortSongs(songs: Track[]) {
  const existingSongs: Song[] = [];
  const sortSong = async (song: Track) => {
    const songQuery = await getSongByIdUseCase(song.id);
    if (songQuery) {
      existingSongs.push(songQuery);
      return null;
    }
    const artists = song.artists.map((artist) => ({ id: artist.id, name: artist.name } as Artist));
    return {
      id: song.id,
      name: song.name,
      artists,
    };
  };
  const sortSongPromises = songs.map(sortSong);
  const missingSongs: PreUploadedSong[] = await Promise.allSettled(sortSongPromises).then((missingSongResults) =>
    missingSongResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value)
      .filter((song) => song !== null)
  );
  return { existingSongs, missingSongs };
}

async function downloadMissingSong(song: PreUploadedSong) {
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

function getSettledResults<T>(results: PromiseSettledResult<T | null>[]) {
  return results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value)
    .filter((obj) => obj !== null);
}
