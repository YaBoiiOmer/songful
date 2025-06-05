"use server";

import ytdl from "@distube/ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import { APP_CONFIG } from "@/config";
import { spawn } from "child_process";
import tmp from "tmp";

async function downloadPreviewToTempFile(url: string, seconds: number): Promise<[string, () => void]> {
  return new Promise((resolve, reject) => {
    tmp.file({ postfix: ".mp3" }, (err, path, fd, cleanupCallback) => {
      if (err) return reject(err);
      const stream = ytdl(url, { filter: "audioonly", quality: "lowestaudio" });
      ffmpeg(stream)
        .audioCodec("libmp3lame")
        .duration(seconds)
        .format("mp3")
        .on("end", () => {
          resolve([path, cleanupCallback]);
        })
        .on("error", reject)
        .save(path);
    });
  });
}

// Helper: Find first sound timestamp using silencedetect
async function getFirstSoundTimestamp(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = ["-i", filePath, "-af", "silencedetect=d=0.5", "-f", "null", "-"];
    const ffmpegProc = spawn("ffmpeg", ffmpegArgs);
    let stderr = "";
    ffmpegProc.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    ffmpegProc.on("close", () => {
      const match = stderr.match(/silence_end: ([\d.]+)/);
      if (match) {
        resolve(parseFloat(match[1]));
      } else {
        resolve(0);
      }
    });
    ffmpegProc.on("error", reject);
  });
}

export async function downloadSong(
  url: string,
  title: string
): Promise<{
  success: boolean;
  message: string;
  title: string | undefined;
  author: string | undefined;
  filePath: string;
}> {
  const info = await ytdl.getBasicInfo(url);
  const filename = info.videoDetails.title.replace(/['"|]/g, "");
  const outputPath = `${APP_CONFIG.outputDir}/${filename}.mp3`;

  const [previewPath, cleanupCallback] = await downloadPreviewToTempFile(url, 8);

  const startTime = await getFirstSoundTimestamp(previewPath);
  console.log("First sound timestamp:", startTime);
  cleanupCallback();

  return new Promise((resolve, reject) => {
    ffmpeg(ytdl(url, { filter: "audioonly" }))
      .audioCodec("libmp3lame")
      .setStartTime(startTime)
      .duration(APP_CONFIG.songDuration)
      .format("mp3")
      .on("end", () => {
        resolve({
          success: true,
          message: `Downloaded '${info.videoDetails.title}' by ${info.videoDetails.author.name} finished.`,
          title: info.videoDetails.title,
          author: info.videoDetails.author.name,
          filePath: outputPath,
        });
      })
      .on("error", (error) => {
        reject({
          success: false,
          message: `Error downloading: ${error.message}`,
        });
      })
      .save(outputPath);
  });
}
