const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

var LikeSchema = new mongoose.Schema(
  {
    author: {
      type: ObjectId,
      ref: "User",
    },
    post: {
      type: ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Like", LikeSchema);
