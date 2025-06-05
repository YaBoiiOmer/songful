import { getRandomSong } from "@/settings";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export async function GET(request: NextRequest) {
  const MAX_ATTEMPTS = 5;
  let attempt = 0;
  let song = null;
  let songPath = null;

  while (attempt < MAX_ATTEMPTS) {
    song = await getRandomSong();
    songPath = song.filePath;
    if (fs.existsSync(songPath)) {
      const stat = fs.statSync(songPath);
      const fileStream = fs.createReadStream(songPath);
      return new NextResponse(fileStream as any, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": stat.size.toString(),
          "X-Song-Title": song.name,
          "X-Song-Artist": song.artists.join(", "),
          "X-Spotify-Url": song.url,
        },
      });
    }
    attempt++;
  }

  return NextResponse.json({ error: "No valid song file found after multiple attempts." }, { status: 404 });
}
