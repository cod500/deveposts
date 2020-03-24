const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { auth, guest } = require("../../auth/auth");
const Post = require("../models/posts");
const Profile = require("../models/profiles");
const User = require("../models/users");

//Base64 buffer image to extension
//Finds extension by first character in buffer 
function buffertoImage(buff) {
  const image = buff.toString("base64");
  let stringImage;
  switch (image.charAt(0)) {
    case "i":
      stringImage = "image/png";
      break;
    case "/":
      stringImage = "image/jpg";
      break;
    case "R":
      stringImage = "gif";
      break;
    case "U":
      stringImage = "webp";
      break;
  }
  return stringImage;
}

//Get user profile
router.get("/profile/user/:id", auth, async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.params.id,
      status: "public"
    })
      .populate("user")
      .populate("comments.commentUser");

    const profile = await Profile.findOne({ user: req.params.id })
      .populate("user")
      .populate("following.followedUser");
    const userProfile = await Profile.findOne({ user: req.user.id });

    res.render("profiles/profile", {
      posts,
      profile,
      userProfile
    });
  } catch (e) {
    res.status(500).send({ error: "Unable to find user" });
  }
});

//Get user profile image
router.get("/profile/image/:id", async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id }).populate(
      "user"
    );
    res.set("Content-Type", `${buffertoImage(profile.user.image)}`);
    res.send(profile.user.image);
  } catch (e) {
    res.status(404).send(e);
  }
});

//Edit profile page
router.get("/profile/edit/", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    res.render("profiles/edit", {
      profile
    });
  } catch (e) {
    res.send(e);
  }
});

// Edit user profile
router.put("/profile/edit/:id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id });

    let allowComments;

    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }


    //Change values in database
    profile.job = req.body.job;
    profile.school = req.body.school;
    profile.location = req.body.location;
    profile.home = req.body.home;
    profile.goals = req.body.goals;
    profile.allowComments = allowComments;

    await profile.save();
    res.redirect(`/profile/user/${req.user.id}`);
  } catch (e) {
    res.send(e);
  }
});

//Get profile following list
router.get("/profile/user/following/:id", auth, async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.id })
    .populate("user")
    .populate("following.followedUser");
  const userProfile = await (
    await Profile.findOne({ user: req.user.id })
  ).populate("following.followedUser");
  res.render("profiles/following", {
    profile,
    userProfile
  });
});

module.exports = router;
