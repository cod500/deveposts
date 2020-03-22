const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
  googleID: {
    type: String
  },
  facebookID: {
    type: String
  },
  userID: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
        if (!validator.isEmail(value)) {
            throw new Error('Email is invalid')
        }
    }
  },
  password: {
    type: String,
    minlength: 8,
    trim: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  urlImage: {
    type: String
  },
  image: {
    type: Buffer
  }
});

// Delete password from user object
UserSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    return userObject
}

// UserSchema.pre('save', async function (next){
//     const user = this
//     if (user.isModified('password')) {
//     user.password = await bcrypt.hash(user.password, 8)
//     }
//     next()
// })

const User = mongoose.model("users", UserSchema, "users");

module.exports = User;
