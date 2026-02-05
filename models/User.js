const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String, // hashed password (optional)
      default: null,
    },

    loginMethod: {
      type: String,
      enum: ["OTP", "PASSWORD"],
      default: "OTP",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    otp: String,
    otpExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
