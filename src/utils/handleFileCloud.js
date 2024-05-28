import cloudinary from "../services/cloudinary.js";
import { removeFiles } from "./handleFileLocal.js";

export const deleteFile = async (public_id, options) => {
  const result = await cloudinary.uploader.destroy(public_id, options);
  return result;
};

export async function uploadFile(file, folder, type) {
  const result = await cloudinary.uploader.upload(file, {
    folder: process.env.MODE !== "DEV" ? "assets" : folder,
    resource_type: type ?? "auto",
  });
  return result;
}

//upload image and return url, media type
export async function uploadFileAndReturn(
  files,
  folder = "images",
  isRemove = true
) {
  const callback = async (file) => {
    const { url, secure_url, resource_type, ...other } = await uploadFile(
      file.path,
      folder
    );
    isRemove && removeFiles(file);
    return { ...other, media_type: resource_type, url: secure_url };
  };

  if (!Array.isArray(files)) {
    return callback(files);
  }

  const results = await Promise.all(files.map(async (file) => callback(file)));
  return results;
}
