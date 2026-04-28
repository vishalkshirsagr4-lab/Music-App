const musicModel = require("../models/music.model");
const albumModel = require("../models/album.model");
const userModel = require("../models/user.model");
const { uploadFile } = require("../services/storage.service");

// 🎵 CREATE MUSIC (audio + optional image)
async function createMusic(req, res) {
    try {
        const { title, genre, category, mood, movie } = req.body;

        const musicFile = req.files?.music?.[0];
        const imageFile = req.files?.image?.[0];

        if (!musicFile) {
            return res.status(400).json({ message: "Music file required" });
        }

        const musicResult = await uploadFile(
            musicFile,
            "music",
            musicFile.mimetype
        );

        let imageUrl = null;

        if (imageFile) {
            const imageResult = await uploadFile(
                imageFile,
                "image",
                imageFile.mimetype
            );
            imageUrl = imageResult.url;
        }

        const { sectionId, subtitle } = req.body;

        const music = await musicModel.create({
            uri: musicResult.url,
            image: imageUrl,
            title,
            subtitle: subtitle || "",
            artist: req.user.id,
            sectionId: sectionId || null,
            genre: genre || "",
            category: category || "",
            mood: mood || "",
            movie: movie || "",
            playCount: 0,
        });

        res.status(201).json({
            message: "Music created successfully",
            music,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
}


// 📀 CREATE ALBUM
async function createAlbum(req, res) {
  try {
    const { title, musics } = req.body;
    const imageFile = req.files?.image?.[0];

    if (!title || !musics) {
      return res.status(400).json({
        message: "Title and at least one music required",
      });
    }

    let parsedMusics;
    try {
      parsedMusics = typeof musics === "string" ? JSON.parse(musics) : musics;
    } catch {
      return res.status(400).json({ message: "Invalid musics format" });
    }
    if (!Array.isArray(parsedMusics) || parsedMusics.length === 0) {
      return res.status(400).json({
        message: "Title and at least one music required",
      });
    }

    let imageUrl = "";
    if (imageFile) {
      const imageResult = await uploadFile(
        imageFile,
        "image",
        imageFile.mimetype
      );
      imageUrl = imageResult.url;
    }

    const album = await albumModel.create({
      title,
      musics: parsedMusics,
      image: imageUrl,
      artist: req.user.id,
    });

    res.status(201).json({
      message: "Album created successfully",
      album,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}


// 🎧 GET ALL MUSIC (with filters: genre, movie, category)
async function getAllMusics(req, res) {
  try {
    const { genre, movie, category } = req.query;
    const filter = {};

    if (genre) filter.genre = new RegExp(genre, "i");
    if (movie) filter.movie = new RegExp(movie, "i");
    if (category) filter.category = new RegExp(category, "i");

    const musics = await musicModel
      .find(filter)
      .populate("artist", "username email avatar")
      .sort({ createdAt: -1 });

    res.json({ musics });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}


// 🔝 GET TOP SONGS (random / trending mix)
async function getTopSongs(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const musics = await musicModel.aggregate([
      { $sample: { size: limit } },
      {
        $lookup: {
          from: "users",
          localField: "artist",
          foreignField: "_id",
          as: "artist",
        },
      },
      { $unwind: "$artist" },
      {
        $project: {
          _id: 1,
          title: 1,
          uri: 1,
          image: 1,
          genre: 1,
          category: 1,
          movie: 1,
          playCount: 1,
          createdAt: 1,
          "artist.username": 1,
          "artist.email": 1,
          "artist.avatar": 1,
        },
      },
    ]);

    res.json({ musics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// 🔍 SEARCH MUSIC / ARTISTS / ALBUMS / MOVIES
async function searchGlobal(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ songs: [], artists: [], albums: [], movies: [] });
    }

    const regex = new RegExp(q, "i");

    const songs = await musicModel
      .find({
        $or: [
          { title: regex },
          { movie: regex },
          { genre: regex },
        ],
      })
      .populate("artist", "username email avatar")
      .limit(10);

    const artists = await userModel
      .find({
        role: "artist",
        $or: [
          { username: regex },
          { email: regex },
        ],
      })
      .select("-password")
      .limit(10);

    const albums = await albumModel
      .find({ title: regex })
      .populate("artist", "username email avatar")
      .populate("musics")
      .limit(10);

    // Get distinct movies matching query
    const movieSongs = await musicModel
      .find({ movie: regex })
      .distinct("movie");

    res.json({
      songs,
      artists,
      albums,
      movies: movieSongs.slice(0, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// 💡 SEARCH SUGGESTIONS
async function getSearchSuggestions(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    const regex = new RegExp(q, "i");

    const songs = await musicModel
      .find({ title: regex })
      .select("title")
      .limit(5);

    const movies = await musicModel
      .find({ movie: regex })
      .distinct("movie")
      .then((movies) => movies.slice(0, 5));

    const suggestions = [
      ...songs.map((s) => ({ text: s.title, type: "song" })),
      ...movies.map((m) => ({ text: m, type: "movie" })),
    ];

    res.json({ suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// 🎵 GET RELATED SONGS (Advanced Scoring)
async function getRelatedSongs(req, res) {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid song ID" });
    }

    const song = await musicModel.findById(id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    const related = await musicModel.aggregate([
      { $match: { _id: { $ne: song._id } } },
      {
        $addFields: {
          score: {
            $add: [
              {
                $cond: [
                  {
                    $and: [
                      { $ne: [song.genre, ""] },
                      { $ne: ["$genre", ""] },
                      { $eq: [{ $toLower: "$genre" }, { $toLower: song.genre }] },
                    ],
                  },
                  3,
                  0,
                ],
              },
              {
                $cond: [
                  { $eq: ["$artist", song.artist] },
                  2,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $and: [
                      { $ne: [song.mood, ""] },
                      { $ne: ["$mood", ""] },
                      { $eq: [{ $toLower: "$mood" }, { $toLower: song.mood }] },
                    ],
                  },
                  2,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $and: [
                      { $ne: [song.movie, ""] },
                      { $ne: ["$movie", ""] },
                      { $eq: [{ $toLower: "$movie" }, { $toLower: song.movie }] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            ],
          },
        },
      },
      { $match: { score: { $gt: 0 } } },
      { $sort: { score: -1, playCount: -1, createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "artist",
          foreignField: "_id",
          as: "artist",
        },
      },
      { $unwind: "$artist" },
      {
        $project: {
          _id: 1,
          title: 1,
          uri: 1,
          image: 1,
          genre: 1,
          mood: 1,
          movie: 1,
          category: 1,
          playCount: 1,
          score: 1,
          createdAt: 1,
          "artist._id": 1,
          "artist.username": 1,
          "artist.email": 1,
          "artist.avatar": 1,
        },
      },
    ]);

    res.json({ related });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// ⏯ INCREMENT PLAY COUNT
async function incrementPlayCount(req, res) {
  try {
    const { id } = req.params;
    const song = await musicModel.findByIdAndUpdate(
      id,
      { $inc: { playCount: 1 } },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.json({ message: "Play count updated", song });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// 🗑 DELETE MUSIC (owner or admin only)
async function deleteMusic(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const song = await musicModel.findById(id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Only owner or admin can delete
    if (String(song.artist) !== String(userId) && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this song" });
    }

    // Remove from albums
    await albumModel.updateMany(
      { musics: id },
      { $pull: { musics: id } }
    );

    await musicModel.findByIdAndDelete(id);

    res.json({ message: "Song deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// 📀 GET ALL ALBUMS
async function getAllAlbums(req, res) {
  try {
    const albums = await albumModel
      .find()
      .populate("artist", "username email avatar")
      .populate("musics");

    res.json({ albums });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}


// 📀 GET SINGLE ALBUM
async function getAlbumById(req, res) {
  try {
    const album = await albumModel
      .findById(req.params.albumId)
      .populate("artist", "username email avatar")
      .populate("musics");

    res.json({ album });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}


// 🗑 DELETE ALBUM (creator or admin only)
async function deleteAlbum(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const album = await albumModel.findById(id);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    if (String(album.artist) !== String(userId) && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this album" });
    }

    await albumModel.findByIdAndDelete(id);

    res.json({ message: "Album deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// ✏️ UPDATE MUSIC (owner or admin only)
async function updateMusic(req, res) {
  try {
    const { id } = req.params;
    const { title, subtitle, genre, category, mood, movie, sectionId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const song = await musicModel.findById(id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    if (String(song.artist) !== String(userId) && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this song" });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (genre !== undefined) updates.genre = genre;
    if (category !== undefined) updates.category = category;
    if (mood !== undefined) updates.mood = mood;
    if (movie !== undefined) updates.movie = movie;
    if (sectionId !== undefined) updates.sectionId = sectionId || null;

    // Handle image upload if provided
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
      const imageResult = await uploadFile(
        imageFile.buffer.toString("base64"),
        "image"
      );
      updates.image = imageResult.url;
    }

    const updated = await musicModel.findByIdAndUpdate(id, updates, { new: true });

    res.json({ message: "Song updated successfully", music: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// ✏️ UPDATE ALBUM (owner or admin only)
async function updateAlbum(req, res) {
  try {
    const { id } = req.params;
    const { title, musics } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const album = await albumModel.findById(id);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    if (String(album.artist) !== String(userId) && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this album" });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (musics !== undefined) {
      let parsedMusics;
      try {
        parsedMusics = typeof musics === "string" ? JSON.parse(musics) : musics;
      } catch {
        return res.status(400).json({ message: "Invalid musics format" });
      }
      updates.musics = parsedMusics;
    }

    // Handle image upload if provided
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
      const imageResult = await uploadFile(
        imageFile.buffer.toString("base64"),
        "image"
      );
      updates.image = imageResult.url;
    }

    const updated = await albumModel.findByIdAndUpdate(id, updates, { new: true });

    res.json({ message: "Album updated successfully", album: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


module.exports = {
  createMusic,
  createAlbum,
  getAllMusics,
  getTopSongs,
  searchGlobal,
  getSearchSuggestions,
  getRelatedSongs,
  incrementPlayCount,
  deleteMusic,
  updateMusic,
  getAllAlbums,
  getAlbumById,
  deleteAlbum,
  updateAlbum,
};

