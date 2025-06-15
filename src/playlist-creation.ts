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

export async function getAllPlaylistItems(playlistId: string) {
  const playlist = await spotify.playlists.getPlaylist(playlistId);
  if (!playlist) {
    throw new Error("Playlist not found");
  }
  let items = await spotify.playlists.getPlaylistItems(playlistId);
  const tracks = [...items.items.map((item) => item.track)];
  let offset = items.items.length;
  while (items.next) {
    items = await spotify.playlists.getPlaylistItems(playlistId, undefined, undefined, undefined, offset);
    tracks.push(...items.items.map((item) => item.track));
    offset += items.items.length;
  }

  return tracks;
}

export async function handlePlaylistCreation(playlistId: string): Promise<Partial<Playlist>> {
  try {
    const playlist = await spotify.playlists.getPlaylist(playlistId);
    if (!playlist) {
      throw new Error("Playlist not found");
    }
    const songs = await getAllPlaylistItems(playlistId);
    console.log("Playlist found:", playlist.name, "with", songs.length, "songs");

    const { existingSongs, missingSongs } = await sortSongs(songs);
    console.log("Expecting to download", missingSongs.length, "songs");
    const downloadedSongs = await processBatch(missingSongs, downloadMissingSong, 15, 2000);
    console.log(downloadedSongs);
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

async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R | null>,
  batchSize: number = 3,
  delayMs: number = 1000
) {
  const results: R[] = [];
  console.log(`Processing ${items.length} items in batches of ${batchSize}`);

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(items.length / batchSize)}`);

    const batchResults = await Promise.allSettled(batch.map(processor));
    const batchSuccesses = getSettledResults(batchResults);
    results.push(...batchSuccesses);

    console.log(`Batch complete. ${batchSuccesses.length}/${batch.length} items processed successfully`);

    if (i + batchSize < items.length) {
      console.log(`Waiting ${delayMs}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.log(`All batches complete. Total successful items: ${results.length}/${items.length}`);
  return results;
}

function getSettledResults<T>(results: PromiseSettledResult<T | null>[]) {
  return results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value)
    .filter((obj) => obj !== null && obj !== undefined);
}
