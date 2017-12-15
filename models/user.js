const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");
const md5 = require("md5");
const uuid = require("uuid/v4");

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    hashedPassword: {
      type: String,
      required: true
    },
    token: {
      type: String,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

UserSchema.plugin(uniqueValidator);

UserSchema.virtual("password").set(function(value) {
  this._password = value;
  this.hashedPassword = bcrypt.hashSync(value, 8);
});

UserSchema.virtual("password").get(function() {
  return this.hashedPassword;
});

UserSchema.path("hashedPassword").validate(function(val) {
  if (this._password.length < 8) {
    this.invalidate("password", "Password must be at least 8 characters");
  }
});

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.hashedPassword);
};

//hook on save
UserSchema.pre("save", function(next) {
  this.token = md5(`${this.email}${uuid()}`);
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
