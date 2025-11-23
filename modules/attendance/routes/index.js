import attendanceRoute from "./attendanceRoutes.js";

const mountRoutes = (app) => {
  app.use("/api/v1/attendance", attendanceRoute);
};

export default mountRoutes;
