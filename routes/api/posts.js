const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("../auth");
const Post = mongoose.model("Post");
const Comment = mongoose.model("Comment");
const User = mongoose.model("User");

// Preload post objects on routes with ':post'
router.param("post", (req, res, next, slug) => {
  Post.findOne({ slug: slug })
    .populate("author")
    .then((post) => {
      if (!post) return res.sendStatus(404);
      req.post = post;

      return next();
    })
    .catch(next);
});

// Preload comment objects on routes with ':comment'
router.param("comment", (req, res, next, id) => {
  Comment.findById(id)
    .then((comment) => {
      if (!comment) return res.sendStatus(404);

      req.comment = comment;

      return next();
    })
    .catch(next);
});

// All posts
router.get("/", auth.optional, (req, res, next) => {
  Post.find()
    .populate("author")
    .sort("-createdAt")
    .then((posts) => {
      return res.json({
        posts: posts.map((post) => post.toJSON()),
      });
    })
    .catch(next);
});

// User's feed
router.get("/feed", auth.required, (req, res, next) => {
  User.findById(req.payload.id)
    .then((user) => {
      if (!user) return res.sendStatus(401);

      Post.find({ author: { $in: user.following } })
        .populate("author")
        .sort("-createdAt")
        .then((posts) => {
          return res.json({
            posts: posts.map((post) => post.toJSON()),
          });
        });
    })
    .catch(next);
});

// Create post
router.post("/create", auth.required, (req, res, next) => {
  User.findById(req.payload.id)
    .then((user) => {
      if (!user) return res.sendStatus(401);

      const post = new Post(req.body.post);
      post.author = user;
      post.save().then((post) => {
        res.status(201).json({ post: post.toJSON() });
      });
    })
    .catch(next);
});

// Get Individual Post
router.get("/:post", auth.optional, (req, res, next) => {
  return res.json({
    post: req.post.toJSON(),
  });
});

// Update post
router.put("/:post", auth.required, (req, res, next) => {
  User.findById(req.payload.id)
    .then((user) => {
      if (!user) return res.sendStatus(401);

      if (req.post.author._id.toString() === req.payload.id.toString()) {
        if (typeof req.body.post.title !== "undefined") {
          req.post.title = req.body.post.title;
        }
        if (typeof req.body.post.body !== "undefined") {
          req.post.body = req.body.post.body;
        }

        req.post.save().then((post) => {
          return res.json({ post: post.toJSON() });
        });
      } else {
        return res.sendStatus(403);
      }
    })
    .catch(next);
});

// Delete post
router.delete("/:post", auth.required, (req, res, next) => {
  User.findById(req.payload.id)
    .then((user) => {
      if (!user) return res.sendStatus(401);

      if (req.post.author._id.toString() === req.payload.id.toString()) {
        req.post.remove().then(() => {
          return res.sendStatus(204);
        });
      } else {
        return res.sendStatus(403);
      }
    })
    .catch(next);
});

// Like Post
router.post("/:post/like", auth.required, (req, res, next) => {
  User.findById(req.payload.id)
    .then((user) => {
      if (!user) return res.sendStatus(401);

      req.post.likes.addToSet(req.payload.id);

      req.post.save().then((post) => {
        return res.json({ post: post.toJSON() });
      });
    })
    .catch(next);
});

// Unlike Post
router.post("/:post/unlike", auth.required, (req, res, next) => {
  User.findById(req.payload.id)
    .then((user) => {
      if (!user) return res.sendStatus(401);

      if (req.post.likes.indexOf(req.payload.id) !== -1) {
        req.post.likes.remove(req.payload.id);
      }

      req.post.save().then((post) => {
        return res.json({ post: post.toJSON() });
      });
    })
    .catch(next);
});

// Load Comments for Post
router.get("/:post/comments", auth.optional, (req, res, next) => {
  req.post
    .populate({
      path: "comments",
      populate: {
        path: "author",
      },
      options: {
        sort: {
          createdAt: "desc",
        },
      },
    })
    .execPopulate()
    .then((post) => {
      return res.json({
        comments: req.post.comments.map((comment) => comment.toJSON()),
      });
    })
    .catch(next);
});

// Create Comment
router.post("/:post/comments", auth.required, (req, res, next) => {
  User.findById(req.payload.id)
    .then((user) => {
      if (!user) return res.sendStatus(401);

      var comment = new Comment(req.body.comment);
      comment.author = user;
      comment.post = req.post;

      return comment.save().then(() => {
        req.post.comments.push(comment);

        return req.post.save().then((post) => {
          return res.status(201).json({ post: post });
        });
      });
    })
    .catch(next);
});

// Delete Comment
router.delete("/:post/comments/:comment", auth.required, (req, res, next) => {
  User.findById(req.payload.id)
    .then((user) => {
      if (!user) return res.sendStatus(401);

      if (req.comment.author.toString() === req.payload.id.toString()) {
        req.post.comments.remove(req.comment._id);

        req.post
          .save()
          .then(Comment.find({ _id: req.comment_id }).remove().exec())
          .then((post) => {
            return res.json({ post: post });
          });
      } else {
        res.sendStatus(403);
      }
    })
    .catch(next);
});

module.exports = router;
