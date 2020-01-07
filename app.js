//minimalist web framework for node
const express = require("express");
//request body parsing middleware.
const bodyParser = require("body-parser");
//creat the app
const app = express();
//built-in module To handle file paths
// var path = require("path");
//built-in module To handle the file system
// var fs = require("fs");
// const cloudinary = require("cloudinary");
//global object called __basedir scop is anywhere in the project
global.__basedir = __dirname;
global.dbConnection;
// middleware that only parses json
app.use(bodyParser.json({ limit: "10mb", extended: true }));
//
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
//routes for admin
require("./routes/admin.route")(app);
//middleware that only parses urlencoded bodies
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
//routes for customer
require("./routes/customer.route")(app);
// require("./routes/menu.route")(app);
// require("./routes/cart.route")(app);
// require("./routes/order.route")(app);

app.get("/", (req, res) => {
  res.send("Welcome");
});
//ODM for mongoDB (a NoSQL DB)
const mongoose = require("mongoose");
// Your Mongo Atlas Cluster
// Create a Project on Mongo Atlas and Create a Cluster and than configure it
let dev_db_url =
  // "mongodb+srv://<username>:<password>@cluster0-zevrx.mongodb.net/test?retryWrites=true&w=majority";
  "mongodb://127.0.0.1:27017/stocks";

const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected…");
    app.listen(process.env.PORT || 4000);
  })
  .catch(err => console.log(err));

// Please create your account on cloudinary and find following keys from Dashboard.
// Make Sure you verified your account via Email after creating to work it properly.
// cloudinary.config({
//   cloud_name: "premshamsundar",
//   api_key: "425991328347625",
//   api_secret: "4Z4-DI9OAScG2SP8dZzBDtzCAbQ"
// });
