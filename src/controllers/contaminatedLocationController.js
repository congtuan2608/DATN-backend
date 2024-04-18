import { errorHandler, serverErrorHandler } from "../utils/errorHandler.js";
import { uploadFileAndReturn } from "../utils/uploadToCloud.js";
import User from "../models/user.js";
import ContaminatedType from "../models/contaminatedType.js";
import ContaminatedLocation from "../models/contaminatedLocation.js";

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

    const result = await ContaminatedType.create(data);
    return res.status(201).json(result);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

//=========================== Contaminated Location =======================================

const checkExistingContaminatedType = async (res, contaminatedType) => {
  if (Array.isArray(contaminatedType)) {
    await Promise.all(
      contaminatedType.map(async (type) => {
        const result = await ContaminatedType.findById(type);
        if (!result)
          return errorHandler(res, "Contaminated type not found", 404);
      })
    );
  } else {
    const result = await ContaminatedType.findById(contaminatedType);
    if (!result) return errorHandler(res, "Contaminated type not found", 404);
  }
};

export const getReportLocationHandler = async (req, res) => {
  try {
    const { page = 0, limit = 10 } = req.query;
    const results = await ContaminatedLocation.find()
      .populate([
        { path: "reportedBy", select: "fullName avatar lastName firstName" },
        {
          path: "contaminatedType",
          select: "contaminatedType contaminatedName",
        },
      ])
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 });

    return res.status(200).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const createReportLocationHandler = async (req, res) => {
  try {
    const data = req.body;

    //check user
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    //check type
    await checkExistingContaminatedType(res, data.contaminatedType);

    // upload image/video to cloud
    if (req.files) {
      data.assets = await uploadFileAndReturn(req.files);
    }
    // parse JSON to object
    if (data.location !== "" && typeof data.location === "string") {
      data.location = JSON.parse(data.location);
    }
    // create new data
    const newContaminatedLocation = await ContaminatedLocation.create({
      ...data,
      author: req.user.id,
    });

    // Get relevant data
    await newContaminatedLocation.populate([
      {
        path: "contaminatedType",
        select: "_id contaminatedType contaminatedName",
      },
      { path: "reportedBy", select: "fullName avatar firstName lastName" },
    ]);

    return res.status(201).json(newContaminatedLocation);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
