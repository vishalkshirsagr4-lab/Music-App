const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: [ 'user', 'artist', 'admin' ],
        default: 'user',
    },
    artistRequestStatus: {
        type: String,
        enum: [ 'none', 'pending', 'approved', 'rejected' ],
        default: 'none',
    },
    avatar: {
    type: String,
    default:
      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
    isEmailVerified: {
      type: Boolean,
      default: false,
    }
})


const userModel = mongoose.model("user", userSchema)


module.exports = userModel;
