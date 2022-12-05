const EType = {
  STRING: "[object String]",
  NUMBER: "[object Number]",
  BOOLEAN: "[object Boolean]",
  NULL: "[object Null]",
  UNDEFINED: "[object Undefined]",
  OBJECT: "[object Object]",
  ARRAY: "[object Array]",
};

const ECondition = {
  GREATERTHAN: "gt",
  LOWERTHAN: "lt",
  GREATERTHANOREQUAL: "gte",
  LOWERTHANOREQUAL: "lte",
  IN: "in",
  AND: "and",
  OR: "or",
};

module.exports = {
  EType,
  ECondition
};
