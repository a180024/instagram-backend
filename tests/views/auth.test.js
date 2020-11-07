const request = require("supertest");

const app = require("./app");
const dbHandler = require("../db-handler");

beforeAll(async () => {
  await dbHandler.connect();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
  await new Promise(resolve => setTimeout(() => resolve(), 500));
});

describe("Auth", () => {
  it("User Signup", async () => {
    const user = {
      user: {
        username: "testuser",
        password: "testuser",
        email: "testuser@gmail.com",
      },
    };

    const { body } = await request(app).post("/api/auth/signup").send(user);
    expect(body.user).toBeDefined();
  });

  it("Invalid User Signup", async () => {
    // Without password
    const user = {
      user: {
        username: "testuser",
        email: "testuser@gmail.com",
      },
    };

    const res = await request(app).post("/api/auth/signup").send(user);
    expect(res.statusCode).toBe(422);
  });

  it("User Login", async () => {
    const user = {
      user: {
        username: "testuser",
        password: "testuser",
        email: "testuser@gmail.com",
      },
    };

    const res = await request(app).post("/api/auth/login").send(user);
    console.log(res.body);
    expect(res.statusCode).toBe(200);
  });

  it("Invalid User Login", async () => {
    // Wrong password
    const user = {
      user: {
        username: "testuser",
        password: "testuser2",
        email: "testuser@gmail.com",
      },
    };

    const res = await request(app).post("/api/auth/login").send(user);
    expect(res.statusCode).toBe(422);
  });
});

