import { DownloadedSong } from "@/settings";

export async function GET(req: Request) {
  const randomSong: DownloadedSong = {
    name: "Song 1",
    artists: ["Artist 1", "Artist 2"],
    album: "Album 1",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    filePath: "song1.mp3",
    number: 1,
    total: 1,
  };

  const stream = new ReadableStream({
    async start(controller) {
      const sendSongProgressEvent = (data: DownloadedSong) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };
      sendSongProgressEvent(randomSong);
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
