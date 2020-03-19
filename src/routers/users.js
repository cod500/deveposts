const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const uniqueId = require("uniqid");
const { check, validationResult } = require("express-validator");
const router = express.Router();

//Require user model
const User = require("../models/users");
const Profile = require("../models/profiles");

//Router authentication
const { auth, guest } = require("../../auth/auth");

// Init multer for image upload
const upload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image document"));
    }
    cb(undefined, true);
  }
});

//Get registration page
router.get("/register", (req, res) => {
  delete req.session.errors;
  res.render("index/register", {});
});

//Add new user to database
router.post(
  "/register",
  upload.single("image"),
  [
    check("firstName")
      .not()
      .isEmpty()
      .withMessage("Must have a name"),
    check("username")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email"),
    check("password")
      .not()
      .isEmpty()
      .withMessage("Must have passowrd")
      .isLength({ min: 8 })
      .withMessage("Password must be more than 8 characters"),
    check("confirm")
      .not()
      .isEmpty()
      .withMessage("Must confirm passowrd")
  ],
  async (req, res) => {
    const image = req.file == undefined ? " " : req.file.buffer;
    const errors = validationResult(req).array();
    const user = await User.findOne({ email: req.body.username }).catch(() =>{
      console.log(e)
    });

    if (errors.length > 0) {
      req.session.errors = errors;
      res.render("index/register", {
        errors: req.session.errors
      });
    } else if (req.body.password != req.body.confirm) {
      req.session.errors = [{ msg: "Passwords don't match" }];
      res.render("index/register", {
        errors: req.session.errors
      });
    } else if (user) {
      req.session.errors = [{ msg: "Email already taken" }];
      res.render("index/register", {
        errors: req.session.errors
      });
      delete errors;
    } else {
      try {
        const password = await bcrypt.hash(req.body.password, 8);

        const user = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          userID: uniqueId(),
          image: image,
          email: req.body.username,
          password: password
        });

        await user.save();

        const profile = new Profile({
          job: " ",
          school: " ",
          location: " ",
          home: " ",
          goals: " ",
          allowComments: true,
          user: user.id
        });

        await profile.save();
        req.flash("success_msg", "Welcome!");
        passport.authenticate("local")(req, res, () => {
          res.redirect("/posts");
        });
      } catch (e) {
        res.send(e);
      }
    }
  }
);

// Log in user
router.post("/login", async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/posts",
    failureRedirect: "/login/email",
    failureFlash: "Invalid username or password"
  })(req, res, next);
});

//Edit user settings form
router.get("/register/edit", auth, async (req, res) => {
  const user = await User.findOne({ _id: req.user.id }).catch(() =>{
    console.log(e)
  });

  res.render("users/edit-user", {
    user
  });
});

//Edit user settings
router.put(
  "/register/edit",
  auth,
  upload.single("image"),
  [
    check("firstName")
      .not()
      .isEmpty()
      .withMessage("Must have a name"),
    check("username")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req).array();
      const user = await User.findOne({ _id: req.user.id });
      const email = await User.findOne({ email: req.body.username });

      if (errors.length > 0) {
        req.session.errors = errors;
        res.render("users/edit-user", {
          errors: req.session.errors
        });
      } else if (email && req.body.username !== user.email) {
        req.session.errors = [{ msg: "Email already taken" }];
        res.render("users/edit-user", {
          errors: req.session.errors
        });
      } else {
        if (req.file !== undefined) {
          user.image = req.file.buffer;
        }
        (user.firstName = req.body.firstName),
          (user.lastName = req.body.lastName),
          (user.email = req.body.username),
          await user.save();

        req.flash("success_msg", "Settings changed!");
        res.redirect("/posts");
      }
    } catch (e) {
      res.send(e);
    }
  }
);

//Get password
router.get("/register/edit/password", auth, async (req, res) => {
  const user = await User.findOne({ _id: req.user.id });
  res.render("users/edit-password", {
    user
  });
});

// Edit password
router.put(
  "/register/edit/password",
  auth,
  [
    check("password")
      .not()
      .isEmpty()
      .withMessage("Must have passowrd")
      .isLength({ min: 8 })
      .withMessage("Password must be more than 8 characters"),
    check("confirm")
      .not()
      .isEmpty()
      .withMessage("Must confirm passowrd")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req).array();
      const user = await User.findOne({ _id: req.user.id });

      if (errors.length > 0) {
        req.session.errors = errors;
        res.render("users/edit-password", {
          errors: req.session.errors
        });
      } else {
        const newPassword = await bcrypt.hash(req.body.password, 8);
        user.password = newPassword;
        await user.save();
        req.flash("success_msg", "Password successfully changed");
        res.redirect("/posts");
      }
    } catch (e) {
      res.send(e);
    }
  }
);

// Delete account
router.delete("/register/delete", auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const profile = await Profile.findOne({ user: req.user.id });
    await user.remove();
    await profile.remove();
    req.flash("success_msg", "Account successfully deleted");
    res.redirect("/");
  } catch (e) {
    res.status(500).send();
  }
});

//Follow user
router.post("/follow/:id", auth, async (req, res) => {
  const followUser = await User.findOne({ _id: req.params.id });
  const profile = await Profile.findOne({ user: req.user.id });
  let status;

  const follow = {
    followedUser: followUser
  };

  let followerIndex = [];

  if (profile.following.length === 0) {
    profile.following.push(follow);
    followerIndex.push(1);
    status = "Following";
  } else {
    for (let i = 0; i < profile.following.length; i++) {
      if (profile.following[i].followedUser == followUser.id) {
        followerIndex.push(i);
        profile.following.splice(followerIndex[0], 1);
        status = "Follow";
        break;
      }
    }
  }

  if (followerIndex.length === 0) {
    profile.following.push(follow);
    status = "Following";
  }

  await profile.save();
  res.send(status);
});
module.exports = router;
