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
    if (!song) {
      attempt++;
      continue;
    }
    songPath = song.filePath;
    if (fs.existsSync(songPath)) {
      const stat = fs.statSync(songPath);

      const base64Title = Buffer.from(song.name).toString("base64");
      const base64Artist = Buffer.from(song.artists.join(", ")).toString("base64");

      const fileStream = fs.createReadStream(songPath);
      const headers = {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": stat.size.toString(),
          "X-Song-Title": base64Title,
          "X-Song-Artist": base64Artist,
          "X-Spotify-Url": song.url,
        },
      };
      return new NextResponse(fileStream as any, headers);
    }
    attempt++;
  }

  return NextResponse.json({ error: "No valid song file found after multiple attempts." }, { status: 404 });
}
