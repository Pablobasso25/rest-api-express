import { MovieModel } from "../models/local-file-system/movie.js";
import { validateMovie, validateMoviePatch } from "../schemas/movies.js";

export class MovieController {
  static async getAll(req, res) {
    const { genre } = req.query;
    const movies = await MovieModel.getAll({ genre });
    return res.json(movies);
  }

  static async getById(req, res) {
    const { id } = req.params;
    const movie = await MovieModel.getById({ id });
    if (movie) return res.json(movie);

    return res.status(400).json({ message: "Película no encontrada" });
  }

  static async create(req, res) {
    const result = validateMovie(req.body);
    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const newMovie = await MovieModel.create({ input: result.data });
    return res
      .status(201)
      .json({ newMovie, message: "Película creada correctamente" });
  }

  static async delete(req, res) {
    const { id } = req.params;
    const result = await MovieModel.delete({ id });
    if (result === false) {
      return res.status(404).json({ message: "Película no encontrada" });
    }
    return res.json({ message: "Película eliminada correctamente" });
  }

  static async update(req, res) {
    const result = validateMoviePatch(req.body);
    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const { id } = req.params;
    const updatedMovie = await MovieModel.update({ id, input: result.data });

    // enviamos la pelicula actualizada al frontend
    return res.json(updatedMovie);
  }
}
