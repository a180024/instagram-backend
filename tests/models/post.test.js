const mongoose = require("mongoose");

const dbHandler = require("../db-handler");
const postModel = require("../../models/Post");
const userModel = require("../../models/User");
const commentModel = require("../../models/Comment");
const likeModel = require("../../models/Like");

// fixtures
beforeAll(async () => {
  await dbHandler.connect();
  const user = {
    username: "testuser",
    password: "testuser",
    email: "testuser@gmail.com",
  };
  const validUser = await userModel(user);
  await validUser.setPassword(user.password);
  await validUser.save();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
  await new Promise(resolve => setTimeout(() => resolve(), 500)); 
});

describe("Post", () => {
  it("Create valid post", async () => {
    const post = {
      title: "This is a test-post.",
      body: "Test body",
    };
    const savedUser = await userModel.findOne({ username: "testuser" });
    const validPost = await postModel(post);
    validPost.author = savedUser;
    const savedPost = await validPost.save();
    expect(savedPost.title).toBe(post.title);
    expect(savedPost.body).toBe(post.body);
    expect(savedPost.author).toBe(savedUser);
  });

  it("Create post with missing fields", async () => {
    const post = {
      title: "This is a test-post.",
    };
    const postWithMissingField = await postModel(post);
    let err;
    try {
      await postWithMissingField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.body).toBeDefined();
  });

  it("Insert a comment", async () => {
    const savedPost = await postModel.findOne({
      title: "This is a test-post.",
    });
    const savedUser = await userModel.findOne({ username: "testuser" });
    const validComment = await commentModel({ body: "Test comment" });
    validComment.post = savedPost;
    validComment.author = savedUser;
    const savedComment = await validComment.save();
    savedPost.comments.push(savedComment);
    expect(savedPost.comments.length).toBe(1);
  });

  it("Like a post", async () => {
    const savedPost = await postModel.findOne({
      title: "This is a test-post.",
    });
    const savedUser = await userModel.findOne({ username: "testuser" });
    const validLike = await likeModel();
    validLike.post = savedPost;
    validLike.author = savedUser;
    const savedLike = await validLike.save();
    savedPost.likes.push(savedLike);
    expect(savedPost.likes.length).toBe(1);
  });
});

