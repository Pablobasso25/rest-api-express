import { MongoMovieModel } from "./movieSchema.js";

export class MovieModel {
  // 1️- OBTENER TODAS LAS PELÍCULAS (CON O SIN FILTRO)
  static async getAll({ genre }) {
    try {
      // 1. Si viene 'genre', buscamos directamente ese texto. Si no, traemos todo {}
      const filter = genre ? { genre } : {};
      // 2. Buscamos en MongoDB con ese filtro
      const movies = await MongoMovieModel.find(filter);
      return movies;
    } catch (error) {
      console.error("Error en MongoDB al obtener películas:", error.message);
      throw error;
    }
  }

  // 2️⃣ OBTENER UNA PELÍCULA POR ID
  static async getById({ id }) {
    try {
      const movieId = await MongoMovieModel.findById(id);
      // Si no existe, devolvemos null
      if (!movieId) return null;
      return movieId;
    } catch (error) {
      if (error.name === "CastError") return null; // Captura de ID roto
      console.error(
        "Error en MongoDB al obtener películas por id:",
        error.message,
      );
      throw error;
    }
  }

  // 3️⃣ CREAR UNA PELÍCULA
  static async create({ input }) {
    try {
      const newMovie = await MongoMovieModel.create(input);
      return newMovie;
    } catch (error) {
      console.error("Error en Prisma al crear película:", error);
      throw error;
    }
  }

  // 4️⃣ ACTUALIZAR UNA PELÍCULA
  static async update({ id, input }) {
    try {
      const updateMovie = await MongoMovieModel.findByIdAndUpdate(id, input, {
        new: true,
      });

      if (!updateMovie) return null;

      return updateMovie;
    } catch (error) {
      if (error.name === "CastError") return null;
      console.error("Error en MongoDB al actualizar película:", error.message);
      throw error;
    }
  }

  // 5️⃣ ELIMINAR UNA PELÍCULA
  static async delete({ id }) {
    try {
      const deleteMovie = await MongoMovieModel.findByIdAndDelete(id);
      // Si no encontró nada para borrar, devolvemos false
      if (!deleteMovie) return null;
      // Si la borró con éxito, devolvemos true
      return true;
    } catch (error) {
      if (error.name === "CastError") return false;
      console.error("Error en MongoDB al eliminar película:", error.message);
      throw error;
    }
  }
}
