import { Router } from "express";
import mongoose from "mongoose";
import BloodBank, { GROUPS } from "../models/BloodBank.js";
import { protect, onlyRole } from "../middleware/auth.js";
import wrap from "../middleware/wrap.js";

const router = Router();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Total units of each group across all banks (for the home page)
router.get(
  "/stats",
  wrap(async (_, res) => {
    const banks = await BloodBank.find().lean();
    const totals = Object.fromEntries(GROUPS.map((g) => [g, 0]));
    banks.forEach((b) => GROUPS.forEach((g) => (totals[g] += b.stock?.[g] || 0)));
    res.json({ banks: banks.length, totals });
  })
);

// Bank owner: see my own bank
router.get(
  "/mine",
  protect,
  onlyRole("bank"),
  wrap(async (req, res) => {
    const bank = await BloodBank.findOne({ owner: req.user.id });
    if (!bank) return res.status(404).json({ message: "Blood bank not found" });
    res.json(bank);
  })
);

// Bank owner: update stock
router.put(
  "/mine/stock",
  protect,
  onlyRole("bank"),
  wrap(async (req, res) => {
    const incoming = req.body.stock || {};
    const changes = {};
    for (const g of GROUPS) {
      if (incoming[g] === undefined) continue;
      const n = Math.floor(Number(incoming[g]));
      if (Number.isNaN(n) || n < 0)
        return res.status(400).json({ message: `Units for ${g} must be 0 or more` });
      changes[`stock.${g}`] = n;
    }
    const bank = await BloodBank.findOneAndUpdate(
      { owner: req.user.id },
      { $set: changes },
      { new: true }
    );
    if (!bank) return res.status(404).json({ message: "Blood bank not found" });
    res.json(bank);
  })
);

// Public search:  /api/banks?group=A%2B&city=chennai&q=name
router.get(
  "/",
  wrap(async (req, res) => {
    const { city, q } = req.query;
    const group = (req.query.group || "").replace(" ", "+"); // "+" can turn into a space in URLs
    const filter = {};
    if (GROUPS.includes(group)) filter[`stock.${group}`] = { $gt: 0 };
    if (city) filter.city = new RegExp(escapeRegex(city.trim()), "i");
    if (q) filter.name = new RegExp(escapeRegex(q.trim()), "i");

    const sort = GROUPS.includes(group) ? { [`stock.${group}`]: -1 } : { updatedAt: -1 };
    const banks = await BloodBank.find(filter).sort(sort).limit(60);
    res.json(banks);
  })
);

// One bank
router.get(
  "/:id",
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ message: "Blood bank not found" });
    const bank = await BloodBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ message: "Blood bank not found" });
    res.json(bank);
  })
);

export default router;
