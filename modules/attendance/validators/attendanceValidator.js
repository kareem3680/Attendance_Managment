import { check, query } from "express-validator";
import validatorMiddleware from "../../../middlewares/validatorMiddleware.js";

export const checkInValidator = [validatorMiddleware];

export const checkOutValidator = [validatorMiddleware];

export const toggleBreakValidator = [validatorMiddleware];

export const getSpecificAttendanceValidator = [
  check("id").isMongoId().withMessage("Invalid Attendance Id Format"),
  validatorMiddleware,
];

export const getAttendanceSummaryValidator = [
  check("id").isMongoId().withMessage("Invalid User Id Format"),
  query("from").optional().isISO8601().withMessage("Invalid from date format"),
  query("to").optional().isISO8601().withMessage("Invalid to date format"),
  validatorMiddleware,
];
