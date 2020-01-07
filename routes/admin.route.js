module.exports = app => {
  const AdminBro = require("admin-bro");
  const AdminBroExpress = require("admin-bro-expressjs");
  const AdminBroMongoose = require("admin-bro-mongoose");
  AdminBro.registerAdapter(AdminBroMongoose);
  const Customer = require("../models/Customer");
  const InvestmentApt = require("../models/InvestmentApt");
  const Token = require("../models/Token");
  const AdminBroOptions = {
    resources: [Customer, InvestmentApt, Token],
    branding: {
      companyName: "Stock Analysis"
    },
    rootPath: "/admin"
  };
  const adminBro = new AdminBro(AdminBroOptions);
  const ADMIN = {
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    password: process.env.ADMIN_PASSWORD || "nodejs"
  };

  const router = AdminBroExpress.buildRouter(adminBro);
  // const router = AdminBroExpress.buildAuthenticatedRouter(
  //   adminBro,
  //   {
  //     authenticate: async (email, password) => {
  //       if (ADMIN.password === password && ADMIN.email === email) {
  //         return ADMIN;
  //       }
  //       return false;
  //     },
  //     cookieName: "admin-bro",
  //     cookiePassword: "somepassword"
  //   },
  //   undefined,
  //   { resave: false, saveUninitialized: true }
  // );
  app.use(AdminBroOptions.rootPath, router);
};
