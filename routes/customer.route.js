module.exports = app => {
  const customer_controller = require("../controllers/customer.controller");
  const Customer = require("../models/Customer");
  const { body, check } = require("express-validator");
  const isAuth = require("../middleware/is-auth");
  // Customer Registration
  app.post(
    "/api/customer_signup",
    //validators for request body fields
    [
      body("first_name", "Invalid First name, enter 1 to 15 characters only")
        .trim()
        .isLength({ min: 1, max: 15 }),
      body("last_name", "Invalid Last name, enter 1 to 15 characters only")
        .trim()
        .isLength({ min: 1, max: 15 }),
      body(
        "password",
        "Password should be min 8 char and max 15 char long"
      ).isLength({ min: 8, max: 15 }),
      body("email", "Enter valid email").isEmail()
    ],
    customer_controller.signup
  );

  // Customer Login
  app.post(
    "/api/customer_login",
    [
      body("email", "Enter valid registered email").isEmail(),
      body(
        "password",
        "Password should be min 8 char and max 15 char long"
      ).isLength({ min: 8, max: 15 })
    ],
    customer_controller.login
  );

  // Customer Details
  app.get(
    "/api/email_confirmation/:token",
    [check("token").isAlphanumeric()],
    customer_controller.customer_confirm_email
  );

  // Customer reset password
  app.post(
    "/api/customer_reset_password",
    [body("email", "Enter valid registered email").isEmail()],
    customer_controller.customer_password_rest
  );

  // Customer Details
  app.get(
    "/api/customer_details/",
    //Authentication middleware
    isAuth,
    customer_controller.customer_details
  );

  // Update Customer
  app.put(
    "/api/update_customer/",
    //Authentication middleware
    isAuth,
    //validators for request body fields
    [
      body("first_name", "Invalid First name, enter 1 to 15 characters only")
        .trim()
        .isLength({ min: 1, max: 15 }),
      body("last_name", "Invalid Last name, enter 1 to 15 characters only")
        .trim()
        .isLength({ min: 1, max: 15 }),
      body(
        "password",
        "Password should be min 8 char and max 15 char long"
      ).isLength({ min: 8, max: 15 }),
      body("email", "Enter valid email").isEmail()
    ],
    customer_controller.update_customer
  );

  // Delete Customer
  app.delete(
    "/api/delete_customer/",
    //Authentication middleware
    isAuth,
    customer_controller.delete_customer
  );
};
