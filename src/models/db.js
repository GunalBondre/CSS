const mongoose = require("mongoose");
const uri =
  "mongodb+srv://admin:TfnTS213qRD7WNiC@cluster0-dxajh.mongodb.net/<dbname>?retryWrites=true&w=majority";
mongoose.connect(
  uri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (!err) {
      console.log("mongodb connection successfull");
    } else {
      console.log("error in connecting to database", err);
    }
  }
);

require("./users");
// "mongodb://localhost:27017/Tvstra" ||
