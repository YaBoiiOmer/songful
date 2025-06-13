"use server";

import ytdl from "@nuclearplayer/ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import { APP_CONFIG } from "@/config";
import { spawn } from "child_process";
import tmp from "tmp";
import { uploadSong } from "./cloudinary";
import { DownloadSong } from "@/types/song";
import ytsr from "@distube/ytsr";

type DownloadSongResult =
  | { success: true; cloudinaryUrl: string; youtubeUrl: string }
  | { success: false; error: string };

async function searchYoutubeSong(song: DownloadSong) {
  const searchQuery = `${song.artists.join(", ")} - ${song.name} Lyrics Audio`;
  const search = await ytsr(searchQuery, { type: "video", limit: 1 });
  const video = search.items[0];
  return video;
}

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
    const ffmpegArgs = ["-i", filePath, "-af", "silencedetect=d=0.08:n=-25dB", "-f", "null", "-"];
    const ffmpegProc = spawn("ffmpeg", ffmpegArgs);
    let stderr = "";

    ffmpegProc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ffmpegProc.on("close", () => {
      const silenceEndMatch = stderr.match(/silence_end: ([\d.]+)/);
      if (silenceEndMatch && parseFloat(silenceEndMatch[1]) < 10) {
        resolve(parseFloat(silenceEndMatch[1]));
      } else {
        resolve(0);
      }
    });
    ffmpegProc.on("error", reject);
  });
}

export async function downloadSong(song: DownloadSong): Promise<DownloadSongResult> {
  const youtubeSearch = await searchYoutubeSong(song);
  const [tempFilePath, cleanTempFile] = await downloadFullAudioToTempFile(youtubeSearch.url);
  const startTime = await getFirstSoundTimestamp(tempFilePath);

  return new Promise((resolve, reject) => {
    const { uploadStream, promise } = uploadSong();

    ffmpeg(tempFilePath)
      .audioCodec("libmp3lame")
      .setStartTime(startTime)
      .duration(APP_CONFIG.songDuration)
      .format("mp3")
      .on("end", () => {
        promise
          .then((result) => {
            resolve({
              success: true,
              cloudinaryUrl: result.secure_url,
              youtubeUrl: youtubeSearch.url,
            });
            cleanTempFile();
          })
          .catch((error) => {
            reject({
              success: false,
              error: `Error uploading to Cloudinary: ${error.message}`,
            });
            cleanTempFile();
          });
      })
      .on("error", (error) => {
        reject({
          success: false,
          error: `Error downloading: ${error.message}`,
        });
        cleanTempFile();
      })
      .pipe(uploadStream);
  });
}
