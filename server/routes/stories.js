const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const { protect, restrictGuest } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// GET /api/stories — Get all public stories with search & date filter
router.get('/', async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;
    let query = { isPublic: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (startDate || endDate) {
      query.tripStartDate = {};
      if (startDate) query.tripStartDate.$gte = new Date(startDate);
      if (endDate) query.tripStartDate.$lte = new Date(endDate);
    }

    const stories = await Story.find(query)
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/stories/:id — Get single story
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('userId', 'name avatar');
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json({ success: true, story });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/stories — Create story (auth required, no guest)
router.post('/', protect, restrictGuest, async (req, res) => {
  try {
    const { title, fromPlace, place, tripStartDate, tripEndDate, numberOfPersons, description, activities, daysItinerary, coverImage } = req.body;

    const story = await Story.create({
      userId: req.user._id,
      title,
      fromPlace: fromPlace || '',
      place,
      tripStartDate,
      tripEndDate,
      numberOfPersons: numberOfPersons ? parseInt(numberOfPersons, 10) : 1,
      description,
      activities: activities || [],
      daysItinerary: daysItinerary || [],
      coverImage: coverImage || '',
    });

    const populated = await story.populate('userId', 'name avatar');
    res.status(201).json({ success: true, story: populated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/stories/:id — Update story (author only)
router.put('/:id', protect, restrictGuest, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this story' });
    }

    const { title, fromPlace, place, tripStartDate, tripEndDate, numberOfPersons, description, activities, daysItinerary, coverImage } = req.body;
    Object.assign(story, {
      title,
      fromPlace: fromPlace || '',
      place,
      tripStartDate,
      tripEndDate,
      numberOfPersons: numberOfPersons ? parseInt(numberOfPersons, 10) : story.numberOfPersons || 1,
      description,
      activities: activities || story.activities,
      daysItinerary: daysItinerary || story.daysItinerary,
      coverImage: coverImage !== undefined ? coverImage : story.coverImage,
    });
    await story.save();

    const populated = await story.populate('userId', 'name avatar');
    res.json({ success: true, story: populated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// DELETE /api/stories/:id — Delete story (author only)
router.delete('/:id', protect, restrictGuest, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }

    // Delete image from cloudinary if exists
    if (story.coverImagePublicId) {
      await cloudinary.uploader.destroy(story.coverImagePublicId);
    }

    await story.deleteOne();
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/stories/:id/like — Toggle like (auth required, no guest)
router.patch('/:id/like', protect, restrictGuest, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const userId = req.user._id;
    const likedIndex = story.likes.indexOf(userId);

    if (likedIndex === -1) {
      story.likes.push(userId);
    } else {
      story.likes.splice(likedIndex, 1);
    }

    await story.save();
    res.json({ success: true, likes: story.likes.length, liked: likedIndex === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/stories/:id/image — Upload cover image
router.post('/:id/image', protect, restrictGuest, upload.single('image'), async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete old image if exists
    if (story.coverImagePublicId) {
      await cloudinary.uploader.destroy(story.coverImagePublicId);
    }

    story.coverImage = req.file.path;
    story.coverImagePublicId = req.file.filename;
    await story.save();

    res.json({ success: true, coverImage: story.coverImage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
