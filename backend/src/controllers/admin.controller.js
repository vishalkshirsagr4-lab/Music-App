const userModel = require("../models/user.model");
const musicModel = require("../models/music.model");
const albumModel = require("../models/album.model");

// Get all artist requests (pending)
async function getArtistRequests(req, res) {
    try {
        const requests = await userModel.find({ artistRequestStatus: "pending" }).select("-password");
        res.status(200).json({ requests });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Approve artist request
async function approveArtistRequest(req, res) {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.artistRequestStatus !== "pending") {
            return res.status(400).json({ message: "No pending artist request for this user" });
        }
        user.role = "artist";
        user.artistRequestStatus = "approved";
        await user.save();
        res.status(200).json({ message: "Artist request approved", user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Reject artist request
async function rejectArtistRequest(req, res) {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.artistRequestStatus !== "pending") {
            return res.status(400).json({ message: "No pending artist request for this user" });
        }
        user.artistRequestStatus = "rejected";
        await user.save();
        res.status(200).json({ message: "Artist request rejected", user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Get all users
async function getAllUsers(req, res) {
    try {
        const users = await userModel.find().select("-password");
        res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Delete a song (admin only — with cleanup)
async function deleteSong(req, res) {
    try {
        const { id } = req.params;
        const song = await musicModel.findById(id);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        // Remove from albums
        await albumModel.updateMany(
            { musics: id },
            { $pull: { musics: id } }
        );

        await musicModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Song deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Delete an album (admin only)
async function deleteAlbum(req, res) {
    try {
        const { id } = req.params;
        const album = await albumModel.findByIdAndDelete(id);
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }
        res.status(200).json({ message: "Album deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    getArtistRequests,
    approveArtistRequest,
    rejectArtistRequest,
    getAllUsers,
    deleteSong,
    deleteAlbum,
};
