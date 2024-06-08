import vision from "@google-cloud/vision";
import TeachableMachine from "@sashido/teachablemachine-node";
import axios from "axios";
import { Image, createCanvas } from "canvas";
import fs from "fs";
import { GARBAGE_INFO } from "../data/garbageInfo.js";
import { getRandomColor } from "../utils/color.js";
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

export const returnFontSizes = (width, height) => {
  if (width < 100) return "10px";
  if (width < 200) return "15px";
  if (width < 300) return "20px";
  if (width < 400) return "25px";
  if (width < 500) return "30px";
  if (width < 600) return "35px";
  if (width < 700) return "40px";
  if (width < 800) return "45px";
  if (width < 900) return "50px";
  if (width < 1000) return "55px";
  if (width < 1100) return "60px";
  if (width < 1200) return "65px";
  if (width < 1300) return "70px";
  if (width < 1400) return "75px";
  if (width < 1500) return "80px";
  if (width < 1600) return "85px";

  return "105px";
};
export const returnLineWidth = (width, height) => {
  if (width < 100) return 3;
  if (width < 200) return 4;
  if (width < 300) return 5;
  if (width < 400) return 6;
  if (width < 500) return 7;
  return 8;
};

export const roboflowDetectHandler = async (req, res) => {
  try {
    const { confidence = 5, overlap = 5 } = req.body;
    if (req.files.length === 0) return res.status(400).json("No file uploaded");
    const results = await Promise.all(
      req.files.map(async (img) => {
        const image = fs.readFileSync(img.path, {
          encoding: "base64",
        });

        const result = await axios({
          method: "POST",
          url: "https://detect.roboflow.com/garbage-detection-vixig/2",
          params: {
            api_key: "dEygFcDyq7JIHkIxf0KP",
            confidence,
            overlap,
          },
          data: image,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        const imgCanvas = new Image();
        imgCanvas.src = fs.readFileSync(img.path);

        const canvas = createCanvas(
          imgCanvas.width,
          imgCanvas.height
          // result?.data?.image.width,
          // result?.data?.image.height
        );
        const context = canvas.getContext("2d");

        context.drawImage(
          imgCanvas,
          0,
          0,
          imgCanvas.width,
          imgCanvas.height
          // result?.data?.image.width,
          // result?.data?.image.height
        );

        result?.data.predictions.forEach((prediction, index) => {
          // add rectangle
          const left = prediction.x - prediction.width / 2;
          const top = prediction.y - prediction.height / 2;
          const color = getRandomColor();
          context.beginPath();
          context.rect(left, top, prediction.width, prediction.height);
          context.lineWidth = returnLineWidth(
            imgCanvas.width,
            imgCanvas.height
          );
          context.strokeStyle = color;
          context.fillStyle = color;
          context.stroke();
          // Add text inside the rectangle
          context.font = `${returnFontSizes(
            imgCanvas.width,
            imgCanvas.height
          )} Arial`;
          context.fillStyle = color;
          context.fillText(
            `${prediction.class} (${index + 1})`,
            left,
            top + 70
          );

          //add more information
          result.data.predictions[index] = {
            ...prediction,
            info: GARBAGE_INFO[prediction.class.toLowerCase()],
          };
        });

        // save image to local
        const out = fs.createWriteStream(`${img.path}.png`);
        const stream = canvas.createJPEGStream();
        stream.pipe(out);
        const newSrc = await uploadFile(`${img.path}.png`, "images");

        await removeFiles([{ path: `${img.path}.png` }, img]);

        return { ...result.data, src: newSrc.secure_url };
      })
    );

    return res.status(200).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
