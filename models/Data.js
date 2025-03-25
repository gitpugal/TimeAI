const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'audio', 'image', 'video'],
    required: true
  },
  content: {
    type: String, // Stores text or file URL/path
    required: true
  },
  metadata: {
    format: { type: String, trim: true },
    size: { type: Number, min: 0 }, // Bytes
    duration: { type: Number, min: 0 }, // Seconds (for audio/video)
    dimensions: {
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now
  }
});

const Data = mongoose.model('Data', DataSchema);
module.exports = Data;
