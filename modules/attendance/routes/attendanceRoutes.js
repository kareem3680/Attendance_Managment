import { Router } from "express";
const router = Router();

import {
  checkIn,
  checkOut,
  toggleBreak,
  getAllAttendance,
  getSpecificAttendance,
  getAttendanceSummary,
} from "../controllers/attendanceController.js";
import {
  checkInValidator,
  checkOutValidator,
  toggleBreakValidator,
  getSpecificAttendanceValidator,
  getAttendanceSummaryValidator,
} from "../validators/attendanceValidator.js";
import {
  protect,
  allowedTo,
} from "../../identity/controllers/authController.js";

router.use(protect);

router.post("/checkin", checkInValidator, checkIn);
router.post("/checkout", checkOutValidator, checkOut);
router.post("/toggle-break", toggleBreakValidator, toggleBreak);

router.get("/", allowedTo("admin"), getAllAttendance);

router.get(
  "/:id",
  allowedTo("admin"),
  getSpecificAttendanceValidator,
  getSpecificAttendance
);

router.get(
  "/summary/:id",
  allowedTo("admin"),
  getAttendanceSummaryValidator,
  getAttendanceSummary
);

export default router;
