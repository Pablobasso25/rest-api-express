import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    maxLength: 100,
  },
  year: {
    type: Number,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  rate: {
    type: Number,
    default: 5,
  },
  poster: {
    type: String,
    required: true,
  },
  genre: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const MongoMovieModel = mongoose.model("movies", movieSchema);
