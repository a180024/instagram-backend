const request = require("supertest");

const app = require("./app");
const dbHandler = require("../db-handler");
const userModel = require("../../models/User");
const postModel = require("../../models/Post");
const commentModel = require("../../models/Comment");

var token = "";
var postSlug = "";
var commentID = "";

beforeAll(async () => {
  await dbHandler.connect();

  const user = {
    username: "testuser",
    password: "testuser",
    email: "testuser@gmail.com",
  };
  const createUser = async (user) => {
    const validUser = await userModel(user);
    await validUser.setPassword(user.password);
    return await validUser.save();
  };

  const post = {
    title: "Test post",
    body: "This is a test post",
  };
  const createPost = async (post) => {
    return await postModel(post);
  };

  const comment = {
    body: "This is a test comment",
  };
  const createComment = async (comment) => {
    return await commentModel(comment);
  };

  const savedUser = await createUser(user);
  const validPost = await createPost(post);
  validPost.author = savedUser;
  validPost.save().then((post) => {
    postSlug = post.slug;
  });

  const validComment = await createComment(comment);
  validComment.author = savedUser;
  validComment.post = validPost;
  validComment.save().then((comment) => {
    commentID = comment._id;
  });

  const res = await request(app)
    .post("/api/auth/login")
    .send({
      user: {
        username: "testuser",
        password: "testuser",
      },
    });
  token = res.body.user.token;
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe("Post", () => {
  it("Get all posts", async () => {
    const res = await request(app).get("/api/posts");
    expect(res.statusCode).toBe(200);
  });

  it("Get user's feed", async () => {
    const res = await request(app)
      .get("/api/posts/feed")
      .set("Authorization", "Token " + token);
    expect(res.statusCode).toBe(200);
  });

  it("Create a post", async () => {
    const res = await request(app)
      .post("/api/posts/create")
      .set("Authorization", "Token " + token)
      .send({
        post: {
          title: "Test post",
          body: "This is a test post",
        },
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.post).toBeDefined();
  });

  it("Get a post", async () => {
    const res = await request(app).get(`/api/posts/${postSlug}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.post).toBeDefined();
    console.log(res.body.post);
  });

  it("Update a post", async () => {
    const res = await request(app)
      .put(`/api/posts/${postSlug}`)
      .set("Authorization", "Token " + token)
      .send({
        post: {
          title: "Test post",
          body: "This is a test post",
        },
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.post).toBeDefined();
  });

  it("Like a post", async () => {
    const res = await request(app)
      .post(`/api/posts/${postSlug}/like`)
      .set("Authorization", "Token " + token);
    expect(res.statusCode).toBe(200);
    expect(res.body.post.likes_count).toBe(1);
  });

  it("Unlike a post", async () => {
    const res = await request(app)
      .post(`/api/posts/${postSlug}/unlike`)
      .set("Authorization", "Token " + token);
    expect(res.statusCode).toBe(200);
    expect(res.body.post.likes_count).toBe(0);
  });

  it("Create a comment", async () => {
    const res = await request(app)
      .post(`/api/posts/${postSlug}/comments`)
      .set("Authorization", "Token " + token)
      .send({
        comment: {
          body: "Test comment",
        },
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.post).toBeDefined();
  });

  it("Get comments under post", async () => {
    const res = await request(app).get(`/api/posts/${postSlug}/comments`);
    expect(res.statusCode).toBe(200);
    expect(res.body.comments.length).toBeDefined();
  });

  it("Delete comment", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postSlug}/comments/${commentID}`)
      .set("Authorization", "Token " + token);
    expect(res.statusCode).toBe(200);
    expect(res.body.post.comments_count).toBeLessThan(2);
  });

  it("Delete post", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postSlug}`)
      .set("Authorization", "Token " + token);
    expect(res.statusCode).toBe(204);
  });
});
