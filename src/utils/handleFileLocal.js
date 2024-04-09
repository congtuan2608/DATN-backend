import fs from "fs";
import { promisify } from "util";
const unlinkAsync = promisify(fs.unlink);

export const removeFiles = async (files) => {
  if (files.length) {
    await Promise.all(files.map(async (file) => await unlinkAsync(file.path)));
  } else {
    if (files.path) await unlinkAsync(files.path);
  }
};
