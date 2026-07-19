import { Router } from "express";
import { MovieController } from "../controllers/movies.js";

export const createMovieRouter = ({ movieModel }) => {
  const moviesRouter = Router();

  // 1. Creamos una INSTANCIA del controlador pasándole el modelo que queremos usar
  const movieController = new MovieController({ movieModel });

  moviesRouter.get("/", movieController.getAll);

  moviesRouter.get("/:id", movieController.getById);

  moviesRouter.post("/", movieController.create);

  moviesRouter.patch("/:id", movieController.update);

  moviesRouter.delete("/:id", movieController.delete);

  return moviesRouter;
};
