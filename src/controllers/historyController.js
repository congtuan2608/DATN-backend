import { model, modelNames } from "mongoose";
import ActivityType from "../models/activityType.js";
import HistoryDetail from "../models/historyDetail.js";
import { errorHandler, serverErrorHandler } from "../utils/errorHandler.js";
import user from "../models/user.js";

export const getRelevant = (activity) => {
  switch (activity) {
    case "report-location":
      return [
        {
          path: "reportedBy",
          model: "User",
          select: "fullName avatar lastName firstName",
        },
        {
          path: "contaminatedType",
          model: "ContaminatedType",
          select: "contaminatedName contaminatedType",
        },
      ];
    case "campaign":
      return [
        {
          path: "organizer",
          model: "User",
          select: "fullName avatar lastName firstName",
        },
        {
          path: "participants",
          model: "User",
          select: "fullName avatar lastName firstName",
        },
        {
          path: "ref",
          model: "ContaminatedLocation",
        },
      ];
    default: {
      return [];
    }
  }
};

export const saveHistoryHandler = async (type, data, res) => {
  try {
    const activityResult = await ActivityType.findOne({ activityType: type });

    if (!res) return errorHandler(res, "Type history not found", 400);

    const doc = await HistoryDetail.create({
      ...data,
      activity: activityResult._id,
    });
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const getHistoryHandler = async (req, res) => {
  try {
    const { page = 0, limit = 10, activity } = req.query;

    const existingUser = await user.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    const doc = await HistoryDetail.find({
      userId: req.user.id,
      ...(activity ?? {}),
    })
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "activity",
          select: "activityName activityType",
        },
      ]);

    res.status(200).json(doc);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
export const getHistoryDetailByIdHandler = async (req, res) => {
  try {
    if (!req.params?.id) return errorHandler(res, "id not found", 400);

    const existingUser = await user.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    const doc = await HistoryDetail.findById(req.params.id).populate([
      {
        path: "activity",
        select: "activityName activityType",
      },
    ]);
    if (!doc) return errorHandler(res, "History not found", 404);

    await doc.populate([
      {
        path: "activity",
        select: "activityName activityType",
      },
      {
        path: "details",
        populate: getRelevant(doc.activity.activityType),
      },
    ]);

    res.status(200).json(doc);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

//======================================= Activity Type =======================================
export const getActivityTypeHandler = async (req, res) => {
  try {
    const doc = await ActivityType.find();
    res.status(200).json(doc);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const createActivityTypeHandler = async (req, res) => {
  try {
    const data = req.body;

    if (!(data.activityType && data.activityName))
      return res.status(400).json("Activity type or name is required");

    await ActivityType.create(data);
    res.status(201).json("Create activity type is successfully");
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
export const updateActivityTypeHandler = async (req, res) => {
  try {
    const result = await ActivityType.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    if (!result) return errorHandler(res, "Activity type not found", 404);
    console.log({ result });
    res.status(200).json("Update activity type is successfully");
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
export const deleteActivityTypeHandler = async (req, res) => {
  try {
    let doc = await ActivityType.findByIdAndDelete(req.params.id);
    if (!doc) return errorHandler(res, "Activity type not found", 404);

    res.status(200).json("Update activity type is successfully");
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
