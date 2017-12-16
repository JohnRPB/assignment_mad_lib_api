const express = require("express");
const app = express();

// ----------------------------------------
// App Variables
// ----------------------------------------
app.locals.appName = "madlib";

// ----------------------------------------
// ENV
// ----------------------------------------
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// ----------------------------------------
// Body Parser
// ----------------------------------------
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------------------------------
// Sessions/Cookies
// ----------------------------------------
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "secret"]
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ----------------------------------------
// Passport
// ----------------------------------------
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
app.use(passport.initialize());
app.use(passport.session());

const User = require("./models/user");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/madlib");

passport.use(
  new LocalStrategy({ usernameField: "email" }, function(
    email,
    password,
    done
  ) {
    User.findOne({ email }, function(err, user) {
      console.log(user);
      if (err) return done(err);
      if (!user || !user.validatePassword(password)) {
        return done(null, false, { message: "Invalid username/password" });
      }
      return done(null, user);
    });
  })
);

passport.use( 
  new BearerStrategy((token, done) => {
    // Find the user by token
    User.findOne({ token: token })
      .then(user => {
          // Pass the user if found else false
      return done(null, user || false);
        })
    .catch(e => done(null, false));
  });
);
  
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// ----------------------------------------
//middleware to connect to MongoDB via mongoose in your `app.js`
// ----------------------------------------
//mongoose.connect("mongodb://localhost/assignment_ponz_scheme");
app.use((req, res, next) => {
  if (mongoose.connection.readyState) {
    next();
  } else {
    require("./mongo")().then(() => next());
  }
});

// ----------------------------------------
// Flash Messages
// ----------------------------------------
const flash = require("express-flash-messages");
app.use(flash());

// ----------------------------------------
// Method Override
// ----------------------------------------
const methodOverride = require("method-override");
const getPostSupport = require("express-method-override-get-post-support");

app.use(
  methodOverride(
    getPostSupport.callback,
    getPostSupport.options // { methods: ['POST', 'GET'] }
  )
);

// ----------------------------------------
// Referrer
// ----------------------------------------
app.use((req, res, next) => {
  req.session.backUrl = req.header("Referer") || "/";
  next();
});

// ----------------------------------------
// Public
// ----------------------------------------
app.use(express.static(`${__dirname}/public`));

// ----------------------------------------
// Logging
// ----------------------------------------
const morgan = require("morgan");
const morganToolkit = require("morgan-toolkit")(morgan, {
  req: ["cookies" /*, 'signedCookies' */]
});

app.use(morganToolkit());

// ----------------------------------------
// Routes
// ----------------------------------------
// app.use("/", (req, res) => {
//   req.flash("Hi!");
//   res.render("welcome/index");
// });

const madLibRouter = require('./routers/madLibRouter');

app.use('/api/v1', madLibRouter);

app.get("/", async (req, res) => {
  try {
    console.log(req.session.passport);
    if (req.session.passport && req.session.passport.user) {
      let currentUser = await User.findById(req.session.passport.user);
      console.log("currentUser: ", currentUser);
      res.render("welcome/index", { currentUser });
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

var faker = require("faker");

app.get("/words/nouns", (req, res) => {
  let nounArr = Array(1000).map(elem => faker.hacker.noun());
  res.json(nounArr);
});
app.get("/words/adjectives", (req, res) => {
  // the below should be moved elsewhere
  let verbArr = Array(1000).map(elem => faker.hacker.verb());
  let adverbArr = verbArr.map(elem => elem + "ly");

  let adjArr = Array(1000).map(elem => faker.hacker.adjectives());
  res.json(adjArr);
});

// ----------------------------------------
// Session Helper Middlewares
// ----------------------------------------

// Set up middleware to allow/disallow login/logout
const loggedInOnly = (req, res, next) => {
  return req.user ? next() : res.redirect("/login");
};
const loggedOutOnly = (req, res, next) => {
  return !req.user ? next() : res.redirect("/");
};

const onLogout = (req, res) => {
  // Passport convenience method to logout
  req.logout();

  // Ensure always redirecting as GET
  req.method = "GET";
  res.redirect("/login");
};

app.get("/logout", loggedInOnly, onLogout);
app.delete("/logout", loggedInOnly, onLogout);

app.get("/register", (req, res) => {
  res.render("register");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

app.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //let parent = await User.findById(referrer);
    const user = await new User({
      email,
      password
    });
    console.log("email:", email, " password:", password);
    user.save(err => {
      res.redirect("/login");
    });
  } catch (err) {
    console.log(err);
  }
});

// ----------------------------------------
// Template Engine
// ----------------------------------------
const expressHandlebars = require("express-handlebars");
const helpers = require("./helpers");

const hbs = expressHandlebars.create({
  helpers: helpers,
  partialsDir: "views/",
  defaultLayout: "application"
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// ----------------------------------------
// Server
// ----------------------------------------
const port = process.env.PORT || process.argv[2] || 3000;
const host = "localhost";

let args;
process.env.NODE_ENV === "production" ? (args = [port]) : (args = [port, host]);

args.push(() => {
  console.log(`Listening: http://${host}:${port}\n`);
});

if (require.main === module) {
  app.listen.apply(app, args);
}

// ----------------------------------------
// Error Handling
// ----------------------------------------
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.stack) {
    err = err.stack;
  }
  res.status(500).render("errors/500", { error: err });
});

module.exports = app;
