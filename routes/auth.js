import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import BloodBank from "../models/BloodBank.js";
import { protect } from "../middleware/auth.js";
import wrap from "../middleware/wrap.js";

const router = Router();

const sign = (u) => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
const pack = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

// Create account (blood bank or hospital)
router.post(
  "/register",
  wrap(async (req, res) => {
    const { name, email, password, role, city, address, phone } = req.body;
    if (!name || !email || !password || !city)
      return res.status(400).json({ message: "Name, email, password and city are required" });
    if (!["bank", "hospital"].includes(role))
      return res.status(400).json({ message: "Choose blood bank or hospital" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "This email is already registered" });

    const user = await User.create({
      name, email, role, city, phone,
      password: await bcrypt.hash(password, 10),
    });
    if (role === "bank") await BloodBank.create({ owner: user._id, name, city, address, phone });

    res.status(201).json({ token: sign(user), user: pack(user) });
  })
);

router.post(
  "/login",
  wrap(async (req, res) => {
    const { email, password } = req.body;
    const user = email && (await User.findOne({ email: email.toLowerCase() }));
    if (!user || !(await bcrypt.compare(password || "", user.password)))
      return res.status(401).json({ message: "Wrong email or password" });
    res.json({ token: sign(user), user: pack(user) });
  })
);

router.get(
  "/me",
  protect,
  wrap(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(pack(user));
  })
);

export default router;
