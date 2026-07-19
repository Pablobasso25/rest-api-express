import cors from "cors";

const ACCEPTED_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:1234",
  "https://movies.com",
  "https://mipagina.com",
  "http://localhost:5173",
];
export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => {
  return cors({
    origin: (origin, callback) => {
      if (acceptedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(
          new Error(
            "No permitido porque no esta en la lista de dominios aceptados",
          ),
        );
      }
    },
  });
};
