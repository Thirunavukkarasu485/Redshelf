// Lets us use async/await in routes without try/catch everywhere
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export default wrap;
