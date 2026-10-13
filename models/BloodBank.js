import mongoose from "mongoose";

export const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// stock: { "A+": 10, "A-": 2, ... }  (units available)
const stockShape = Object.fromEntries(
  GROUPS.map((g) => [g, { type: Number, default: 0, min: 0 }])
);

const bankSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    stock: stockShape,
  },
  { timestamps: true }
);

export default mongoose.model("BloodBank", bankSchema);
