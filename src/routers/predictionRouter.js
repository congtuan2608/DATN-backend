import express from "express";
import xlsx from "xlsx";
import { serverErrorHandler } from "../utils/errorHandler.js";
const router = express.Router();

const returnJsonData = (sheetNumber) => {
  const workbook = xlsx.readFile("./src/data/DuDoan.xlsx");
  // Assuming the first sheet is the target sheet
  const sheetName = workbook.SheetNames[sheetNumber];
  const worksheet = workbook.Sheets[sheetName];
  // Convert the sheet to JSON
  const jsonData = xlsx.utils.sheet_to_json(worksheet);
  let result = [
    { month: "1", data: [] },
    { month: "2", data: [] },
    { month: "3", data: [] },
    { month: "4", data: [] },
    { month: "5", data: [] },
    { month: "6", data: [] },
    { month: "7", data: [] },
    { month: "8", data: [] },
    { month: "9", data: [] },
    { month: "10", data: [] },
    { month: "11", data: [] },
    { month: "12", data: [] },
  ];
  jsonData.map((item) => {
    Object.entries(item).map(([key, value]) => {
      result.map((item) => {
        if (item.month === key) {
          item.data.push(value);
        }
      });
    });
  });
  // const average = result.map((item) => item.data.pop());
  // result.push({ month: "average", data: average });
  return result;
};

router.route("/air").get(async (req, res) => {
  try {
    const NO2_2015 = returnJsonData(1);
    const SO2_2015 = returnJsonData(2);
    const CO_2015 = returnJsonData(3);

    const NO2_2016 = returnJsonData(5);
    const SO2_2016 = returnJsonData(6);
    const CO_2016 = returnJsonData(7);

    const NO2_2017 = returnJsonData(8);
    const SO2_2017 = returnJsonData(9);
    const CO_2017 = returnJsonData(10);

    return res.status(200).json({
      NO2_2015,
      SO2_2015,
      CO_2015,
      NO2_2016,
      SO2_2016,
      CO_2016,
      NO2_2017,
      SO2_2017,
      CO_2017,
    });
  } catch (error) {
    serverErrorHandler(error, res);
  }
});

export default router;
