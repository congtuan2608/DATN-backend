import axios from "axios";
import { serverErrorHandler } from "../utils/errorHandler.js";
import { pollutionData } from "../data/index.js";

export const getAirQuality = async (req, res) => {
  try {
    const {
      country = "Vietnam",
      city = "Ho Chi Minh City",
      state = "Ho Chi Minh City",
    } = req.query;

    const config = {
      method: "get",
      maxBodyLength: Infinity,
      // url: `http://api.airvisual.com/v2/city?city=${city}&state=${state}&country=${country}&key=${process.env.AIR_QUALITY_API_KEY}`,
      url: `http://api.airvisual.com/v2/city`,
      params: {
        city,
        state,
        country,
        key: process.env.AIR_QUALITY_API_KEY,
      },
    };
    const response = await axios(config);
    res.status(200).json(response.data);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const getEnvironmentalPollution = (req, res) => {
  try {
    res.status(200).json(pollutionData);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
