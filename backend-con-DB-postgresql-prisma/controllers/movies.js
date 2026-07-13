import { validateMovie, validateMoviePatch } from "../schemas/movies.js";

export class MovieController {
  constructor({ movieModel }) {
    this.movieModel = movieModel;
  }

  getAll = async (req, res) => {
    // 1. Express lee la URL.
    // Si la URL es /movies?genre=Action -> genre vale "Action"
    // Si la URL es /movies -> genre vale undefined (está vacío)
    const { genre } = req.query;
    // 2. El controlador llama al modelo y guarda el array que este le devuelve en una variable
    const movies = await this.movieModel.getAll({ genre });
    // 3. El controlador usa SU objeto 'res' para enviar esos datos por internet
    return res.json(movies);
  };

  getById = async (req, res) => {
    // ⏱️ Segundo 1: El controlador arranca solo y saca el ID que viene en la URL (req.params)
    const { id } = req.params;
    // ⏱️ Segundo 2: El controlador LLAMA al modelo le dice que utilice la funcion getById, le pasa el ID y se CONGELA por el 'await'
    const movie = await this.movieModel.getById({ id });
    // ⏸️  El controlador se queda pausado acá. No sigue bajando.
    // Mientras tanto, el MODELO se activa, arranca a ejecutarse, usa Prisma,
    // viaja a PostgreSQL, busca la película y hace el 'return'.

    // ⏱️ Segundo 3: El modelo terminó, devolvió los datos y el controlador se "descongela"
    if (movie) {
      return res.json(movie); // ⏱️ Segundo 4: Se envía la respuesta al cliente.
    }
    //Si el IF no se ejecutó (porque 'movie' vino como null), el código sigue acá abajo ,Mandamos un estado 404 (Not Found) avisando que no existe
    return res.status(404).json({ message: "Película no encontrada" });
  };

  create = async (req, res) => {
    // 1. Validamos los datos que vienen del frontend con zod. Si hay error, devolvemos un 400 (Bad Request) con el error en JSON
    const result = validateMovie(req.body);
    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }
    // 2. Si no hay error, le pasamos los datos validados al modelo para que cree la película en la base de datos y nos devuelva el objeto creado, como validateMovie nos devuelve un  objeto con la propiedad data o error, usamos result.data para pasarle solo los datos validados al modelo y como modelo espera un objeto con la propiedad input, le pasamos { input: result.data }
    try {
      const newMovie = await this.movieModel.create({ input: result.data });
      return res
        .status(201)
        .json({ newMovie, message: "Película creada correctamente" });
    } catch (error) {
      return res.status(500).json({ message: "Error interno en el servidor" });
    }
  };

  delete = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await this.movieModel.delete({ id });
      if (result === false) {
        return res.status(404).json({ message: "Película no encontrada" });
      }
      return res.json({ message: "Película eliminada correctamente" });
    } catch (error) {
      //  Si el modelo ejecutó el 'throw error' por un problema grave de Postgres, cae acá:
      console.error("Error inesperado al eliminar:", error);
      return res.status(500).json({ message: "Error interno en el servidor" });
    }
  };

  update = async (req, res) => {
    // 1. Validamos los datos que vienen del frontend con zod. Si hay error, devolvemos un 400 (Bad Request) con el error en JSON
    const result = validateMoviePatch(req.body);
    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }
    // 2. Si no hay error, le pasamos los datos validados al modelo para que actualice la película en la base de datos y nos devuelva el objeto actualizado, como validateMoviePatch nos devuelve un  objeto con la propiedad data o error, usamos result.data para pasarle solo los datos validados al modelo y como modelo espera un objeto con la propiedad input, le pasamos { input: result.data }
    try {
      const { id } = req.params;
      const updatedMovie = await this.movieModel.update({
        id,
        input: result.data,
      });
      if (!updatedMovie) {
        return res.status(404).json({ message: "Película no encontrada" });
      }
      // enviamos la pelicula actualizada al frontend
      return res.json(updatedMovie);
    } catch (error) {
      //  Si el modelo ejecutó el 'throw error' por un problema grave de Postgres, cae acá:
      console.error("Error inesperado al actualizar:", error);
      return res.status(500).json({ message: "Error interno en el servidor" });
    }
  };
}
