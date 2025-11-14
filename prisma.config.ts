import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Removed engine constraint to allow standard PostgreSQL connections
  datasource: {
    url: env("DATABASE_URL"),
  },
});
