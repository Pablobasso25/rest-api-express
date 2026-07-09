import { validateMovie, validateMoviePatch } from "../schemas/movies.js";

export class MovieController {
  constructor({ movieModel }) {
    this.movieModel = movieModel;
  }

  getAll = async (req, res) => {
    const { genre } = req.query;
    const movies = await this.movieModel.getAll({ genre });
    return res.json(movies);
  };

  getById = async (req, res) => {
    const { id } = req.params;
    const movie = await this.movieModel.getById({ id });
    if (movie) return res.json(movie);

    return res.status(400).json({ message: "Película no encontrada" });
  };

  create = async (req, res) => {
    const result = validateMovie(req.body);
    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const newMovie = await this.movieModel.create({ input: result.data });
    return res
      .status(201)
      .json({ newMovie, message: "Película creada correctamente" });
  };

  delete = async (req, res) => {
    const { id } = req.params;
    const result = await this.movieModel.delete({ id });
    if (result === false) {
      return res.status(404).json({ message: "Película no encontrada" });
    }
    return res.json({ message: "Película eliminada correctamente" });
  };

  update = async (req, res) => {
    const result = validateMoviePatch(req.body);
    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const { id } = req.params;
    const updatedMovie = await this.movieModel.update({
      id,
      input: result.data,
    });

    // enviamos la pelicula actualizada al frontend
    return res.json(updatedMovie);
  };
}
