const mongoose = require("mongoose");

const dbHandler = require("../db-handler");
const userModel = require("../../models/User");

beforeAll(async () => await dbHandler.connect());

afterEach(async () => await dbHandler.clearDatabase());

afterAll(async () => {
  await dbHandler.closeDatabase();
  await new Promise((resolve) => setTimeout(() => resolve(), 500));
});

describe("User", () => {
  it("Create valid user", async () => {
    const user = {
      username: "testuser",
      password: "testuser",
      email: "testuser@gmail.com",
    };
    const validUser = await userModel(user);
    await validUser.setPassword(user.password);
    const savedUser = await validUser.save();
    expect(savedUser.username).toBe(user.username);
    expect(savedUser.email).toBe(user.email);
    expect(savedUser.hash).toEqual(expect.anything());
    expect(savedUser.salt).toEqual(expect.anything());
  });

  it("Create user with missing fields", async () => {
    const userWithoutRequiredField = await userModel({
      username: "testuser",
      email: "testuser@gmail.com",
    });
    let err;
    try {
      await userWithoutRequiredField.save();
      // error = savedUserWithoutRequiredField;
    } catch (error) {
      // console.log(error);
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.salt).toBeDefined();
    expect(err.errors.hash).toBeDefined();
  });
});

