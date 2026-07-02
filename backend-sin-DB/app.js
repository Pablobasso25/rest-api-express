import express, { json } from "express"; // commonJS
import { randomUUID } from "node:crypto"; // para generar id de una forma nativa con node, sin instalar nada
import cors from "cors";
import movies from "./movies.json" with { type: "json" };
import { validateMovie, validateMoviePatch } from "./schemas/movies.js";

const app = express();

//middleware nativo de express que me permite leer el body que viene junto a la request (envia el usuario en una peticion post por ejempo)
app.use(json());
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        "http://localhost:8080",
        "http://localhost:1234",
        "https://movies.com",
        "https://mipagina.com",
      ];
      if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("No permitido"));
      }
    },
  }),
);

app.disable("x-powered-by"); // deshabilitar el header x-powered-by : express

// Todos los recursos que sean MOVIES se identifican con /movies
app.get("/movies", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*"); // para permitir que cualquier dominio pueda hacer peticiones a mi API

  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some(
        (gen) => gen.toLocaleLowerCase() === genre.toLocaleLowerCase(),
      ),
    );

    return res.json(filteredMovies);
  }
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);
  if (movie) return res.json(movie);

  res.status(400).json({ message: "Película no encontrada" });
});

app.post("/movies", (req, res) => {
  //1. Extraigo los datos que manda el frontend en el body y luego lo desestructuramos (el problema al hacer esto ees que no estan validados los campos, entonces permite enviar cualquier dato, por eso vamos a usar zod para validar los datos que envia el frontend)
  //const { title, genre, year, director, duration, rate, poster } = req.body;

  //1.1 utilizando zod para validar los datos que envia el frontend
  const result = validateMovie(req.body);
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }
  // con los datos que envia el frontend creamos una nueva pelicula y la guardamos en base de datos (en este caso en un array que simula una base de datos)
  const newMovie = {
    id: randomUUID(), //crea el id de forma nativa uuid v4
    ...result.data,
  };

  movies.push(newMovie);
  // enviar es status code si es que lo creo correctamente
  res.status(201).json({ newMovie, message: "Película creada correctamente" });
});

app.patch("/movies/:id", (req, res) => {
  const result = validateMoviePatch(req.body);
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const { id } = req.params;
  const movieIndex = findIndex((movie) => movie.id === id);
  if (movieIndex === -1) {
    return res.status(404).json({ message: "Película no encontrada" });
  }
  //actualizamodos la pelicula con los datos que envia el frontend, pero solo los campos que envia el frontend, es decir, si envia solo el campo title, solo se va a actualizar el campo title y no los demas campos
  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data,
  };
  // reemplazamos la pelicula original por la pelicula actualizada
  movies[movieIndex] = updatedMovie;
  // enviamos la pelicula actualizada al frontend
  res.json(updatedMovie);
});

app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id); // findIndex() devuelve el índice del primer elemento que cumple con la condición, o -1 si no se encuentra ningún elemento que cumpla con la condición. En este caso, estamos buscando el índice de la película con el id que nos llega por params.
  if (movieIndex === -1) {
    return res.status(404).json({ message: "Película no encontrada" });
  }
  movies.splice(movieIndex, 1); //Andá a la posición 2 y borrá 1 elemento". Para eso guardamos ese número en movieIndex
  res.json({ message: "Película eliminada correctamente" });
});

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});

/* 
Si aplico .find() ➡️ Te da 1 sola película (el objeto { id, title, ... }).

Si  aplico .findIndex() ➡️ Te da 1 número (ej: 4).

Si  aplico .some() ➡️ Te da un true o un false.

Si  aplico .filter() ➡️ Te da un array más chico (ej: un array de 3 películas de Acción).

Si  aplico .map() ➡️ Te da un array del mismo tamaño (un array de 15 elementos, pero transformados, por ejemplo, solo los 15 strings con los títulos).

Recordar que :   .filter(), .map(), .find(), .findIndex() y .some() NUNCA modifican el array original. Siempre te devuelven el resultado limpio para que sea guardado en una nueva variable 
*/
