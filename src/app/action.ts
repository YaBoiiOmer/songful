"use server";

import fs from "fs";
import ytdl from "@distube/ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import { APP_CONFIG } from "@/config";

export async function downloadSong(
  url: string
): Promise<{ success: boolean; message: string; title: string; author: string }> {
  const stream = ytdl(url, { filter: "audioonly" });
  const info = await ytdl.getBasicInfo(url);
  const outputPath = `${APP_CONFIG.outputDir}/${info.videoDetails.title}.mp3`;

  return new Promise((resolve, reject) => {
    console.log("Starting to download song: ", info.videoDetails.title, "by", info.videoDetails.author.name);

    // ffmpeg(stream).audioCodec("libmp3lame").setStartTime(0).duration(30).format("mp3").save(outputPath);

    stream
      .pipe(fs.createWriteStream(outputPath))
      .on("close", () => {
        resolve({
          success: true,
          message: `Downloaded '${info.videoDetails.title}' by ${info.videoDetails.author.name} finished.`,
          title: info.videoDetails.title,
          author: info.videoDetails.author.name,
        });
      })
      .on("error", (error) => {
        reject({
          success: false,
          message: `Error downloading: ${error.message}`,
        });
      });
  });
}
