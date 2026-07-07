import express, { json } from "express";
import { moviesRouter } from "./routes/movies.js";
import { corsMiddleware } from "./middlewares/cors.js";

const app = express();
//middleware nativo de express que me permite leer el body que viene junto a la request (envia el usuario en una peticion post por ejempo)
app.use(json());
app.use(corsMiddleware());
app.disable("x-powered-by"); // deshabilitar el header x-powered-by : express

// Todos los recursos que sean MOVIES se identifican con /movies
app.use("/movies", moviesRouter);

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
