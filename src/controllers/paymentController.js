import axios from "axios";
import CryptoJS from "crypto-js";
import moment from "moment";
import { momoConfig } from "../configs/momo/index.js";
import { zaloPlayConfig } from "../configs/zalo-pay/index.js";
import { DOMAIN } from "../constants/index.js";
import historyDetail from "../models/historyDetail.js";
import user from "../models/user.js";
import { errorHandler, serverErrorHandler } from "../utils/errorHandler.js";
import { saveHistoryHandler } from "./historyController.js";

export const createZaloPayHandler = async (req, res) => {
  try {
    const embed_data = {
      redirecturl: "https://www.google.com",
      // merchantinfo: "embeddata123",
      // preferred_payment_method: [
      //   // "vietqr",
      //   // "international_card",
      //   "domestic_card",
      //   "account",
      //   // "zalopay_wallet",
      // ],
    };

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: zaloPlayConfig.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: "user123",
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: 53000, //gia tien vnd
      description: `Lazada - Payment for the order #${transID}`,
      bank_code: "", //"zalopayapp",
      callback_url: `${
        process.env.MODE === "DEV"
          ? process.env.DOMAIN_DEV
          : process.env.DOMAIN_PROD
      }/v1/payment/zalo-pay/callback`,
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data =
      zaloPlayConfig.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, zaloPlayConfig.key1).toString();

    const result = await axios.post(zaloPlayConfig.endpoint, null, {
      params: order,
    });

    return res.status(200).json(result.data);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

// MOMO PAYMENT
export const createMoMoPayHandler = async (req, res) => {
  try {
    const { amount = 1000, orderInfo, otherInfo } = req.body;

    const existingUser = await user.findById(req.user.id);

    if (!existingUser) return errorHandler(res, "User not found", 404); // user info request

    const orderId = momoConfig.partnerCode + new Date().getTime();
    const requestId = orderId;
    const orderGroupId = "";
    const autoCapture = true;
    const lang = "vi";

    // parse extraData from json to base64
    const otherData = Buffer.from(
      JSON.stringify({
        userId: existingUser._id,
        email: existingUser.email,
        phone: existingUser?.phone,
        otherInfo,
      })
    ).toString("base64");

    console.log({ otherData });
    const parammeters = {
      accessKey: momoConfig.accessKey,
      amount,
      extraData: otherData,
      ipnUrl: `${DOMAIN}/v1/payment/momo/callback`, // sau khi thanh toan xong gui data ve
      orderId,
      orderInfo: orderInfo || "You have donate for campaign",
      partnerClientId: existingUser._id,
      partnerCode: momoConfig.partnerCode,
      redirectUrl: `${DOMAIN}`, // sau khi thanh toan xong quay ve
      requestId,
      requestType: "payWithMethod",
    };

    //before sign HMAC SHA256 with format
    const rawSignature = Object.entries(parammeters)
      .reduce((prev, cur, idx) => {
        return (
          prev +
          `${cur[0]}=${cur[1]}${
            idx === Object.entries(parammeters).length - 1 ? "" : `&`
          }`
        );
      }, "")
      .trim()
      .toString();

    //signature

    const signature = CryptoJS.HmacSHA256(
      rawSignature,
      momoConfig.secretKey
    ).toString();

    //json object send to MoMo endpoint
    let requestBody = {
      ...parammeters,
      storeId: "MomoTestStore",
      lang,
      autoCapture,
      orderGroupId,
      signature,
    };
    requestBody = JSON.stringify(requestBody);

    const options = {
      method: "POST",
      url: "https://test-payment.momo.vn/v2/gateway/api/create",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };
    const result = await axios(options);

    return res.status(200).json(result.data);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const momoCallbackHandler = async (req, res) => {
  try {
    console.log("momoCallbackHandler success", req.body);
    req.body.extraData = JSON.parse(
      Buffer.from(req.body.extraData, "base64").toString("utf-8")
    );
    if (req.body?.resultCode === 0 && req.body?.orderId) {
      // save history
      const history = {
        userId: req.body.partnerClientId,
        title: "Donate for campaign",
        description: "Successful donation",
        details: { ...req.body, status: "success", method: "momo" },
        type: "create",
      };
      saveHistoryHandler("payment", history, res);
    } else {
      const history = {
        userId: req.body.partnerClientId,
        title: "Donate for campaign",
        description: "Donation failed",
        details: { ...req.body, status: "failed", method: "momo" },
        type: "create",
      };
      saveHistoryHandler("payment", history, res);
    }

    return res.status(201).json(req.body);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const momoTransactionStatusHandler = async (req, res) => {
  try {
    let { id, orderId } = req.body;
    let rawSignature;

    if (!(id || orderId))
      return errorHandler(res, "id or orderId is required", 400);

    if (id) {
      const history = await historyDetail.findById(id);
      if (history) {
        orderId = history.details.orderId;
      }
    }

    const payStatus = await historyDetail.find({
      "details.orderId": orderId,
    });

    console.log(payStatus);
    if (payStatus[payStatus.length - 1]?.details?.resultCode === 0)
      return res.status(200).json("This transaction has been successful!");

    if (orderId) {
      rawSignature = `accessKey=${momoConfig.accessKey}&orderId=${orderId}&partnerCode=${momoConfig.partnerCode}&requestId=${orderId}`;
    }

    if (!rawSignature)
      return errorHandler(res, "rawSignature is undefined", 400);

    const signature = CryptoJS.HmacSHA256(
      rawSignature,
      momoConfig.secretKey
    ).toString();

    let requestBody = JSON.stringify({
      partnerCode: momoConfig.partnerCode,
      requestId: orderId,
      orderId,
      lang: "vi",
      signature,
    });

    const options = {
      method: "POST",
      url: "https://test-payment.momo.vn/v2/gateway/api/query",
      headers: {
        "Content-Type": "application/json",
      },
      data: requestBody,
    };

    const result = await axios(options);

    // parse extraData from base64 to json
    result.data.extraData = JSON.parse(
      Buffer.from(result.data?.extraData, "base64").toString("utf-8")
    );

    if (!req.user?.id) {
      req.user.id = result.data?.extraData?.userId;
    }
    if (result.data?.resultCode === 0 && result.data?.orderId) {
      // await historyDetail.findOneAndUpdate(
      //   { "details.orderId": result.data.orderId },
      //   { details: { ...result.data, status: "success" } }
      // );
      const history = {
        userId: req.user.id,
        title: "Donate for campaign",
        description: "Successful donation",
        details: { ...result.data, status: "success", method: "MOMO" },
        type: "create",
      };
      saveHistoryHandler("payment", history, res);
    } else {
      // await historyDetail.findOneAndUpdate(
      //   { "details.orderId": result.data.orderId },
      //   { details: { ...result.data, status: "failed" } }
      // );
      const history = {
        userId: req.user.id,
        title: "Donate for campaign",
        description: "Donation failed",
        details: { ...result.data, status: "failed", method: "MOMO" },
        type: "create",
      };
      saveHistoryHandler("payment", history, res);
    }

    return res.status(201).json(result.data);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
