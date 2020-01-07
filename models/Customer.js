const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.set("useFindAndModify", false);

const cartSchema = new Schema({
  // menu_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Menus",
  //   required: true
  // },
  quantity: { type: Number, required: true }
});
const customerSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, required: true, default: false },
  cart: [cartSchema],
  resetToken: { type: String },
  resetTokenExpiration: { type: Date }
});
module.exports = mongoose.model("Customer", customerSchema);
