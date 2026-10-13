export const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// 0 = out, 1-5 = low, more = available
export const statusOf = (units = 0) => (units <= 0 ? "out" : units <= 5 ? "low" : "ok");
export const statusLabel = { ok: "Available", low: "Low", out: "Out of stock" };

export const timeAgo = (date) => {
  if (!date) return "";
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};
