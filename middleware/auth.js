import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please log in first" });
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: data.id, role: data.role };
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please log in again" });
  }
};

export const onlyRole = (role) => (req, res, next) =>
  req.user.role === role
    ? next()
    : res.status(403).json({ message: `Only ${role} accounts can do this` });
