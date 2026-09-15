require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://revanth19a:revanth@cluster0.4jsmfp8.mongodb.net/scoutway';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    const result = await User.updateMany({}, { $set: { avatar: '' } });
    console.log('Cleared avatar images for all users:', result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
