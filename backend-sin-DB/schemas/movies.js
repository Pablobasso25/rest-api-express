import z from "zod";

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "El título debe ser un string",
    required_error: "El título es obligatorio",
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().int().min(0).max(10).default(5),
  poster: z.string().url({
    message: "La URL del poster no es válida",
  }),
  genre: z.array(
    z.enum([
      "Action",
      "Comedy",
      "Drama",
      "Horror",
      "Romance",
      "Sci-Fi",
      "Thriller",
      "Western",
      "Animation",
      "Adventure",
      "Fantasy",
      "Mystery",
      "Crime",
      "Documentary",
      "Family",
      "Musical",
      "War",
      "Biography",
      "History",
    ]),
    {
      invalid_type_error: "El género debe ser un array de strings",
      required_error: "El género es obligatorio",
    },
  ),
});

// valida todo el objeto que le pasamos y nos devuelve un objeto con la propiedad data y error, si es que hay un error de validacion
export function validateMovie(object) {
  return movieSchema.safeParse(object);
}

// partial() nos permite validar solo los campos que le pasamos, es decir, si le pasamos un objeto con solo el campo title, nos va a validar solo ese campo y no nos va a dar error por los demás campos que no le pasamos
export function validateMoviePatch(object) {
  return movieSchema.partial().safeParse(object);
}
