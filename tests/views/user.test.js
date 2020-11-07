const request = require("supertest");

const app = require("./app");
const dbHandler = require("../db-handler");
const userModel = require("../../models/User");

var token = "";

beforeAll(async () => {
  await dbHandler.connect();

  const user1 = {
    username: "testuser",
    password: "testuser",
    email: "testuser@gmail.com",
  };
  const user2 = {
    username: "testuser2",
    password: "testuser2",
    email: "testuser2@gmail.com",
  };

  const createUser = async (user) => {
    const validUser = await userModel(user);
    await validUser.setPassword(user.password);
    return await validUser.save();
  };

  await createUser(user1);
  await createUser(user2);

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
  await new Promise((resolve) => setTimeout(() => resolve(), 500));
});

describe("Auth", () => {
  it("Follow another user", async () => {
    const res = await request(app)
      .post("/api/users/testuser2/follow")
      .set("Accept", "application/json")
      .set("Authorization", "Token " + token);
    expect(res.statusCode).toBe(201);
    expect(res.body.user.following_count).toBe(1);
  });

  it("Unfollow another user", async () => {
    const res = await request(app)
      .delete("/api/users/testuser2/unfollow")
      .set("Accept", "application/json")
      .set("Authorization", "Token " + token);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.following_count).toBe(0);
  });

  it("Get posts belonging to a user", async () => {
    const res = await request(app).get("/api/users/testuser2/posts");
    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toBeDefined();
  });
});
