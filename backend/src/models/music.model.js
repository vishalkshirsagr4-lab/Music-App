const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema({
  uri: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  subtitle: {
    type: String,
    default: "",
  },

  image: {
    type: String,
    default: null,
  },

  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "section",
    default: null,
  },

  genre: {
    type: String,
    default: "",
  },

  category: {
    type: String,
    default: "",
  },

  mood: {
    type: String,
    default: "",
  },

  movie: {
    type: String,
    default: "",
  },

  playCount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// ✅ IMPORTANT: CREATE MODEL
const musicModel = mongoose.model("music", musicSchema);

// ✅ IMPORTANT: EXPORT MODEL
module.exports = musicModel;
