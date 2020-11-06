const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const uniqueValidator = require("mongoose-unique-validator");
const slug = require("slug");

const PostSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: ObjectId,
        ref: "Like",
      },
    ],
    comments: [
      {
        type: ObjectId,
        ref: "Comment",
      },
    ],
    author: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

PostSchema.plugin(uniqueValidator, { message: "is already taken" });

PostSchema.pre("validate", function (next) {
  if (!this.slug) {
    this.slugify();
  }
  next();
});

PostSchema.methods.slugify = function () {
  this.slug =
    slug(this.title) +
    "-" +
    ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
};

PostSchema.methods.toJSON = function () {
  return {
    slug: this.slug,
    title: this.title,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    likes_count: this.likes.length,
    comments_count: this.comments.length,
    author: this.author.toJSON(),
  };
};

module.exports = mongoose.model("Post", PostSchema);
