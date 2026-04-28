const express = require("express");
const multer = require("multer");
const musicController = require("../controllers/music.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

/* =======================
   🎵 MUSIC ROUTES
======================= */

// Upload music (artist only)
router.post(
  "/upload",
  authMiddleware.authArtist,
  upload.fields([
    { name: "music", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  musicController.createMusic
);

// Get all songs with filters (user + artist)
router.get(
  "/",
  authMiddleware.authAny,
  musicController.getAllMusics
);

// 🔝 Get top/random songs
router.get(
  "/top",
  authMiddleware.authAny,
  musicController.getTopSongs
);

// 🔍 Global search
router.get(
  "/search",
  authMiddleware.authAny,
  musicController.searchGlobal
);

// 💡 Search suggestions
router.get(
  "/search/suggestions",
  authMiddleware.authAny,
  musicController.getSearchSuggestions
);

// 🎵 Get related songs
router.get(
  "/related/:id",
  authMiddleware.authAny,
  musicController.getRelatedSongs
);

// ⏯ Increment play count
router.post(
  "/:id/play",
  authMiddleware.authAny,
  musicController.incrementPlayCount
);

// 🗑 Delete song (owner or admin)
router.delete(
  "/:id",
  authMiddleware.authAny,
  musicController.deleteMusic
);

// ✏️ Update song (owner or admin)
router.put(
  "/:id",
  authMiddleware.authAny,
  upload.fields([{ name: "image", maxCount: 1 }]),
  musicController.updateMusic
);

/* =======================
   📀 ALBUM ROUTES
======================= */

// Create album (artist only)
router.post(
  "/album",
  authMiddleware.authArtist,
  upload.fields([{ name: "image", maxCount: 1 }]),
  musicController.createAlbum
);

// Get all albums (user + artist)
router.get(
  "/albums",
  authMiddleware.authAny,
  musicController.getAllAlbums
);

// Get single album (user + artist)
router.get(
  "/albums/:albumId",
  authMiddleware.authAny,
  musicController.getAlbumById
);

// 🗑 Delete album (creator or admin)
router.delete(
  "/albums/:id",
  authMiddleware.authAny,
  musicController.deleteAlbum
);

// ✏️ Update album (creator or admin)
router.put(
  "/albums/:id",
  authMiddleware.authAny,
  upload.fields([{ name: "image", maxCount: 1 }]),
  musicController.updateAlbum
);

module.exports = router;

