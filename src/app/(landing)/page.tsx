import { spotify } from "@/config";
import DownloaderForm from "./downloader-form";
import ytsr from "@distube/ytsr";
import { downloadSong } from "./actions";

export default async function Home() {
  const playlist = await spotify.playlists.getPlaylist("10uudHrhaGKr8OzfeiMgv9?si=35e6bf61130e4e55");
  const songs = playlist.tracks.items.map((item) => ({
    name: item.track.name,
    artists: item.track.artists.map((artist) => artist.name).join(", "),
    album: item.track.album.name,
  }));

  const search = await ytsr(`${songs[0].name} Lyrics`, { type: "video", limit: 1 });
  const video = search.items[0];
  downloadSong(video.url);

  return (
    <div className="w-screen h-screen">
      <div className="flex flex-col items-center justify-center h-full gap-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold">Song Downloader</h1>
          <h2 className="text-2xl font-semibold">Download your favorite songs from YouTube</h2>
        </div>
        <DownloaderForm />
      </div>
    </div>
  );
}
