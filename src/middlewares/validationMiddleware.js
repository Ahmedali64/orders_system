const validation = (schema , isArray = false) => (req, res, next) => {
  let data = req.body;
  //if not array wrap it in an array for validation
  if (isArray && !Array.isArray(data)) data = [data];

  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
//error ex
//  details:[
//     {
//       message: '"name" is required',
//       path: [2, "name"], // 2 is the index in the array, "name" is the field
//       type: "any.required",
//       context: { label: "name", key: "name", ... }
//     }
// ]
  if (error) {
    //{ "message": "\"name\" is required", "itemIndex": 2, "path": [2, "name"] },
    const details = error.details.map((err) => {
      const index = Array.isArray(err.path) && typeof err.path[0] === "number" ? err.path[0] : null;
      return {
        message: err.message,
        itemIndex: index,
        path: err.path
      };
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details
    });
  }
  req.body = value;
  next();
};

module.exports = validation;