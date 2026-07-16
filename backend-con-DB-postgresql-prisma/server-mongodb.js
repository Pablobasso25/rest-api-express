import { createApp } from "./app.js";
import { MovieModel } from "./models/mongodb/movie.js";
import { connectToMongoDB } from "./config/mongo.js";

connectToMongoDB();
createApp({ movieModel: MovieModel });
