const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const slugify = require("slugify");

const app = express();

// middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
const uri = process.env.DATABASE_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const blogsCollection = client.db("testingdb").collection("blogs");
    const usersCollection = client.db("testingdb").collection("users");

    // get all users data from usersCollection
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.status(200).json({
        success: true,
        message: "All Users Data Retrived Successfully!",
        data: result,
      });
    });

    // get all blog data
    app.get("/blogs", async (req, res) => {
      const result = await blogsCollection.find({ publish: true }).sort({_id: -1}).toArray();
      res.status(200).json({
        success: true,
        message: "All Data Retrived Successfully!",
        data: result,
      });
    });

    // get single blog data by slug
    app.get("/blogs/:slug", async (req, res) => {
      const { slug } = req.params;
      const result = await blogsCollection.findOne({
        slug,
      });
      res.status(200).json({
        success: true,
        message: "Data Retrived Successfully!",
        data: result,
      });
    });

    //update existing blog data by id
    app.patch("/blogs/:id", async (req, res) => {
      const { id } = req.params;
      const filters = { _id: new ObjectId(id) };
      const updated = {
        $set: {
          publish: false,
        },
      };
      const options = { upsert: true };

      const result = await blogsCollection.updateOne(filters, updated, options);

      res.status(200).json({
        success: true,
        message: "Data update is successfully",
        data: result,
      });
    });

    // delete existing blog data
    app.delete("/blogs/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: ObjectId(id) };
      const result = await blogsCollection.deleteOne(filter);
      res.status(200).json({
        success: true,
        message: "Data Deleted Successfully!",
        data: result,
      });
    });

    // blog post for using this api
    app.post("/post-blog", async (req, res) => {
      const data = req.body;
      const { slug } = data;
      const setSlug = slugify(slug, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
      });
      data["slug"] = setSlug;
      const result = await blogsCollection.insertOne(data);
      res.status(200).json({
        success: true,
        message: "Blog posted Successfully",
        data: result,
      });
    });

    // save user in my database
    app.post("/add-user", async (req, res) => {
      const data = req.body;
      const result = await usersCollection.insertOne(data);
      res.status(200).json({
        success: true,
        message: "Users Add Successfully",
        data: result,
      });
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", async (req, res) => {
  res.status(200).json({
    status: 200,
    success: true,
    message: "Welcome to Bloger Server",
  });
});

app.listen(port, () =>
  console.log(`Bloger server is running on port:- ${port}`)
);
