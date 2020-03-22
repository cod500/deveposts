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
router.get("/auth/facebook", passport.authenticate("facebook", {scope: ["email"]}));

router.get("/auth/facebook/callback",
  passport.authenticate("facebook"),
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
