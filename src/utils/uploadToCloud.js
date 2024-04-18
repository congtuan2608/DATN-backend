import cloudinary from "../services/cloudinary.js";
import { removeFiles } from "./handleFileLocal.js";

export async function uploadFile(file, folder, type) {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: type ?? "auto",
  });
  return result;
}

//upload image and return url, media type
export async function uploadFileAndReturn(files) {
  const results = await Promise.all(
    files.map(async (file) => {
      const { secure_url, resource_type } = await uploadFile(
        file.path,
        "images"
      );
      return { url: secure_url, media_type: resource_type };
    })
  );
  await removeFiles(files);
  return results;
}
