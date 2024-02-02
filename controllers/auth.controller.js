const User = require("../models/user.model");
const { SERVER_ERR, PHONE_ALREADY_EXISTS_ERR, EMAIL_ALREADY_EXISTS_ERR } = require("../errors");
const { createJwtToken } = require("../utils/token.util");
const { generateOTP, emailToSMS } = require('../utils/otp.util');

// --------------------- create new user ---------------------------------

// Create a new user
exports.createNewUser = async (req, res, next) => {
  try {
    let { mobileNumber, name, email, company } = req.body;

    // check duplicate phone Number
    const phoneExist = await User.findOne({ mobileNumber });

    if (phoneExist) {
      // Include a meaningful error message
      next({ status: 400, message: PHONE_ALREADY_EXISTS_ERR });
      return;
    }

    // create new user
    const createUser = new User({
      mobileNumber,
      name,
      email,
      company,
    });

    // save user
    const user = await createUser.save();

    // generate otp
    const otp = generateOTP(6);

    // save otp to user collection
    user.phoneOtp = otp;
    await user.save();

    // send otp to user's email address using email-to-SMS gateway
    // await emailToSMS({
    //   message: `Your OTP is ${otp}`,
    //   contactNumber: user.mobileNumber,
    //   userEmail: user.email, // Pass the user's email address
    // }, next);

    res.status(200).json({
      type: 'success',
      message: 'Account created, OTP sent to mobile number',
      data: {
        userId: user._id,
      },
    });
  } catch (error) {
    // Handle errors
    if (error.code === 11000) {
      // Duplicate key violation (email already exists)
      next({ status: 400, message: EMAIL_ALREADY_EXISTS_ERR });
    } else {
      // Other errors
      next({ status: 500, message: SERVER_ERR, data: error });
    }
  }
};
// ------------ login with phone otp ----------------------------------

exports.loginUser = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;
    const user = await User.findOne({ mobileNumber });

    if (!user) {
      next({ status: 400, message: PHONE_NOT_FOUND_ERR });
      return;
    }

    res.status(201).json({
      type: "success",
      message: "OTP sent to your registered phone number",
      data: {
        userId: user._id,
      },
    });

    // generate otp
    const otp = generateOTP(6);
    // save otp to user collection
    user.phoneOtp = otp;
    user.isAccountVerified = true;
    await user.save();
    // send otp to phone number
    await emailToSMS(
      {
        message: `Your OTP is ${otp}`,
        contactNumber: user.mobileNumber,
        userEmail: user.email,
      },
      next
    );
  } catch (error) {
    next(error);
  }
};

// ---------------------- verify phone otp -------------------------

exports.verifyPhoneOtp = async (req, res, next) => {
  try {
    const { otp, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      next({ status: 400, message: USER_NOT_FOUND_ERR });
      return;
    }

    if (user.phoneOtp !== otp) {
      next({ status: 400, message: INCORRECT_OTP_ERR });
      return;
    }
    const token = createJwtToken({ userId: user._id });

    user.phoneOtp = "";
    await user.save();

    res.status(201).json({
      type: "success",
      message: "OTP verified successfully",
      data: {
        token,
        userId: user._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------- fetch current user -------------------------

exports.fetchCurrentUser = async (req, res, next) => {
  try {
    const currentUser = res.locals.user;

    return res.status(200).json({
      type: "success",
      message: "Fetch current user",
      data: {
        user: currentUser,
      },
    });
  } catch (error) {
    next(error);
  }
};