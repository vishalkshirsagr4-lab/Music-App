const sectionModel = require("../models/section.model");
const musicModel = require("../models/music.model");

// 🧩 CREATE SECTION (artist/admin)
async function createSection(req, res) {
  try {
    const { title, type, query, musics } = req.body;

    let parsedMusics;
    try {
      parsedMusics = typeof musics === "string" ? JSON.parse(musics) : musics;
    } catch {
      return res.status(400).json({ message: "Invalid musics format" });
    }

    if (!title || !type) {
      return res.status(400).json({ message: "Title and type are required" });
    }

    if (type === "manual" && (!parsedMusics || parsedMusics.length === 0)) {
      return res.status(400).json({ message: "Select at least one song for manual section" });
    }
   
    if (type !== "manual" && !query) {
      return res.status(400).json({ message: "Query is required for non-manual sections" });
    }

    const section = await sectionModel.create({
      title,
      type,
      query: query || "",
      musics: type === "manual" ? parsedMusics : [],
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Section created successfully", section });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// 🧩 GET ALL SECTIONS
async function getAllSections(req, res) {
  try {
    const sections = await sectionModel
      .find()
      .populate("createdBy", "username email avatar")
      .sort({ createdAt: -1 });

    res.json({ sections });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// 🧩 GET SECTIONS WITH DYNAMIC DATA
async function getSectionsWithData(req, res) {
  try {
    const sections = await sectionModel
      .find()
      .populate("createdBy", "username email avatar")
      .sort({ createdAt: -1 });

    const sectionsWithData = await Promise.all(
      sections.map(async (section) => {
        let musics = [];
        // Escape regex special characters to prevent crashes
        const escapedQuery = section.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const query = new RegExp(escapedQuery, "i");

        if (section.type === "manual" && section.musics?.length > 0) {
          musics = await musicModel
            .find({ _id: { $in: section.musics } })
            .populate("artist", "username email avatar");
        } else {
          switch (section.type) {
            case "genre":
              musics = await musicModel
                .find({ genre: query })
                .populate("artist", "username email avatar")
                .limit(10);
              break;
            case "trending":
              musics = await musicModel
                .find()
                .populate("artist", "username email avatar")
                .sort({ playCount: -1 })
                .limit(10);
              break;
            case "movie":
              musics = await musicModel
                .find({ movie: query })
                .populate("artist", "username email avatar")
                .limit(10);
              break;
            case "custom":
              musics = await musicModel
                .find({
                  $or: [
                    { title: query },
                    { genre: query },
                    { movie: query },
                  ],
                })
                .populate("artist", "username email avatar")
                .limit(10);
              break;
            default:
              musics = [];
          }
        }

        return {
          ...section.toObject(),
          musics,
        };
      })
    );

    res.json({ sections: sectionsWithData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// 🧩 DELETE SECTION (creator or admin only)
async function deleteSection(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const section = await sectionModel.findById(id);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    if (String(section.createdBy) !== String(userId) && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this section" });
    }

    await sectionModel.findByIdAndDelete(id);

    res.json({ message: "Section deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// 🧩 UPDATE SECTION (creator or admin only)
async function updateSection(req, res) {
  try {
    const { id } = req.params;
    const { title, type, query, musics } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const section = await sectionModel.findById(id);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    if (String(section.createdBy) !== String(userId) && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this section" });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (type !== undefined) updates.type = type;
    if (query !== undefined) updates.query = query;
    if (musics !== undefined) {
      let parsedMusics;
      try {
        parsedMusics = typeof musics === "string" ? JSON.parse(musics) : musics;
      } catch {
        return res.status(400).json({ message: "Invalid musics format" });
      }
      updates.musics = parsedMusics;
    }

    const updated = await sectionModel.findByIdAndUpdate(id, updates, { new: true });

    res.json({ message: "Section updated successfully", section: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// 🧩 GET FEED (sections with their songs populated)
async function getFeed(req, res) {
  try {
    const sections = await sectionModel
      .find()
      .populate("createdBy", "username email avatar")
      .sort({ createdAt: -1 });

    const feed = await Promise.all(
      sections.map(async (section) => {
        const songs = await musicModel
          .find({ sectionId: section._id })
          .populate("artist", "username email avatar")
          .sort({ createdAt: -1 });

        return {
          _id: section._id,
          title: section.title,
          type: section.type,
          createdBy: section.createdBy,
          createdAt: section.createdAt,
          songs,
        };
      })
    );

    res.json({ sections: feed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function getSectionById(req, res) {
  try {
    const { id } = req.params;
    const section = await sectionModel
      .findById(id)
      .populate("createdBy", "username email avatar");

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    let musics = [];
    const escapedQuery = section.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const query = new RegExp(escapedQuery, "i");

    if (section.type === "manual" && section.musics?.length > 0) {
      musics = await musicModel
        .find({ _id: { $in: section.musics } })
        .populate("artist", "username email avatar");
    } else {
      switch (section.type) {
        case "genre":
          musics = await musicModel
            .find({ genre: query })
            .populate("artist", "username email avatar")
            .limit(50);
          break;
        case "trending":
          musics = await musicModel
            .find()
            .populate("artist", "username email avatar")
            .sort({ playCount: -1 })
            .limit(50);
          break;
        case "movie":
          musics = await musicModel
            .find({ movie: query })
            .populate("artist", "username email avatar")
            .limit(50);
          break;
        case "custom":
          musics = await musicModel
            .find({
              $or: [
                { title: query },
                { genre: query },
                { movie: query },
              ],
            })
            .populate("artist", "username email avatar")
            .limit(50);
          break;
        default:
          musics = [];
      }
    }

    res.json({ section: { ...section.toObject(), musics } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createSection,
  getAllSections,
  getSectionsWithData,
  deleteSection,
  updateSection,
  getFeed,
  getSectionById,
};

