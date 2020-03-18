const express = require("express");
const router = express.Router();
const Post = require("../models/posts");
const { auth, guest } = require("../../auth/auth");

// Get home page
router.get("/", guest, async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ date: -1 })
      .limit(12)
      .populate("user");
    res.render("index/welcome", {
      posts
    });
  } catch (e) {
    res.send(e);
  }
});

//Get login page
router.get("/signup", guest, async (req, res) => {
  res.render("index/sign-up");
});

//Get login page
router.get("/login", guest, async (req, res) => {
  res.render("index/login");
});

//Get email log in page
router.get("/login/email", (req, res) => {
  res.render("index/email-login", {
    error_msg: req.flash("error")
  });
});

module.exports = router;
