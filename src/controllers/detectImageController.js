import vision from "@google-cloud/vision";
import TeachableMachine from "@sashido/teachablemachine-node";
import fs from "fs";
import { serverErrorHandler } from "../utils/errorHandler.js";
import { uploadFile } from "../utils/handleFileCloud.js";
import { removeFiles } from "../utils/handleFileLocal.js";
import { CONFIG_GOOGLE_COULD } from "./../configs/googleVisionKey/google-vision-key.js";

export const googleVisionDetectHandler = async (req, res) => {
  try {
    // console.log({ ...req.files });
    const client = new vision.ImageAnnotatorClient(CONFIG_GOOGLE_COULD);
    const request = {
      image: {
        content: fs.readFileSync(req.files[0].path),
      },
    };
    const [result] = await client.objectLocalization(request);
    const objects = result.localizedObjectAnnotations;
    await removeFiles(req.files);
    return res.status(200).json(objects);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
// loading model
const model = new TeachableMachine({
  modelUrl: process.env.URL_TEACHABLE_MACHINE,
});
export const tensorflowDetectHandler = async (req, res) => {
  try {
    //upload file to store
    const uploads = await Promise.all(
      req.files.map(async (file) => await uploadFile(file.path, "images"))
    );

    //image recognition
    const results = await Promise.all(
      uploads.map(async (upload) => {
        const data = await model.classify({
          imageUrl: upload.secure_url,
        });

        return data.filter((result) => result.score >= 0.3);
      })
    );
    // remove local file when uploaded to cloud
    await removeFiles(req.files);

    return res.status(200).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
