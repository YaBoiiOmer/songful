"use server";

import ytdl from "@distube/ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import { APP_CONFIG } from "@/config";
import { spawn } from "child_process";
import tmp from "tmp";

type DownloadSongResult = {
  success: boolean;
  message: string;
  title: string | undefined;
  author: string | undefined;
  filePath: string;
};

async function downloadFullAudioToTempFile(url: string): Promise<[string, () => void]> {
  return new Promise((resolve, reject) => {
    tmp.file({ postfix: ".mp3" }, (err, path, fd, cleanupCallback) => {
      if (err) return reject(err);
      const stream = ytdl(url, { filter: "audioonly" });
      ffmpeg(stream)
        .audioCodec("libmp3lame")
        .format("mp3")
        .on("end", () => resolve([path, cleanupCallback]))
        .on("error", reject)
        .save(path);
    });
  });
}

// Helper: Find first sound timestamp using silencedetect
async function getFirstSoundTimestamp(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = ["-i", filePath, "-af", "silencedetect=d=0.05", "-f", "null", "-"];
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

export async function downloadSong(url: string, title: string): Promise<DownloadSongResult> {
  const info = await ytdl.getBasicInfo(url);
  const filename = info.videoDetails.title.replace(/['"|/()]/g, "");
  const outputPath = `${APP_CONFIG.outputDir}/${filename}.mp3`;

  const [audioPath, cleanupCallback] = await downloadFullAudioToTempFile(url);
  const startTime = await getFirstSoundTimestamp(audioPath);
  console.log("First sound timestamp:", startTime, outputPath);
  return new Promise<DownloadSongResult>((resolve, reject) => {
    ffmpeg(audioPath)
      .audioCodec("libmp3lame")
      .setStartTime(startTime > 40 ? 0 : startTime)
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
        cleanupCallback();
      })
      .on("error", (error) => {
        reject({
          success: false,
          message: `Error downloading: ${error.message}`,
        });
        cleanupCallback();
      })
      .save(outputPath);
  });
}
