require("./src/models/db");
const slot = require("../models/slotGenerator.model");
console.log(req.params.id);
slot.find(req.params.id, (err, slots) => {
  if (!err) {
    return slots;
  } else {
    console.log("error");
  }
});
