const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

var CommentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
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

CommentSchema.methods.toJSON = function () {
  return {
    _id: this._id,
    body: this.body,
  };
};

module.exports = mongoose.model("Comment", CommentSchema);
