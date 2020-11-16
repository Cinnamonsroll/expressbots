const mongoose = require("mongoose");

let app = mongoose.Schema({
  bot: {
    type: String,
    required: true
  },
  invite: {
    type: String,
    required: false
  },
  servers: {
    type: Number,
    required: false,
    default: 0
  },
  website: {
    type: String,
    required: false
  },
  owners: {
    type: Array,
    required: true
  },
  prefix: {
    type: String,
    required: true
  },
  github: {
    type: String,
    required: false
  },
  views: {
    type: Number,
    required: false
  },
  votes: {
    type: Number,
    required: false
  },
  approvedOn: {
    type: String,
    required: false
  },
  submittedOn: {
    type: String,
    required: false
  },
  uniqueViews: {
    type: Number,
    required: false
  },
  tags: {
    type: Array,
    required: false
  },
  shortDesc: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  apiToken: {
    type: String,
    required: false
  },
  lib: {
    type: String,
    required: true
  },
  support: {
    type: String,
    required: false
  },
  approved: {
    type: Boolean,
    required: false,
    default: false
  }
});
module.exports = mongoose.model("bots2", app);
