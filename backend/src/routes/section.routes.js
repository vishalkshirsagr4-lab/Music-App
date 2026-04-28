const express = require("express");
const multer = require("multer");
const sectionController = require("../controllers/section.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// 🧩 Create section (artist/admin)
router.post(
  "/",
  authMiddleware.authArtistOrAdmin,
  upload.none(),
  sectionController.createSection
);

// 🧩 Get all sections
router.get(
  "/",
  authMiddleware.authAny,
  sectionController.getAllSections
);

// 🧩 Get sections with dynamic music data
router.get(
  "/with-data",
  authMiddleware.authAny,
  sectionController.getSectionsWithData
);

// 🧩 Update section (creator or admin)
router.put(
  "/:id",
  authMiddleware.authAny,
  upload.none(),
  sectionController.updateSection
);

// 🧩 Delete section (creator or admin)
router.delete(
  "/:id",
  authMiddleware.authAny,
  sectionController.deleteSection
);

// 🧩 Feed (sections with songs)
router.get(
  "/feed",
  authMiddleware.authAny,
  sectionController.getFeed
);

// 🧩 Get manual or dynamic section by id
router.get(
  "/:id",
  authMiddleware.authAny,
  sectionController.getSectionById
);

module.exports = router;

