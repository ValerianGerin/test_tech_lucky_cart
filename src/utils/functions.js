const conditionCallback = {
  gt: (cond, val) => val > cond,
  gte: (cond, val) => val>= cond,
  lt: (cond, val) => val<cond,
  lte: (cond, val) => val <= cond,
  in: (cond, val) => cond.includes(val),
  and: (cond, val) => {},
  or: (cond, val) => {},
};

module.exports = {
    conditionCallback
}
