// Adds demo data.  Run:  npm run seed
// WARNING: this deletes existing users, banks and requests first.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import BloodBank from "./models/BloodBank.js";
import BloodRequest from "./models/BloodRequest.js";

dotenv.config();

const banks = [
  { name: "City Central Blood Bank", city: "Chennai", address: "12 Mount Road", phone: "9840011111",
    stock: { "A+": 18, "A-": 3, "B+": 22, "B-": 2, "AB+": 6, "AB-": 0, "O+": 30, "O-": 4 } },
  { name: "LifeDrop Blood Centre", city: "Coimbatore", address: "45 Race Course Road", phone: "9840022222",
    stock: { "A+": 9, "A-": 1, "B+": 12, "B-": 0, "AB+": 3, "AB-": 1, "O+": 15, "O-": 2 } },
  { name: "Red Cross Blood Bank", city: "Madurai", address: "7 West Veli Street", phone: "9840033333",
    stock: { "A+": 14, "A-": 5, "B+": 8, "B-": 3, "AB+": 4, "AB-": 2, "O+": 20, "O-": 6 } },
  { name: "Sanjeevani Blood Bank", city: "Bengaluru", address: "88 MG Road", phone: "9840044444",
    stock: { "A+": 25, "A-": 6, "B+": 19, "B-": 4, "AB+": 8, "AB-": 3, "O+": 28, "O-": 7 } },
  { name: "Hope Blood Centre", city: "Hyderabad", address: "21 Banjara Hills", phone: "9840055555",
    stock: { "A+": 4, "A-": 0, "B+": 6, "B-": 1, "AB+": 2, "AB-": 0, "O+": 9, "O-": 1 } },
  { name: "Care Plus Blood Bank", city: "Chennai", address: "3 Anna Nagar", phone: "9840066666",
    stock: { "A+": 11, "A-": 2, "B+": 15, "B-": 5, "AB+": 5, "AB-": 1, "O+": 17, "O-": 3 } },
];

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany(), BloodBank.deleteMany(), BloodRequest.deleteMany()]);
const password = await bcrypt.hash("password123", 10);

for (let i = 0; i < banks.length; i++) {
  const b = banks[i];
  const owner = await User.create({
    name: b.name, email: `bank${i + 1}@demo.com`, password, role: "bank", city: b.city, phone: b.phone,
  });
  await BloodBank.create({ owner: owner._id, ...b });
}
await User.create({
  name: "Apollo Care Hospital", email: "hospital@demo.com", password,
  role: "hospital", city: "Chennai", phone: "9840099999",
});

console.log("Done! Demo logins (password: password123)");
console.log("  Blood bank : bank1@demo.com");
console.log("  Hospital   : hospital@demo.com");
await mongoose.disconnect();
