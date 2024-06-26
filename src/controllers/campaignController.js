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
        path: "reference",
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

    await contaminatedLocation.findByIdAndUpdate(data.reference, {
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
    console.log(other);
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    const oldDoc = await Campaign.findById(id);
    if (!oldDoc) return errorHandler(res, "Campaign not found", 404);
    if (other.reference) {
      await contaminatedLocation.findByIdAndUpdate(oldDoc.reference, {
        hadCampaign: false,
      });
    }

    const newDoc = await Campaign.findByIdAndUpdate(id, other, { new: true });

    if (other.reference) {
      await contaminatedLocation.findByIdAndUpdate(other.reference, {
        hadCampaign: true,
      });
    }

    // save hisstory
    const history = {
      userId: req.user.id,
      title: "Update campaign",
      description: "Update campaign successfully",
      details: newDoc._id,
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
export const getCampaignNearbyHandler = async (req, res) => {
  try {
    const { longitude, latitude, distance = 1000 } = req.query;

    if (!(longitude && latitude))
      return errorHandler(res, "Longitude and Latitude are required", 400);
    const nearbyLocations = await contaminatedLocation.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: "dist.calculated",
          maxDistance: parseFloat(distance),
          includeLocs: "dist.location",
        },
      },
    ]);
    const currentDate = new Date();
    let nearbyCampaigns = await Campaign.find({
      endDate: { $gt: currentDate },
      ...(nearbyLocations.length !== 0
        ? {
            reference: { $in: nearbyLocations.map((location) => location._id) },
          }
        : {}),
    })
      .populate([
        { path: "organizer", select: "fullName avatar" },
        { path: "participants", select: "fullName avatar" },
        {
          path: "reference",
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
      ])
      .sort({ ...(nearbyLocations.length === 0 && { createdAt: -1 }) });

    // merge data
    const mergeData = nearbyCampaigns.map((item) => {
      return {
        ...item._doc,
        dist: nearbyLocations.find(
          (location) => String(location._id) === String(item.reference._id)
        )?.dist?.calculated,
      };
    });
    return res.status(200).json(mergeData);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
export const searchCampaignHandler = async (req, res) => {
  try {
    let { q = "", page = 0, limit = 10 } = req.query;
    q = q.trim().split(" ");
    const regexQueries = q.map((term) => new RegExp(term, "i"));

    const results = await Campaign.find({
      $or: [
        { title: { $in: regexQueries } },
        { description: { $in: regexQueries } },
      ],
    })
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 })
      .populate([
        { path: "organizer", select: "fullName avatar" },
        { path: "participants", select: "fullName avatar" },
        {
          path: "reference",
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
    return res.status(200).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
