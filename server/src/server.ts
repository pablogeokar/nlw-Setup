/*import express from "express";
import cors from "cors";

import appRoutes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(appRoutes);

app.use("*", (req, res) =>
  res.status(404).json({ error: "Recurso não encontrado" })
);

app.listen(3333, () => console.log("[HTTP] is running"));
*/

import Fastify from "fastify";
import cors from "@fastify/cors";

import { appRoutes } from "./routes";

const app = Fastify();

app.register(cors);
app.register(appRoutes);

app
  .listen({ port: 3333, host: "0.0.0.0" })
  .then(() => console.log("[HTTP] server is running"));
