const sanitizeObject = (obj, fields) => {
  return Object.fromEntries(
    fields
      .map(([key, valueFn]) => {
        try {
          const value = valueFn(obj);
          return value !== undefined ? [key, value] : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
  );
};

export function sanitizeUser(user) {
  return sanitizeObject(user, [
    ["id", (u) => u._id],
    ["name", (u) => u.name],
    ["active", (u) => u.active],
    ["email", (u) => u.email],
    ["phone", (u) => u.phone],
    ["role", (u) => u.role],
    ["position", (u) => u.position],
    ["jobId", (u) => u.jobId],
    ["hireDate", (u) => u.hireDate],
  ]);
}

export function sanitizeAttendance(attendance) {
  function toDecimal(num, decimals = 2) {
    return Number(Number(num).toFixed(decimals));
  }

  const breakHours = (attendance.totalBreakMinutes || 0) / 60;

  const netWorkedHours =
    attendance.totalWorkedHours && attendance.totalWorkedHours > 0
      ? toDecimal(attendance.totalWorkedHours - breakHours)
      : attendance.totalWorkedHours;

  return sanitizeObject(attendance, [
    ["id", (a) => a._id],
    ["userName", (a) => a.user?.name],
    ["jobId", (a) => a.user?.jobId],
    ["date", (a) => a.date],
    ["checkInAt", (a) => a.checkInAt],
    ["checkOutAt", (a) => a.checkOutAt],

    ["totalWorkedHours", () => netWorkedHours],
    ["totalBreakMinutes", (a) => a.totalBreakMinutes || 0],

    [
      "breaks",
      (a) =>
        Array.isArray(a.breaks)
          ? a.breaks.map((b) => ({
              start: b.start,
              end: b.end,
            }))
          : [],
    ],
  ]);
}
