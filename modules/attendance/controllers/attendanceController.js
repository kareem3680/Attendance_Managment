import asyncHandler from "express-async-handler";

import {
  checkInService,
  checkOutService,
  toggleBreakService,
  getAllAttendanceService,
  getSpecificAttendanceService,
  getAttendanceSummaryService,
} from "../services/attendanceService.js";

export const checkIn = asyncHandler(async (req, res) => {
  const record = await checkInService(req.user._id);
  res.status(200).json({
    message: "✅ Checked in successfully",
    data: record,
  });
});

export const checkOut = asyncHandler(async (req, res) => {
  const record = await checkOutService(req.user._id);
  res.status(200).json({
    message: "✅ Checked out successfully",
    data: record,
  });
});

export const toggleBreak = asyncHandler(async (req, res) => {
  const result = await toggleBreakService(req.user._id);
  res.status(200).json({
    message: "✅ Break toggled successfully",
    data: result,
  });
});

export const getAllAttendance = asyncHandler(async (req, res) => {
  const result = await getAllAttendanceService(req);
  res.status(200).json({
    message: "✅ Attendance records fetched successfully",
    ...result,
  });
});

export const getSpecificAttendance = asyncHandler(async (req, res) => {
  const record = await getSpecificAttendanceService(req.params.id);
  res.status(200).json({
    message: "✅ Attendance record retrieved successfully",
    data: record,
  });
});

export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const { id } = req.params;
  const result = await getAttendanceSummaryService(id, from, to);
  res.status(200).json({
    message: "✅ Attendance summary fetched successfully",
    ...result,
  });
});
