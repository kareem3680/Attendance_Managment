import { check } from "express-validator";

import validatorMiddleware from "../../../middlewares/validatorMiddleware.js";

export const updateMyDataValidator = [
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Name must be at most 32 characters"),

  check("email").optional().isEmail().withMessage("Invalid email format"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "en-US"])
    .withMessage("Invalid phone number for Egypt, Saudi Arabia, or US/Canada"),

  validatorMiddleware,
];
