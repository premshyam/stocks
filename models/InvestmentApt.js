const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.set("useFindAndModify", false);

const optionSchema = new Schema({
  choice: { type: String, required: true },
  choice_description: { type: String, required: true }
});

const investmentAptSchema = new Schema({
  question: { type: String, required: true },
  ques_description: { type: String, required: true },
  options: [optionSchema]
});

module.exports = mongoose.model("InvestmentApt", investmentAptSchema);
