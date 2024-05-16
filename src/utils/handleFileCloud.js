import cloudinary from "../services/cloudinary.js";
import { removeFiles } from "./handleFileLocal.js";

export async function uploadFile(file, folder, type) {
  const result = await cloudinary.uploader.upload(file, {
    folder: process.env.MODE !== "DEV" ? "assets" : folder,
    resource_type: type ?? "auto",
  });
  return result;
}

//upload image and return url, media type
export async function uploadFileAndReturn(files, folder = "images") {
  const results = await Promise.all(
    files.map(async (file) => {
      const { url, secure_url, resource_type, ...other } = await uploadFile(
        file.path,
        folder
      );
      return { ...other, media_type: resource_type, url: secure_url };
    })
  );
  await removeFiles(files);
  return results;
}
