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

export function sanitizeConversation(conv) {
  return sanitizeObject(conv, [
    ["id", (c) => c._id],
    [
      "members",
      (c) =>
        Array.isArray(c.members)
          ? c.members.map((u) => ({ id: u._id, name: u.name }))
          : [],
    ],
    [
      "lastMessage",
      (c) =>
        c.lastMessage
          ? {
              text: c.lastMessage.text,
              sender: c.lastMessage.sender
                ? {
                    id: c.lastMessage.sender._id,
                    name: c.lastMessage.sender.name,
                  }
                : null,
              createdAt: c.lastMessage.createdAt,
            }
          : null,
    ],
    ["createdAt", (c) => c.createdAt],
    ["updatedAt", (c) => c.updatedAt],
  ]);
}

export function sanitizeMessage(msg) {
  return sanitizeObject(msg, [
    ["id", (m) => m._id],
    ["conversationId", (m) => m.conversationId],
    ["text", (m) => m.text],
    [
      "sender",
      (m) => (m.sender ? { id: m.sender._id, name: m.sender.name } : null),
    ],
    ["seen", (m) => m.seen],
    ["createdAt", (m) => m.createdAt],
    ["updatedAt", (m) => m.updatedAt],
  ]);
}

export function sanitizeNotification(notification) {
  return sanitizeObject(notification, [
    ["id", (n) => n._id],
    ["title", (n) => n.title],
    ["refId", (n) => n.refId],
    ["message", (n) => n.message],
    ["module", (n) => n.module],
    ["importance", (n) => n.importance],
    [
      "from",
      (n) =>
        n.from
          ? `${n.from.name}${n.from.jobId ? " (" + n.from.jobId + ")" : ""}`
          : undefined,
    ],
    [
      "toUser",
      (n) =>
        Array.isArray(n.toUser)
          ? n.toUser
              .filter((u) => u)
              .map((u) => `${u.name}${u.jobId ? " (" + u.jobId + ")" : ""}`)
          : [],
    ],
    ["toRole", (n) => n.toRole],
    ["status", (n) => n.status],
    ["createdAt", (n) => n.createdAt],
    ["updatedAt", (n) => n.updatedAt],
  ]);
}
