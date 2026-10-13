import mongoose from "mongoose";
import { GROUPS } from "./BloodBank.js";

const requestSchema = new mongoose.Schema(
  {
    bank: { type: mongoose.Schema.Types.ObjectId, ref: "BloodBank", required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hospitalName: String,
    hospitalPhone: String,
    group: { type: String, enum: GROUPS, required: true },
    units: { type: Number, min: 1, required: true },
    urgency: { type: String, enum: ["normal", "urgent"], default: "normal" },
    note: { type: String, trim: true, maxlength: 300 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "fulfilled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("BloodRequest", requestSchema);
