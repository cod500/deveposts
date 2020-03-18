//Database
require("./db/mongoose");

const express = require("express");
const path = require("path");
const hbs = require("express-handlebars");
const passport = require("passport");
const bodyParser = require("body-parser");
const multer = require("multer");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const authRouter = require("../src/routers/auth");
const indexRouter = require("../src/routers/index");
const postRouter = require("../src/routers/posts");
const profileRouter = require("../src/routers/profiles");
const userRouter = require("../src/routers/users");

//Init express
const app = express();

//Handlebars helpers
const {truncate,stripTags,formatDate, select, editIcon, editProfile, getStatus, myProfile} = require("../helpers/hbs");

//Passport
require("../auth/passport")(passport);

//Handlebars middleware
app.engine(
  "handlebars",
  hbs({
    defaultLayout: "main",
    helpers: {
      truncate,
      stripTags,
      formatDate,
      select,
      editIcon,
      editProfile,
      getStatus,
      myProfile
    }
  })
);
app.set("view engine", "handlebars");

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Static public folder
app.use(express.static("public"));




//Sesison middleware
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

//Cookie parser middleware
app.use(cookieParser());

//Method Override Middleware
app.use(methodOverride("_method"));


// Connect-flash middleware
app.use(flash());

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Set global variable
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

//Routers
app.use(authRouter);
app.use(indexRouter);
app.use(userRouter);
app.use(postRouter);
app.use(profileRouter);

app.get('/*', (req, res) =>{
  res.redirect('/');
})

const port = process.env.PORT;

//Express server
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
