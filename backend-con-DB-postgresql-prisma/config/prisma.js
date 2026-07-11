import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

// 1. Cargamos las variables del archivo .env
dotenv.config();

// 2. Creamos la conexión nativa de PostgreSQL usando la URL del .env
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// 3. Le entregamos esa conexión al adaptador de Prisma
const adapter = new PrismaPg(pool);
// Inicializamos el cliente de Prisma que hablará con Postgres usando el adaptador
export const prisma = new PrismaClient({ adapter });
