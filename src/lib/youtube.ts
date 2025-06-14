import { DownloadSong } from "@/types/song";
import { youtube } from "@googleapis/youtube";

const ytClient = youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

const YOUTUBE_PREFIX = "https://www.youtube.com/watch?v=";

/*
Returns the first video url that matches the query.
*/

export async function searchYoutubeSong(song: DownloadSong) {
  const query = `${song.artists.map((artist) => artist.name).join(", ")} - ${song.name} Lyrics Audio`;
  const response = await ytClient.search.list({
    part: ["id"],
    type: ["video"],
    q: query,
    maxResults: 1,
    order: "relevance",
  });
  const videoId = response.data.items?.[0]?.id?.videoId;
  return videoId ? YOUTUBE_PREFIX + videoId : null;
}
