import { spotify } from "@/config";
import DownloaderForm from "./downloader-form";
import ytsr from "@distube/ytsr";
import { downloadSong } from "./actions";
import SettingsButton from "@/components/settings-button";

export default async function Home() {
  return (
    <div className="w-screen h-screen">
      <SettingsButton />
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
