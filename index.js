const express = require("express");
const path = require("path"); //built in module
const { connectToMongoDB } = require("./connect");
const URL = require("./models/url");
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://127.0.0.1:27017/short-url").then(() =>
  console.log("Mongodb Connected")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json()); //middleware to parse incoming requests with JSON payloads.
app.use(express.urlencoded({ extended: false }));

app.use("/url", urlRoute);
app.use("/", staticRoute);

app.get("/:shortid", async (req, res) => {
  const shortid = req.params.shortid;

  const entry = await URL.findOneAndUpdate(
    {
      shortId: shortid,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );

  if (!entry) {
    return res.status(404).send("Short URL not found");
  }

  res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server Started at Port ${PORT}`));
