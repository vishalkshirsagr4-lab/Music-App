const express = require('express');
const adminController = require("../controllers/admin.controller");
const { authAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Artist request management
router.get('/artist-requests', authAdmin, adminController.getArtistRequests);
router.post('/approve-artist/:userId', authAdmin, adminController.approveArtistRequest);
router.post('/reject-artist/:userId', authAdmin, adminController.rejectArtistRequest);

// User management
router.get('/users', authAdmin, adminController.getAllUsers);

// Content management
router.delete('/song/:id', authAdmin, adminController.deleteSong);
router.delete('/album/:id', authAdmin, adminController.deleteAlbum);

module.exports = router;
