import Campaign from "../models/campaign.js";
import contaminatedLocation from "../models/contaminatedLocation.js";
import User from "../models/user.js";
import { errorHandler, serverErrorHandler } from "../utils/errorHandler.js";
import { saveHistoryHandler } from "./historyController.js";

export const getCampainHandler = async (req, res) => {
  try {
    const { page = 0, limit = 10 } = req.query;
    const results = await Campaign.find()
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 })
      .populate([
        { path: "organizer", select: "fullName avatar" },
        { path: "participants", select: "fullName avatar" },
        // {
        //   path: "ref",
        //   populate: [
        //     {
        //       path: "reportedBy",
        //       model: "User",
        //       select: "fullName avatar",
        //     },
        //     {
        //       path: "contaminatedType",
        //       model: "ContaminatedType",
        //       select: "contaminatedName contaminatedType",
        //     },
        //   ],
        // },
      ]);
    res.status(200).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
export const getCampainByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return errorHandler(res, "Id is required", 400);

    const result = await Campaign.findById(id).populate([
      { path: "organizer", select: "fullName avatar" },
      { path: "participants", select: "fullName avatar" },
      {
        path: "ref",
        populate: [
          {
            path: "reportedBy",
            model: "User",
            select: "fullName avatar",
          },
          {
            path: "contaminatedType",
            model: "ContaminatedType",
            select: "contaminatedName contaminatedType",
          },
        ],
      },
    ]);
    return res.status(200).json(result);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
export const createCampainHandler = async (req, res) => {
  try {
    const data = req.body;
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    const doc = await Campaign.create({
      ...data,
      organizer: req.user.id,
      participants: [req.user.id],
    });

    await contaminatedLocation.findByIdAndUpdate(data.ref, {
      hadCampaign: true,
    });

    // save hisstory
    const history = {
      userId: req.user.id,
      title: "Created campaign",
      description: "Created campaign successfully",
      details: doc._id,
      modelName: "Campaign",
      type: "create",
    };
    saveHistoryHandler("campaign", history, res);
    return res.status(201).json(doc);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const updateCampainHandler = async (req, res) => {
  try {
    const { id, ...other } = req.body;
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    const newDoc = await Campaign.findByIdAndUpdate(id, other);

    // save hisstory
    const history = {
      userId: req.user.id,
      title: "Update campaign",
      description: "Update campaign successfully",
      details: doc._id,
      modelName: "Campaign",
      type: "update",
    };
    saveHistoryHandler("campaign", history, res);
    return res.status(200).json(newDoc);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
//=========================== Handle Campaign (join, leave) =======================================

export const joinCampaignHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    const doc = await Campaign.findByIdAndUpdate(
      id,
      { $push: { participants: existingUser._id } },
      { new: true }
    );

    // save hisstory
    const history = {
      userId: req.user.id,
      title: "Joined campaign",
      description: "Joined the campaign",
      details: id,
      modelName: "Campaign",
      type: "update",
    };
    saveHistoryHandler("campaign", history, res);
    return res.status(201).json("Joined campaign successfully!");
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
export const leaveCampaignHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    const doc = await Campaign.findByIdAndUpdate(
      id,
      { $pull: { participants: existingUser._id } },
      { new: true }
    );

    // save hisstory
    const history = {
      userId: req.user.id,
      title: "Has left the campaign",
      description: "Has left the campaign",
      details: id,
      modelName: "Campaign",
      type: "update",
    };
    saveHistoryHandler("campaign", history, res);
    return res.status(201).json("Has left campaign successfully!");
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
