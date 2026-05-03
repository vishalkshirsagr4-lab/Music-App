const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        // optional for Google users
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
  }
})


const userModel = mongoose.model("user", userSchema)


module.exports = userModel;
