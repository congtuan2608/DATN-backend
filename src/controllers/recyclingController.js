import RecyclingGuide from "../models/recyclingGuide.js";
import RecyclingType from "../models/recyclingType.js";
import User from "../models/user.js";
import { errorHandler, serverErrorHandler } from "../utils/errorHandler.js";
import { uploadFileAndReturn } from "../utils/handleFileCloud.js";
import { saveHistoryHandler } from "./historyController.js";

export const getRecyclingTypeHandler = async (req, res) => {
  try {
    const results = await RecyclingType.find({});
    return res.status(200).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const createRecyclingTypeHandler = async (req, res) => {
  try {
    const data = req.body;
    const results = await RecyclingType.create(data);
    return res.status(201).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const updateRecyclingTypeHandler = async (req, res) => {
  try {
    const data = req.body;
    const newDoc = await RecyclingType.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    if (!newDoc) {
      return res.status(404).json("Recycling type not found");
    }
    return res.status(200).json(newDoc);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const deleteRecyclingTypeHandler = async (req, res) => {
  try {
    const existingType = await RecyclingType.findById(req.params.id);
    if (!existingType) {
      return errorHandler(res, "Recycling type not found", 404);
    }
    await RecyclingType.findByIdAndDelete(req.params.id);
    return res.status(200).json("Deleted successfully!");
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

// =========================== controller recycling guide =============================

// check exits
const checkExistingTypes = async (res, recyclingTypes) => {
  if (Array.isArray(recyclingTypes)) {
    await Promise.all(
      recyclingTypes.map(async (type) => {
        const result = await RecyclingType.findById(type);
        if (!result) return false;
        else return true;
      })
    );
  } else {
    const result = await RecyclingType.findById(recyclingTypes);
    if (!result) return false;
    else return true;
  }
};

//get all recycling guide
export const getRecyclingGuideHandler = async (req, res) => {
  try {
    const { page = 0, limit = 10, tagId } = req.query;
    const results = await RecyclingGuide.find(
      tagId ? { recyclingTypes: { $in: [tagId] } } : {}
    )
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 })
      .populate([
        { path: "author", select: "fullName avatar lastName firstName" },
        { path: "recyclingTypes", select: "typeName recyclingName" },
      ]);

    return res.status(200).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

//get by id recycling guide
export const getByIdRecyclingGuideHandler = async (req, res) => {
  try {
    const result = await RecyclingGuide.findById(req.params.id).populate([
      { path: "author", select: "fullName avatar lastName firstName" },
      { path: "recyclingTypes", select: "typeName recyclingName" },
    ]);

    if (!result) return errorHandler(res, "Recycling guide not found", 404);

    return res.status(200).json(result);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

// create guide
export const createRecyclingGuideHandler = async (req, res) => {
  try {
    const data = req.body;
    //check user
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    //check type
    const checked = await checkExistingTypes(res, data.recyclingTypes);
    if (!checked) return errorHandler(res, "Recycling type not found", 404);

    // upload image/video to cloud
    if (req.files) {
      data.assets = await uploadFileAndReturn(req.files, "recycling-guides");
    }

    // create new data
    const newRecyclingGuide = await RecyclingGuide.create({
      ...data,
      author: req.user.id,
    });

    //update recycling type schema
    if (data.recyclingTypes) {
      if (Array.isArray(data.recyclingTypes)) {
        await Promise.all(
          data.recyclingTypes.map(async (item) => {
            await RecyclingType.findByIdAndUpdate(item, {
              $push: { recyclingGuides: newRecyclingGuide._id },
            });
          })
        );
      } else {
        await RecyclingType.findByIdAndUpdate(data.recyclingTypes, {
          $push: { recyclingGuides: newRecyclingGuide._id },
        });
      }
    }

    // Get relevant data
    await newRecyclingGuide.populate([
      {
        path: "recyclingTypes",
        select: "typeName recyclingName",
      },
      { path: "author", select: "fullName avatar firstName lastName" },
    ]);

    const history = {
      userId: req.user.id,
      title: "Created recycling guide",
      description: "Created recycling guide",
      details: newRecyclingGuide._id,
      modelName: "RecyclingGuide",
      type: "create",
    };
    saveHistoryHandler("recycling", history, res);
    return res.status(201).json(newRecyclingGuide);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

// update guide
export const updateRecyclingGuideHandler = async (req, res) => {
  try {
    const data = req.body;

    //check user
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    const existingGuide = await RecyclingGuide.findById(req.params.id);

    //check guide exists
    if (!existingGuide)
      return errorHandler(res, "Recycling guide not found", 404);

    //check if user is allowed to update
    if (String(existingGuide.author) !== req.user.id)
      return errorHandler(res, "You are not allowed to update this guide", 404);

    //check recycling type
    await checkExistingTypes(res, data.recyclingTypes);

    // upload image/video to cloud
    if (req.files) {
      data.assets = await uploadFileAndReturn(req.files, "recycling-guides");
    }

    // update new data
    const newRecyclingGuide = await RecyclingGuide.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    ).populate([
      {
        path: "recyclingTypes",
        select: "typeName recyclingName",
      },
      { path: "author", select: "fullName avatar firstName lastName" },
    ]);

    if (data.recyclingTypes) {
      //check có phải mảng hay không nếu không thì convert thành mảng
      if (!Array.isArray(data.recyclingTypes)) {
        data.recyclingTypes = [data.recyclingTypes];
      }

      // check xem trong new recyclingTypes có tồn lại old recyclingTypes hay không return về new item
      let itemWillInsert = data.recyclingTypes.filter(
        (item) => !existingGuide.recyclingTypes.includes(item)
      );
      // check xem trong old recyclingTypes có tồn lại new recyclingTypes hay không return về old item
      let itemWillRemove = existingGuide.recyclingTypes.filter(
        (item) => !data.recyclingTypes.includes(String(item))
      );

      // handle remove and update recyclingTypes
      await Promise.all([
        ...itemWillRemove.map(async (item) => {
          return await RecyclingType.findByIdAndUpdate(item, {
            $pull: { recyclingGuides: newRecyclingGuide._id },
          });
        }),
        ...itemWillInsert.map(async (item) => {
          return await RecyclingType.findByIdAndUpdate(item, {
            $push: { recyclingGuides: newRecyclingGuide._id },
          });
        }),
      ]);
    }
    const history = {
      userId: req.user.id,
      title: "Updated recycling guide",
      description: "Updated recycling guide",
      details: newRecyclingGuide._id,
      modelName: "RecyclingGuide",
      type: "update",
    };
    saveHistoryHandler("recycling", history, res);
    return res.status(200).json(newRecyclingGuide);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

// delete recycling guide
export const deleteRecyclingGuideHandler = async (req, res) => {
  try {
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return errorHandler(res, "User not found", 404);

    if (String(existingUser._id) !== req.user.id)
      return errorHandler(res, "You are not allowed to delete this guide", 403);

    const deleted = await RecyclingGuide.findByIdAndDelete(req.params.id);

    if (!deleted) return errorHandler(res, "Guide not found", 404);

    const history = {
      userId: req.user.id,
      title: "Deleted recycling guide",
      description: "Deleted recycling guide",
      details: req.params.id,
      modelName: "RecyclingGuide",
      type: "delete",
    };
    saveHistoryHandler("recycling", history, res);
    return res.status(200).json("Deleted successfully!");
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const searchRecyclingGuideHandler = async (req, res) => {
  try {
    let { q = "", page = 0, limit = 10, tagId } = req.query;
    q = q.trim().split(" ");
    const regexQueries = q.map((term) => new RegExp(term, "i"));

    const results = await RecyclingGuide.find({
      $and: [
        ...(tagId ? [{ recyclingTypes: { $in: [tagId] } }] : []),
        ...(q
          ? [
              {
                $or: [
                  { title: { $in: regexQueries } },
                  { description: { $in: regexQueries } },
                ],
              },
            ]
          : []),
      ],
    })
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 })
      .populate([
        { path: "author", select: "fullName avatar lastName firstName" },
        { path: "recyclingTypes", select: "typeName recyclingName" },
      ]);
    return res.status(200).json(results);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
