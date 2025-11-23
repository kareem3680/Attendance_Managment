import { Schema, model } from "mongoose";

const attendanceSchema = new Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
    checkInAt: { type: Date },
    checkOutAt: { type: Date },
    totalWorkedHours: { type: Number, default: 0 },
    breaks: [
      {
        start: Date,
        end: Date,
      },
    ],
    totalBreakMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const AttendanceModel = model("Attendance", attendanceSchema);

export default AttendanceModel;
