const mongoose = require("mongoose");

let app = mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  bio:{
    type: String,
    required: false
  }
});
module.exports = mongoose.model("user1", app);
