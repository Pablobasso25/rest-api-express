import movies from "../../movies.json" with { type: "json" };
import { randomUUID } from "node:crypto"; // para generar id de una forma nativa con node, sin instalar nada

export class MovieModel {
  static async getAll({ genre }) {
    if (genre) {
      return movies.filter((movie) =>
        movie.genre.some(
          (gen) => gen.toLocaleLowerCase() === genre.toLocaleLowerCase(),
        ),
      );
    }
    return movies;
  }
  static async getById({ id }) {
    const movie = movies.find((movie) => movie.id === id);
    return movie;
  }
  static async create({ input }) {
    // con los datos que envia el frontend creamos una nueva pelicula y la guardamos en base de datos (en este caso en un array que simula una base de datos)
    const newMovie = {
      id: randomUUID(), //crea el id de forma nativa uuid v4
      ...input,
    };

    movies.push(newMovie);

    return newMovie;
  }
  static async delete({ id }) {
    const movieIndex = movies.findIndex((movie) => movie.id === id);
    if (movieIndex === -1) return false;
    movies.splice(movieIndex, 1);
    return true;
  }
  static async update({ id, input }) {
    const movieIndex = movies.findIndex((movie) => movie.id === id);
    if (movieIndex === -1) return false;
    movies[movieIndex] = {
      ...movies[movieIndex],
      ...input,
    };
    return movies[movieIndex];
  }
}

/* 
Si aplico .find() ➡️ Te da 1 sola película (el objeto { id, title, ... }).

Si  aplico .findIndex() ➡️ Te da 1 número (ej: 4).

Si  aplico .some() ➡️ Te da un true o un false.

Si  aplico .filter() ➡️ Te da un array más chico (ej: un array de 3 películas de Acción).

Si  aplico .map() ➡️ Te da un array del mismo tamaño (un array de 15 elementos, pero transformados, por ejemplo, solo los 15 strings con los títulos).

Recordar que :   .filter(), .map(), .find(), .findIndex() y .some() NUNCA modifican el array original. Siempre te devuelven el resultado limpio para que sea guardado en una nueva variable 
*/
