import axios from "axios";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import {
  default as ContaminatedLocation,
  default as contaminatedLocation,
} from "../models/contaminatedLocation.js";
import ContaminatedType from "../models/contaminatedType.js";
import User from "../models/user.js";
import { getRandomColor } from "../utils/color.js";
import { errorHandler, serverErrorHandler } from "../utils/errorHandler.js";
import {
  deleteFile,
  uploadFile,
  uploadFileAndReturn,
} from "../utils/handleFileCloud.js";
import { removeFiles } from "../utils/handleFileLocal.js";
import { returnFontSizes, returnLineWidth } from "./detectImageController.js";
import { saveHistoryHandler } from "./historyController.js";
//=========================== Contaminated Location Type =======================================

export const getContaminatedTypeHandler = async (req, res) => {
  try {
    const { id } = req.query;

    const results = await ContaminatedType.find();
    return res.status(200).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const createContaminatedTypeHandler = async (req, res) => {
  try {
    const data = req.body;

    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);
    if (!existingUser.role === "user")
      return errorHandler(res, "You are not allowed to create this guide", 403);

    if (req.file) {
      data.asset = await uploadFileAndReturn(req.file, "contaminated-type");
    }
    const result = await ContaminatedType.create(data);
    return res.status(201).json(result);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

//=========================== Contaminated Location =======================================

const checkExistingContaminatedType = async (res, contaminatedType) => {
  if (Array.isArray(contaminatedType)) {
    const data = await Promise.all(
      contaminatedType.map(async (type) => {
        const result = await ContaminatedType.findById(type);
        if (!result) return false;
        else return true;
      })
    );
    return data.includes(false) ? false : true;
  } else {
    const result = await ContaminatedType.findById(contaminatedType);
    if (!result) return false;
    else return true;
  }
};

export const getReportLocationHandler = async (req, res) => {
  try {
    const { page = 0, limit = 20 } = req.query;
    const results = await ContaminatedLocation.find()
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 })
      .populate([
        { path: "reportedBy", select: "fullName avatar lastName firstName" },
        {
          path: "contaminatedType",
          select: "contaminatedType contaminatedName asset",
        },
      ]);

    return res.status(200).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
export const getReportLocationByUserHandler = async (req, res) => {
  try {
    const { page = 0, limit = 10, reportedBy } = req.query;

    const results = await ContaminatedLocation.find({ reportedBy: req.user.id })
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 })
      .populate([
        { path: "reportedBy", select: "fullName avatar lastName firstName" },
        {
          path: "contaminatedType",
          select: "contaminatedType contaminatedName asset",
        },
      ]);

    return res.status(200).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
export const getReportLocationByIdHandler = async (req, res) => {
  try {
    const { id, page = 0, limit = 10 } = req.params;
    if (!id) return errorHandler(res, "Id not found", 404);
    const result = await ContaminatedLocation.findById(id)
      .populate([
        { path: "reportedBy", select: "fullName avatar lastName firstName" },
        {
          path: "contaminatedType",
          select: "contaminatedType contaminatedName asset",
        },
      ])
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 });

    return res.status(200).json(result);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
export const getReportLocationNearbyHandler = async (req, res) => {
  try {
    const { longitude, latitude, distance = 1000 } = req.query;

    if (!(longitude && latitude))
      return errorHandler(res, "longitude & latitude not found", 404);

    const nearbyLocations = await ContaminatedLocation.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: "dist.calculated",
          maxDistance: parseFloat(distance),
          includeLocs: "dist.location",
          spherical: true,
        },
      },
      {
        $match: {
          status: "success",
          clean: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "reportedBy",
          foreignField: "_id",
          as: "reportedBy",
          pipeline: [
            {
              $project: {
                fullName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "contaminatedtypes",
          localField: "contaminatedType",
          foreignField: "_id",
          as: "contaminatedType",
          pipeline: [
            {
              $project: {
                contaminatedType: 1,
                contaminatedName: 1,
                asset: 1,
              },
            },
          ],
        },
      },

      // {
      //   $unwind: "$reportedBy",
      // },
      // {
      //   $unwind: "$contaminatedType",
      // },
    ]);
    return res.status(200).json(nearbyLocations);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

// check image exists trash or not
export const checkImageTrashHandler = async (files, ref) => {
  try {
    const results = await Promise.all(
      files.map(async (img) => {
        const result = await axios({
          method: "POST",
          url: "https://detect.roboflow.com/garbage-detection-vixig/2",
          params: {
            api_key: "dEygFcDyq7JIHkIxf0KP",
            image: img?.url,
            confidence: 20,
            overlap: 20,
          },
        });

        const imgCanvas = await loadImage(img?.url);

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
          // result?.data?.image.width,
          // result?.data?.image.height
          imgCanvas.width,
          imgCanvas.height
        );
        result?.data.predictions.forEach((prediction, index) => {
          // add rectangle
          const left = prediction.x - prediction.width / 2;
          const top = prediction.y - prediction.height / 2;
          const color = getRandomColor();
          context.beginPath();
          context.rect(left, top, prediction.width, prediction.height);
          context.lineWidth = returnLineWidth(
            // result?.data?.image.width,
            // result?.data?.image.height
            imgCanvas.width,
            imgCanvas.height
          );
          context.strokeStyle = color;
          context.fillStyle = color;
          context.stroke();
          // Add text inside the rectangle
          context.font = `${returnFontSizes(
            // result?.data?.image.width,
            // result?.data?.image.height
            imgCanvas.width,
            imgCanvas.height
          )} Arial`;
          context.fillStyle = color;
          context.fillText(
            `${prediction.class} (${index + 1})`,
            left,
            top + 70
          );
        });
        const out = fs.createWriteStream(
          `./src/uploads/${img.original_filename}.png`
        );
        const stream = canvas.createJPEGStream();
        stream.pipe(out);
        const newSrc = await uploadFile(
          `./src/uploads/${img.original_filename}.png`,
          "images"
        );

        await removeFiles([
          { path: `./src/uploads/${img.original_filename}.png` },
        ]);
        await deleteFile(img.public_id);
        // last response
        return {
          ...newSrc,
          url: newSrc?.secure_url,
          noTrash: result?.data.predictions.length === 0,
        };
      })
    );
    if (results.length !== 0) {
      await ContaminatedLocation.findByIdAndUpdate(ref, {
        status: "success",
        assets: results,
        message: "This report has been approved and the images contain trash",
      });
      console.log("This report has been approved and the images contain trash");
    } else {
      await ContaminatedLocation.findByIdAndUpdate(ref, {
        status: "rejected",
        message:
          "This report has been approved and the images contain no trash",
      });
      console.log(
        "This report has been approved and the images contain no trash"
      );
    }
  } catch (error) {
    await ContaminatedLocation.findByIdAndUpdate(ref, {
      status: "failed",
      message: "An error occurred while checking the image!",
    });
    console.error({ error });
  }
};
export const createReportLocationHandler = async (req, res) => {
  try {
    const data = req.body;

    //check user
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    //check type
    const checked = await checkExistingContaminatedType(
      res,
      data.contaminatedType
    );
    if (!checked) return errorHandler(res, "Contaminated type not found", 404);

    // upload image/video to cloud
    if (req.files) {
      data.assets = await uploadFileAndReturn(req.files, undefined, false);
    }
    // parse JSON to object
    if (data.location !== "" && typeof data.location === "string") {
      const locationJSON = JSON.parse(data.location);
      data.location = {
        type: data.location?.type || "Point",
        coordinates: [locationJSON.longitude, locationJSON.latitude],
      };
    } else {
      data.location = {
        type: data.location?.type || "Point",
        coordinates: [data.location.longitude, data.location.latitude],
      };
    }

    // create new data
    const newContaminatedLocation = await ContaminatedLocation.create({
      ...data,
      author: req.user.id,
    });
    if (newContaminatedLocation?._id && data.assets) {
      checkImageTrashHandler(data.assets, newContaminatedLocation?._id);
    }
    removeFiles(req.files);
    // Get relevant data
    // await newContaminatedLocation.populate([
    //   {
    //     path: "contaminatedType",
    //     select: "_id contaminatedType contaminatedName",
    //   },
    //   { path: "reportedBy", select: "fullName avatar firstName lastName" },
    // ]);

    // save hisstory
    const history = {
      userId: req.user.id,
      title: "Report Location",
      description: "User report location",
      details: newContaminatedLocation._id,
      modelName: "ContaminatedLocation",
      type: "create",
    };
    saveHistoryHandler("report-location", history, res);
    return res.status(201).json(newContaminatedLocation);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const searchLocationHandler = async (req, res) => {
  try {
    let { q = "", page = 0, limit = 10 } = req.query;
    q = q.trim().split(" ");
    const regexQueries = q.map((term) => new RegExp(term, "i"));

    const results = await contaminatedLocation
      .find({
        $or: [
          { address: { $in: regexQueries } },
          { description: { $in: regexQueries } },
        ],
      })
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 })
      .populate([
        { path: "reportedBy", select: "fullName avatar lastName firstName" },
        {
          path: "contaminatedType",
          select: "contaminatedType contaminatedName asset",
        },
      ]);
    return res.status(200).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const getStatisticalLocationHandler = async (req, res) => {
  try {
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    const [total, pending, success, rejected, failed] = await Promise.all([
      await contaminatedLocation.countDocuments({
        reportedBy: existingUser._id,
      }),
      await contaminatedLocation.countDocuments({
        status: "pending",
        reportedBy: existingUser._id,
      }),
      await contaminatedLocation.countDocuments({
        status: "success",
        reportedBy: existingUser._id,
      }),
      await contaminatedLocation.countDocuments({
        status: "rejected",
        reportedBy: existingUser._id,
      }),
      await contaminatedLocation.countDocuments({
        status: "failed",
        reportedBy: existingUser._id,
      }),
    ]);

    return res.status(200).json({ total, pending, success, rejected, failed });
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
