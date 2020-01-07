const Customer = require("../models/Customer");
const Token = require("../models/Token");
//jsonwebtokens module for generating auth tokens
const jwt = require("jsonwebtoken");
//validationResult for catching validation erros from express-validator middleware
const { validationResult } = require("express-validator");
const { transporter } = require("../util/emailer");
const crypto = require("crypto");

// Customer Signup
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Server side validation failed",
      errors: errors.array()
    });
  }
  console.log(req.body);
  // Check if Customer Already Exists with same Email
  await Customer.find({
    email: req.body.email
  })
    .then(count => {
      if (count.length > 0) {
        res.json({
          status: "failed",
          message: "Email Already Exists"
        });
      } else {
        const customer = new Customer({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          password: req.body.password
        });

        // Register Customer
        return customer.save();
      }
    })
    .then(customer => {
      // Create a verification token for this Customer
      const token = new Token({
        _userId: customer.id,
        token: crypto.randomBytes(16).toString("hex")
      });

      return token.save();
    })
    .then(tokenObj => {
      res.json({
        status: "success",
        message:
          "Customer Registered Successfully, A verification email has will be sent",
        data: tokenObj._userId
      });
      return transporter.sendMail({
        to: req.body.email,
        from: "stocks@analysis.com",
        subject: "Welcome " + req.body.first_name,
        html: `
        <p>Click this <a href="http://${req.headers.host}/api/email_confirmation/${tokenObj.token}">link</a> to verify your email.</p>
       `
      });
    })
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.log(err);
      res.json({
        status: "error",
        message: "Something went wrong",
        error: err
      });
    });
};

// Login Existing Customer
exports.login = async (req, res) => {
  await Customer.findOne({
    $and: [{ email: req.body.email }, { password: req.body.password }]
  })
    .then(result => {
      if (result) {
        // console.log(result);
        const token = jwt.sign(
          { email: result.email, userId: result._id },
          "secret",
          { expiresIn: "24h" }
        );
        // If Customer Exists
        res.json({
          status: "success",
          message: "Login Successfull",
          token: token,
          userId: result._id.toString()
        });
      } else {
        // If Customer doesn't Exists
        res.json({
          status: "failed",
          message: "Invalid Email or Password",
          data: result
        });
      }
    })
    .catch(err => {
      res.json({
        status: "error",
        message: "Something went wrong",
        error: err
      });
    });
};

// Customer Details
exports.customer_details = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Server side validation failed",
      errors: errors.array()
    });
  }
  await Customer.findOne({ _id: req.userId })
    .then(result => {
      if (result) {
        res.json({
          status: "success",
          message: "Customer Found",
          data: result
        });
      } else {
        res.json({
          status: "failed",
          message: "Customer Not Found",
          data: result
        });
      }
    })
    .catch(err => {
      res.json({
        status: "error",
        message: "Something went wrong",
        error: err
      });
    });
};

// Fetch All Customers
exports.customers = async (req, res) => {
  await Customer.find()
    .then(result => {
      res.json({
        status: "success",
        message: result.length + " Customers Found",
        data: result
      });
    })
    .catch(err => {
      res.json({
        status: "error",
        message: "Something went wrong",
        error: err
      });
    });
};

// Update Customer
exports.update_customer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Server side validation failed",
      errors: errors.array()
    });
  }
  await Customer.findByIdAndUpdate(
    req.userId,
    { $set: req.body },
    (err, customer) => {
      if (err) {
        res.json({
          status: "error",
          message: "Something went wrong",
          error: err
        });
      } else {
        if (customer) {
          res.json({
            status: "success",
            message: "Customer Updated Successfully"
          });
        } else {
          res.json({
            status: "failed",
            message: "Customer Not Found"
          });
        }
      }
    }
  );
};

// Delete Customer
exports.delete_customer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Server side validation failed",
      errors: errors.array()
    });
  }
  await Customer.findByIdAndDelete(req.userId)
    .then(result => {
      if (result) {
        res.json({
          status: "success",
          message: "Customer Deleted Successfully"
        });
      } else {
        res.json({
          status: "failed",
          message: "Customer Not Found"
        });
      }
    })
    .catch(err => {
      res.json({
        status: "error",
        message: "Something went wrong",
        error: err
      });
    });
};

exports.customer_confirm_email = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Server side validation failed",
      errors: errors.array()
    });
  }
  await Token.findOne({ token: req.params.token })
    .then(tokenObj => {
      if (!tokenObj) {
        res.json({
          status: "failed",
          message: "Token expired or unable to find it."
        });
        return;
      }
      return Customer.findOne({ _id: tokenObj._userId });
    })
    .then(customer => {
      if (!customer) {
        res.json({
          status: "failed",
          message: "Customer Not Found"
        });
        return;
      }
      if (customer.verified) {
        res.json({
          status: 400,
          message: "Customer already been verified"
        });
        return;
      }
      customer.verified = true;
      return customer.save();
    })
    .then(() => {
      res.json({
        status: "success",
        message: "Customer successfully verified"
      });
    })
    .catch(err => {
      res.json({
        status: "error",
        message: "Something went wrong",
        error: err
      });
    });
};

// Customer reset password
exports.customer_password_rest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Server side validation failed",
      errors: errors.array()
    });
  }
  await crypto.randomBytes(16, (err, buf) => {
    if (err) {
      console.log(err);
      throw err;
    }
    const token = buf.toString("hex");
    Customer.findOne({ email: req.body.email })
      .then(customer => {
        if (!customer) {
          res.json({
            status: "failed",
            message: "Customer Not Found"
          });
          return;
        }
        customer.resetToken = token;
        customer.resetTokenExpiration = Date.now() + 3600000;
        return customer.save();
      })
      .then(result => {
        res.json({
          status: "success",
          message: "Password reset email sent"
        });
        transporter.sendMail({
          to: req.body.email,
          from: "stocks@analysis.com",
          subject: "Password Reset",
          html: `
           <p>You requested a password reset</p>
           <p>Click this <a href="http://localhost:4000/reset_password/${result.resetToken}">link</a> to set a new password.</p>
          `
        });
      })
      .catch(err => {
        res.json({
          status: "error",
          message: "Something went wrong",
          error: err
        });
      });
  });
};

// exports.customer_set_new_password = async (req, res) => {
//   await Customer.findOne({
//     restToken: req.params.id,
//     restTokenExpiration: { $gt: Date.now() }
//   })
//     .then(customer => {

//     })
//     .catch(err => {
//       console.log(err);
//     });
// };
