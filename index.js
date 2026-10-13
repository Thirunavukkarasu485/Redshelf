import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import bankRoutes from "./routes/banks.js";
import requestRoutes from "./routes/requests.js";

dotenv.config();

const app = express();
const allowed = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowed.includes(origin) ? cb(null, true) : cb(new Error("Blocked by CORS")),
  })
);
app.use(express.json());

app.get("/", (_, res) => res.send("RedShelf API is running"));
app.use("/api/auth", authRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/requests", requestRoutes);

// One place to catch all errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
