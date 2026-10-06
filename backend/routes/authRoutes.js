const express = require("express");

const {
  login,
  getMe,
} = require("../controllers/authController");

const authMiddleware =
  require("../middleware/auth");

const router =
  express.Router();

/* =========================================================
   PUBLIC LOGIN
========================================================= */

router.post(
  "/login",
  login
);

/* =========================================================
   PROTECTED CURRENT USER
========================================================= */

router.get(
  "/me",
  authMiddleware,
  getMe
);

module.exports = router; 