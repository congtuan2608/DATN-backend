import Campaign from "../models/campaign.js";
import { errorHandler, serverErrorHandler } from "../utils/errorHandler.js";
import { saveHistoryHandler } from "./historyController.js";

export const createCampainHandler = async (req, res) => {
  try {
    const data = req.body;
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    const doc = await Campaign.create({ ...data, organizer: req.user.id });

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
    res.status(201).json(doc);
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
    res.status(201).json("Joined campaign successfully!");
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
    res.status(201).json("Has left campaign successfully!");
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
