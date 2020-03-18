const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { auth, guest } = require("../../auth/auth");
const uniqid = require("uniqid");

//Require post,user, and profile models
const Post = require("../models/posts");
const User = require("../models/users");
const Profile = require("../models/profiles");

//Render all public posts
router.get("/posts", async (req, res) => {
  const posts = await Post.find({ status: "public" })
    .sort({ date: -1 })
    .populate("user")
    .populate("comments.commentUser");
  res.render("posts/all-posts", {
    posts
  });
});

//Add post form
router.get("/posts/add", auth, (req, res) => {
  res.render("posts/add");
});

//Edit post form
router.get("/posts/edit/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user")
      .sort({ date: "desc" });

    if (post.user.id === req.user.id) {
      res.render("posts/edit", {
        post
      });
    } else {
      res.redirect("/posts");
    }
  } catch (e) {
    res.send(e);
  }
});

//Process posts
router.post("/posts", auth, async (req, res) => {
  try {
    let allowComments;

    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }

    const newPost = new Post({
      body: req.body.body,
      status: req.body.status,
      postId: uniqid(),
      allowComments: allowComments,
      user: req.user.id
    });

    await newPost.save();

    res.redirect("/posts");
  } catch (e) {
    res.send(e);
  }
});

//Add comment to post
router.post("/posts/comment/:id", auth, async (req, res) => {
  const user = req.user;
  try {
    const post = await Post.findById(req.params.id);
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: user,
      user: user
    };
    post.comments.unshift(newComment);
    await post.save();

    res.send(newComment);
  } catch (e) {
    res.send(e);
  }
});

//View specific post
router.get("/posts/show/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user")
      .populate("comments.commentUser");
    if (post.status == "public") {
      res.render("posts/show", {
        post
      });
    } else {
      if (req.user) {
        if (post.user._id === req.user.id) {
          res.render("posts/show", {
            post
          });
        } else {
          res.redirect("/posts");
        }
      } else {
        res.redirect("/posts");
      }
    }
  } catch (e) {
    res.send(e);
  }
});

//Get logged in users posts
router.get("/posts/my", auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).populate("user");
    res.render("posts/index", {
      posts
    });
  } catch (e) {
    res.status(500).send({ error: "Unable to load profile" });
  }
});

//Process edit form
router.put("/posts/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });

    let allowComments = req.body.allowComments ? true : false;

    //Process New values
    post.body = req.body.body;
    post.status = req.body.status;
    post.allowComments = allowComments;

    await post.save();
    res.redirect("/posts/my");
  } catch (e) {
    res.send("error");
  }
});

// Like post and save user id to like
router.post("/posts/like/:id", auth, async (req, res) => {
  const post = await Post.findOne({ postId: req.params.id });

  let like = {
    likeUser: req.user
  };

  let likeIndex = [];

  // Check if user already liked post, if so, unlike post, if not, like post
  if (post.likes.length === 0) {
    post.likes.push(like);
    likeIndex.push(1);
  } else {
    for (let i = 0; i < post.likes.length; i++) {
      if (post.likes[i].likeUser == req.user.id) {
        console.log(post.likes[i].likeUser);
        likeIndex.push(i);
        post.likes.splice(likeIndex[0], 1);
        break;
      }
    }
  }

  if (likeIndex.length === 0) {
    post.likes.push(like);
  }

  await post.save();
  res.send(post.likes.length.toString());
});

//Delete post
router.delete("/posts/:id", auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete({ _id: req.params.id });
    res.redirect("back");
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
