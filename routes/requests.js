import { Router } from "express";
import mongoose from "mongoose";
import BloodBank, { GROUPS } from "../models/BloodBank.js";
import BloodRequest from "../models/BloodRequest.js";
import User from "../models/User.js";
import { protect, onlyRole } from "../middleware/auth.js";
import wrap from "../middleware/wrap.js";

const router = Router();

// Hospital sends a request to a bank
router.post(
  "/",
  protect,
  onlyRole("hospital"),
  wrap(async (req, res) => {
    const { bankId, group, units, urgency, note } = req.body;
    if (!mongoose.isValidObjectId(bankId) || !GROUPS.includes(group) || !(Number(units) >= 1))
      return res.status(400).json({ message: "Choose a blood group and at least 1 unit" });
    const bank = await BloodBank.findById(bankId);
    if (!bank) return res.status(404).json({ message: "Blood bank not found" });
    const hospital = await User.findById(req.user.id);

    const request = await BloodRequest.create({
      bank: bank._id,
      hospital: hospital._id,
      hospitalName: hospital.name,
      hospitalPhone: hospital.phone,
      group,
      units: Math.floor(Number(units)),
      urgency: urgency === "urgent" ? "urgent" : "normal",
      note,
    });
    res.status(201).json(request);
  })
);

// My requests (hospital: ones I sent, bank: ones I received)
router.get(
  "/mine",
  protect,
  wrap(async (req, res) => {
    let list;
    if (req.user.role === "hospital") {
      list = await BloodRequest.find({ hospital: req.user.id })
        .populate("bank", "name city phone")
        .sort("-createdAt");
    } else {
      const bank = await BloodBank.findOne({ owner: req.user.id });
      list = bank ? await BloodRequest.find({ bank: bank._id }).sort("-createdAt") : [];
    }
    res.json(list);
  })
);

// Bank updates a request: accepted / rejected / fulfilled
router.put(
  "/:id/status",
  protect,
  onlyRole("bank"),
  wrap(async (req, res) => {
    const { status } = req.body;
    if (!["accepted", "rejected", "fulfilled"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ message: "Request not found" });

    const bank = await BloodBank.findOne({ owner: req.user.id });
    const request = await BloodRequest.findById(req.params.id);
    if (!bank || !request || String(request.bank) !== String(bank._id))
      return res.status(404).json({ message: "Request not found" });

    // When blood is given, take those units out of stock
    if (status === "fulfilled" && request.status !== "fulfilled") {
      const current = bank.stock?.[request.group] || 0;
      bank.set(`stock.${request.group}`, Math.max(0, current - request.units));
      await bank.save();
    }
    request.status = status;
    await request.save();
    res.json(request);
  })
);

export default router;
