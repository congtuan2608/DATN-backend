import cloudinary from "../services/cloudinary.js";

export async function uploadFile(file, folder, type) {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: type,
  });
  return result;
}
