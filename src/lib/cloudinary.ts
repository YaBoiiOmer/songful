import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
cloudinary.config({
  secure: true,
});

export function uploadSong(playlistId: string, songName: string) {
  console.log("uploading song to cloudinary");
  const options: UploadApiOptions = {
    resource_type: "video",
    overwrite: true,
    folder: "songs",
    public_id: "omer_song.mp3",
  };

  try {
    return cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.error("An error occurred while uploading song to cloudinary", error);
      }
      return result;
    });
  } catch (err) {
    console.error("Caught error while trying to upload song to cloudinary", err);
  }
}
