import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from "cloudinary";
cloudinary.config({
  secure: true,
});

export function uploadSong() {
  const options: UploadApiOptions = {
    resource_type: "video",
    overwrite: true,
    folder: "songs",
  };

  let uploadStream: any;
  const promise = new Promise<UploadApiResponse>((resolve, reject) => {
    uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.error("An error occurred while uploading song to cloudinary", error);
        reject(error);
      } else {
        resolve(result as UploadApiResponse);
      }
    });
  });

  return { uploadStream, promise };
}
