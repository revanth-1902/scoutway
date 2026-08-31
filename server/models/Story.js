const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  activityName: { type: String, required: true, trim: true },
  cost: { type: String, default: '-' },
});

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
      maxlength: [200, 'Title too long'],
    },
    fromPlace: {
      type: String,
      default: '',
      trim: true,
    },
    place: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    tripStartDate: {
      type: Date,
      required: [true, 'Trip start date is required'],
    },
    tripEndDate: {
      type: Date,
      required: [true, 'Trip end date is required'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    coverImagePublicId: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Story description is required'],
    },
    activities: [activitySchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index for search
storySchema.index({ title: 'text', description: 'text', place: 'text', fromPlace: 'text' });

module.exports = mongoose.model('Story', storySchema);
