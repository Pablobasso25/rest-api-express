import pg from "pg";
import crypto from "node:crypto";

// Crear configuración de conxion con la base de datos postgresql
export const pool = new pg.Pool({
  user: "postgres",
  password: "Polbasso25@",
  host: "localhost",
  port: 5432,
  database: "moviesdb",
});

export class MovieModel {
  static async getAll({ genre }) {
    if (genre) {
      // Como es Muchos a Muchos, hacemos JOINs para filtrar por el nombre del género
      const { rows } = await pool.query(
        `SELECT m.* FROM movies m
         JOIN movie_genres mg ON m.id = mg.movie_id
         JOIN genres g ON mg.genre_id = g.id
         WHERE LOWER(g.name) = $1`,
        [genre.toLowerCase()],
      );
      return rows;
    }
    // hacemos la consulta a la base de datos y nos devuelve un objeto con varias propiedades, entre ellas rows que es un array con los resultados de la consulta
    const { rows } = await pool.query("SELECT * FROM movies;");
    return rows;
  }
  static async getById({ id }) {
    // Usamos el placeholder $1 para pasar el ID de forma segura contra inyección SQL
    const { rows } = await pool.query("SELECT * FROM movies WHERE id = $1;", [
      id,
    ]);

    if (rows.length === 0) return null;
    return rows[0]; // Devolvemos solo la primera película encontrada (el objeto)
  }
  static async create({ input }) {
    const { title, year, director, duration, poster, rate } = input;

    // Generamos el UUID de forma nativa en Node
    const id = crypto.randomUUID();

    try {
      // Insertamos la película en la tabla principal
      await pool.query(
        `INSERT INTO movies (id, title, year, director, duration, poster, rate)
         VALUES ($1, $2, $3, $4, $5, $6, $7);`,
        [id, title, year, director, duration, poster, rate],
      );
      return { id, ...input };
    } catch (error) {
      console.error("Error en el modelo al crear película:", error);
      throw error; // Al relanzar el error, lo atrapa el try/catch del controlador
    }
  }

  static async delete({ id }) {
    const result = await pool.query("DELETE FROM movies WHERE id = $1;", [id]);

    // rowCount te dice cuántas filas se vieron afectadas. Si es 0, es porque el ID no existía.
    return result.rowCount > 0;
  }
  static async update({ id, input }) {
    const fields = Object.keys(input);
    if (fields.length === 0) return false;

    const values = Object.values(input);

    const setQuery = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");

    values.push(id);
    const idPosition = values.length;

    const { rows } = await pool.query(
      `UPDATE movies SET ${setQuery} WHERE id = $${idPosition} RETURNING *;`,
      values,
    );

    if (rows.length === 0) return false;
    return rows[0];
  }
}
