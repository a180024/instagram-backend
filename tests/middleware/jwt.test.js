const jwt = require("jsonwebtoken");
const expressjwt = require("express-jwt");

const generateJWT = function ({ username, id }) {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      username: username,
      id: id,
      exp: parseInt(expirationDate.getTime() / 1000, 10),
    },
    "secret"
  );
};

const getTokenFromHeaders = (req) => {
  const {
    headers: { authorization },
  } = req;

  if (authorization && authorization.split(" ")[0] === "Token") {
    return authorization.split(" ")[1];
  }
  return null;
};

describe("JWT Auth Middleware", () => {
  var req = {};
  var res = {};
  it("Valid Token", async () => {
    const credentials = { username: "testuser", id: "123456" };
    const token = generateJWT(credentials);
    req.headers = {};
    req.headers.authorization = "Token " + token;
    expressjwt({
      secret: "secret",
      algorithms: ["HS256"],
      userProperty: "payload",
      getToken: getTokenFromHeaders,
    })(req, res, function () {
      expect(req.payload.id).toBe(credentials.id);
    });
  });
  it("Incorrect secret key", async () => {
    const credentials = { username: "testuser", id: "123456" };
    const token = generateJWT(credentials);
    req.headers = {};
    req.headers.authorization = "Token " + token;
    expressjwt({
      secret: "realsecret",
      algorithms: ["HS256"],
      userProperty: "payload",
      getToken: getTokenFromHeaders,
    })(req, res, function (err) {
      expect(err.code).toBe("invalid_token");
      expect(err.message).toBe("invalid signature");
    });
  });
  it("Expired Token", async () => {
    const token = jwt.sign(
      {
        username: "testuser",
        id: "123456",
        exp: 1382412921,
      },
      "secret"
    );
    req.headers = {};
    req.headers.authorization = "Token " + token;
    expressjwt({
      secret: "secret",
      algorithms: ["HS256"],
      userProperty: "payload",
      getToken: getTokenFromHeaders,
    })(req, res, function (err) {
      expect(err.code).toBe("invalid_token");
      expect(err.message).toBe("jwt expired");
    });
  });
});
