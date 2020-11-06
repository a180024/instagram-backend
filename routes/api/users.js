const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("../auth");
const User = mongoose.model("User");
const Post = mongoose.model("Post");

// Preload user profile on routes with ':username'
router.param("username", (req, res, next, username) => {
  User.findOne({ username: username })
    .then((user) => {
      if (!user) return res.sendStatus(404);

      req.profile = user.toJSON();

      return next();
    })
    .catch(next);
});

// Follow another User
router.post("/:username/follow", auth.required, (req, res, next) => {
  var profileId = req.profile._id;

  User.findByIdAndUpdate(
    profileId,
    {
      $addToSet: { followers: req.payload.id },
    },
    { new: true },
    (err) => {
      if (err) return res.status(422).json({ err: err.message });

      User.findByIdAndUpdate(
        req.payload.id,
        {
          $addToSet: { following: profileId },
        },
        { new: true },
        (err, updatedUser) => {
          if (err) return res.status(422).json({ err: err.message });
          return res.status(201).json({ user: updatedUser.toJSON() });
        }
      );
    }
  ).catch(next);
});

// Unfollow another User
router.delete("/:username/unfollow", auth.required, (req, res, next) => {
  var profileId = req.profile._id;

  User.findByIdAndUpdate(
    profileId,
    {
      $pull: { followers: req.payload.id },
    },
    { new: true },
    (err) => {
      if (err) return res.status(422).json({ err: err.message });

      User.findByIdAndUpdate(
        req.payload.id,
        {
          $pull: { following: profileId },
        },
        { new: true },
        (err, updatedUser) => {
          if (err) return res.status(422).json({ err: err.message });
          return res.status(200).json({ user: updatedUser.toJSON() });
        }
      );
    }
  ).catch(next);
});

// Posts belonging to a user
router.get("/:username/posts", auth.optional, (req, res, next) => {
  var profileId = req.profile._id;

  User.findById(profileId).then((user) => {
    if (!user) return res.sendStatus(404);

    Post.find({ author: user })
      .populate("author")
      .sort("-createdAt")
      .then((posts) => {
        return res.json({
          posts: posts.map((post) => post.toJSON()),
        });
      })
      .catch(next);
  });
});

module.exports = router;
