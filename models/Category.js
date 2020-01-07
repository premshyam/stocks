const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.set("useFindAndModify", false);

const categorySchema = new Schema({});

module.exports = mongoose.model("Category", categorySchema);
