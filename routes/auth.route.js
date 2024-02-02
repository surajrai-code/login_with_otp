const express = require("express");
const router = express.Router();
const {
  createNewUser,
  loginUser,
  verifyPhoneOtp,
  fetchCurrentUser,
} = require("../controllers/auth.controller");
const checkAuth = require("../middlewares/checkAuth");

router.post("/register", createNewUser);
router.post("/login_with_phone", loginUser);
router.post("/verify", verifyPhoneOtp);
router.get("/login_final", checkAuth, fetchCurrentUser);

module.exports = router;
