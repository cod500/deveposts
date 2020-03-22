const express = require("express");
const router = express.Router();
const passport = require("passport");

//Google authorization page
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/posts");
  }
);

//Twitter authorization
router.get("/auth/github", passport.authenticate("github", {scope: ["user:email"]}));

router.get("/auth/github/callback",
  passport.authenticate("github"),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

//Log out of current user
router.get("/auth/logout", (req, res) => {
  req.logout();
  res.redirect("/posts");
});

module.exports = router;
