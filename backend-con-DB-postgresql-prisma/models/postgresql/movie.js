import { prisma } from "../../config/prisma.js";
export class MovieModel {
  // 1️- OBTENER TODAS LAS PELÍCULAS (CON O SIN FILTRO)
  static async getAll({ genre }) {
    // Configuración base de la consulta a Prisma incluyendo los géneros de cada película
    const queryConfig = {
      include: {
        genres: true,
      },
    };

    // Si viene un género en la URL (?genre=Drama), le inyectamos el WHERE dinámicamente
    if (genre) {
      queryConfig.where = {
        genres: {
          some: {
            name: { equals: genre, mode: "insensitive" },
          },
        },
      };
    }

    // Ejecutamos la consulta a Prisma con la configuración que armamos (con o sin filtro) y guardamos el resultado en 'movies'
    const movies = await prisma.movies.findMany(queryConfig);
    // Limpieza: Convertimos los objetos de géneros en un array de textos plano ["Crime", "Drama"] en vez de [{name: "Crime"}, {name: "Drama"}]
    return movies.map((movie) => ({
      ...movie, // 1. Copiamos todos los datos (title, year, etc.)
      genres: movie.genres.map((g) => g.name), // 2. Pisamos la propiedad 'genres' vieja con una nueva limpia
      /* Le decimos: "Agarrá la lista de géneros de esta película ([{name: "Crime"}, {name: "Drama"}]), recorrela uno por uno (cada uno se llama g) y quedate solo con el g.name" te devuelve ["Crime", "Drama"] */
    }));
  }

  // 2️⃣ OBTENER UNA PELÍCULA POR ID
  static async getById({ id }) {
    const movie = await prisma.movies.findUnique({
      where: { id },
      include: {
        genres: true, // incluimos sus géneros esto siempre va a venir como un array de objetos [{name: "Crime"}, {name: "Drama"}]
      },
    });

    if (!movie) return null;

    // Limpieza: Devolvemos la película con los géneros como array de strings ["Crime", "Drama"] en vez de [{name: "Crime"}, {name: "Drama"}]
    return {
      ...movie,
      genres: movie.genres.map((g) => g.name), // Le decimos: "Agarrá la lista de géneros de esta película ([{name: "Crime"}, {name: "Drama"}]), recorrela uno por uno (cada uno se llama g) y quedate solo con el g.name" te devuelve ["Crime", "Drama"]
    };
  }

  // 3️⃣ CREAR UNA PELÍCULA
  static async create({ input }) {
    try {
      // Separamos 'genre' del resto de los datos nativos de la película
      const { genre, ...movieData } = input;

      const newMovie = await prisma.movies.create({
        data: {
          ...movieData, // title, year, director, duration, poster, rate con sus valores validados por zod
          genres: {
            // Buscamos los géneros por su nombre único en la tabla 'genres' y los vinculamos
            connect: genre.map((name) => ({ name })), // Le decimos: "Agarrá la lista de géneros que vino del frontend (["Crime", "Drama"]), recorrela uno por uno (cada uno se llama name) y devolveme un objeto {name: name} para cada uno, así Prisma sabe qué géneros vincular a esta película"
          },
        },
        include: { genres: true },
      });

      // Limpieza: Devolvemos la película con los géneros como array de strings ["Crime", "Drama"] en vez de [{name: "Crime"}, {name: "Drama"}]
      return {
        ...newMovie,
        genres: newMovie.genres.map((g) => g.name), // Le decimos: "Agarrá la lista de géneros de esta película ([{name: "Crime"}, {name: "Drama"}]), recorrela uno por uno (cada uno se llama g) y quedate solo con el g.name" te devuelve ["Crime", "Drama"]
      };
    } catch (error) {
      console.error("Error en Prisma al crear película:", error);
      throw error;
    }
  }

  // 4️⃣ ACTUALIZAR UNA PELÍCULA
  static async update({ id, input }) {
    try {
      const { genre, ...movieData } = input; // Separamos 'genre' del resto de los datos nativos de la película para poder actualizar los géneros aparte y no pisar los datos nativos de la película, ...movieData es un objeto con las propiedades de la película que no son 'genre' (title, year, director, duration, poster, rate)

      const updatedMovie = await prisma.movies.update({
        where: { id },
        data: {
          ...movieData, // title, year, director, duration, poster, rate con sus valores que quiere actualizar el usuario, si no quiere actualizar alguno de estos campos, simplemente no lo envía en el body y se queda con el valor que ya tenía en la base de datos
          // los ... operadores spread permiten que si no viene 'genre' no se ejecute la parte de 'set' y no se borren los géneros viejos,  && permite que si viene 'genre' se ejecute la parte de 'set' y se actualicen los géneros viejos por los nuevos, data lo que recibe entonces es un objeto con las propiedades de movieData y si viene genre, también la propiedad genres con su set de géneros nuevos
          ...(genre && {
            genres: {
              set: genre.map((name) => ({ name })),
            },
          }),
        },
        include: { genres: true },
      });
      return {
        ...updatedMovie,
        genres: updatedMovie.genres.map((g) => g.name), // Le decimos: "Agarrá la lista de géneros de esta película ([{name: "Crime"}, {name: "Drama"}]), recorrela uno por uno (cada uno se llama g) y quedate solo con el g.name" te devuelve ["Crime", "Drama"]
      };
    } catch (error) {
      if (error.code === "P2025") return null; // Si no existe el ID de la película, devolvemos null
      console.error("Error en Prisma al actualizar película:", error);
      throw error;
    }
  }

  // 5️⃣ ELIMINAR UNA PELÍCULA
  static async delete({ id }) {
    try {
      await prisma.movies.delete({
        where: { id },
      });
      return true; // Salió todo bien
    } catch (error) {
      if (error.code === "P2025") return false; // No existía la película
      throw error;
    }
  }
}
