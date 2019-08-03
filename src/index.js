const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("express-jwt");
const jwtKsRsa = require("jwks-rsa");
const { startDatabase } = require("./database/mongo");
const { getAds, insertAd, deleteAd, updateAd } = require("./database/ads");

const app = express();

const ads = [
  {
    title: "Hello World"
  }
];

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined"));

app.get("/", async (req, res) => {
  res.send(await getAds());
});

const checkJwt = jwt({
  secret: jwtKsRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://shackox.auth0.com/.well-known/jwks.json`
  }),
  audience: "https://ads-api",
  issuer: `https://shackox.auth0.com/`,
  algorithms: ["RS256"]
});

app.use(checkJwt);

app.post("/", async (req, res) => {
  const newAd = req.body;
  await insertAd(newAd);

  res.send({ message: "New ad inserted." });
});

app.delete("/:id", async (req, res) => {
  await deleteAd(req.params.id);
  res.send({ message: "Ad removed." });
});

app.put("/:id", async (req, res) => {
  const updatedAd = req.body;
  await updateAd(req.params.id, updatedAd);

  res.send({ message: "Ad updated." });
});

startDatabase().then(async () => {
  await insertAd({ title: "In-memory database" });

  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
});
