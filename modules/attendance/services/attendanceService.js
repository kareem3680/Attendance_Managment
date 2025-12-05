import asyncHandler from "express-async-handler";
import moment from "moment-timezone";

import AttendanceModel from "../models/attendanceModel.js";
import ApiError from "../../../utils/apiError.js";
import { sanitizeAttendance } from "../../../utils/sanitizeData.js";
import { getSpecificService } from "../../../utils/servicesHandler.js";
import Logger from "../../../utils/loggerService.js";
const logger = new Logger("attendance");

const toDecimal = (num) => Number(num.toFixed(2));

export const checkInService = asyncHandler(async (userId) => {
  const today = new Date().setHours(0, 0, 0, 0);
  let record = await AttendanceModel.findOne({ user: userId, date: today });

  if (record && record.checkInAt) {
    await logger.error("Check-in failed - already checked in", { userId });
    throw new ApiError("🛑 Already checked in today", 400);
  }

  if (record) {
    record.checkInAt = new Date();
    await record.save();
  } else {
    record = await AttendanceModel.create({
      user: userId,
      date: today,
      checkInAt: new Date(),
    });
  }

  await logger.info("User checked in", { userId });
  return sanitizeAttendance(await record.populate("user", "name jobId"));
});

export const checkOutService = asyncHandler(async (userId) => {
  const today = new Date().setHours(0, 0, 0, 0);

  const record = await AttendanceModel.findOne({
    user: userId,
    date: today,
  }).populate("user", "name jobId");

  if (!record || !record.checkInAt) {
    const lastRecord = await AttendanceModel.findOne({
      user: userId,
      date: { $lt: today },
    })
      .sort({ date: -1 })
      .populate("user", "name jobId");

    if (lastRecord) {
      lastRecord.checkOutAt = null;
      await lastRecord.save();
      await logger.info(
        "Check-out applied to previous day with null checkout",
        {
          userId,
          lastDate: lastRecord.date,
        }
      );
      return sanitizeAttendance(lastRecord);
    }

    await logger.info("No previous record found to apply null checkout", {
      userId,
    });
    return null;
  }

  if (record.checkOutAt) {
    await logger.error("Check-out failed - already checked out", { userId });
    throw new ApiError("🛑 Already checked out today", 400);
  }

  record.checkOutAt = new Date();
  const workedMs = record.checkOutAt - record.checkInAt;
  record.totalWorkedHours = toDecimal(workedMs / (1000 * 60 * 60));

  await record.save();
  await logger.info("User checked out", { userId });
  return sanitizeAttendance(record);
});

export const toggleBreakService = asyncHandler(async (userId) => {
  const today = new Date().setHours(0, 0, 0, 0);

  const record = await AttendanceModel.findOne({ user: userId, date: today });
  if (!record || !record.checkInAt) {
    throw new ApiError("🛑 You must check in before taking a break", 400);
  }
  if (record.checkOutAt) {
    throw new ApiError("🛑 You already checked out", 400);
  }

  if (!record.breaks) record.breaks = [];

  const lastBreak = record.breaks[record.breaks.length - 1];

  if (lastBreak && !lastBreak.end) {
    lastBreak.end = new Date();

    const diffMs = lastBreak.end - lastBreak.start;
    const diffMinutes = diffMs / (1000 * 60);

    record.totalBreakMinutes = toDecimal(
      (record.totalBreakMinutes || 0) + diffMinutes
    );
  } else {
    record.breaks.push({ start: new Date() });
  }

  await record.save();
  await logger.info("User toggled break", { userId });

  return sanitizeAttendance(await record.populate("user", "name jobId"));
});

export const getAllAttendanceService = asyncHandler(async (req) => {
  const { search, from, to } = req.query;

  const startDate = from
    ? moment(from, "YYYY-MM-DD").startOf("day").toDate()
    : moment().startOf("month").toDate();

  const endDate = to
    ? moment(to, "YYYY-MM-DD").endOf("day").toDate()
    : moment().endOf("day").toDate();

  const result = await AttendanceModel.find({
    date: { $gte: startDate, $lte: endDate },
  })
    .populate({
      path: "user",
      select: "name jobId",
      match: search
        ? {
            $or: [
              { name: new RegExp(search, "i") },
              { jobId: Number(search) || -1 },
            ],
          }
        : {},
    })
    .lean();

  let filtered = result.filter((doc) => doc.user);

  filtered = filtered.map((doc) => {
    const breakHours = (doc.totalBreakMinutes || 0) / 60;
    const workHours = doc.totalWorkedHours || 0;
    const actualHours = workHours - breakHours;

    return {
      ...doc,
      workHours,
      breakHours,
      actualHours,

      ...sanitizeAttendance(doc),
    };
  });

  await logger.info("Fetched all attendance records", {
    search: search || "no filter",
    from: moment(startDate).format("YYYY-MM-DD"),
    to: moment(endDate).format("YYYY-MM-DD"),
  });

  if (!filtered.length) {
    throw new ApiError("No lists Available For This period", 404);
  }

  return {
    results: filtered.length,
    data: filtered,
    period: {
      from: moment(startDate).format("YYYY-MM-DD"),
      to: moment(endDate).format("YYYY-MM-DD"),
    },
  };
});

export const getSpecificAttendanceService = asyncHandler(async (id) => {
  const record = await getSpecificService(AttendanceModel, id, {
    populate: { path: "user", select: "name jobId" },
  });

  await logger.info("Fetched attendance record", { id });
  return sanitizeAttendance(record);
});

export const getAttendanceSummaryService = asyncHandler(
  async (userId, from, to) => {
    const startDate = from || moment().startOf("month").format("YYYY-MM-DD");
    const endDate = to || moment().format("YYYY-MM-DD");

    const records = await AttendanceModel.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).populate("user", "name jobId");

    if (!records.length) {
      throw new ApiError("No lists Available For This period", 404);
    }

    let totalWorkingDays = 0;
    const current = moment(startDate, "YYYY-MM-DD");
    const end = moment(endDate, "YYYY-MM-DD");

    while (current.isSameOrBefore(end)) {
      const day = current.day();
      if (day !== 0 && day !== 6) totalWorkingDays++;
      current.add(1, "day");
    }

    const effectiveRecords = records.filter((r) => {
      const day = moment(r.date).day();
      return day !== 0 && day !== 6;
    });

    const daysWorked = effectiveRecords.length;
    const daysAbsent = totalWorkingDays - daysWorked;

    const totalWorkedHours = effectiveRecords.reduce(
      (sum, r) => sum + (r.totalWorkedHours || 0),
      0
    );

    const totalBreakHours = toDecimal(
      effectiveRecords.reduce((sum, r) => sum + (r.totalBreakMinutes || 0), 0) /
        60
    );

    const actualHours = toDecimal(totalWorkedHours - totalBreakHours);
    const expectedHours = toDecimal(totalWorkingDays * 9);
    const differenceHours = toDecimal(totalWorkedHours - expectedHours);

    const user = records[0].user;

    return {
      user: {
        id: user._id,
        name: user.name,
        jobId: user.jobId,
      },
      summary: {
        period: { from: startDate, to: endDate },
        daysWorked,
        daysAbsent,
        expectedHours,
        actualHours,
        totalBreakHours,
        differenceHours,
      },
    };
  }
);
