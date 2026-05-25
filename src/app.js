import express from "express";
import { graphql, parse, validate } from "graphql";
import { ruruHTML } from "ruru/server";
import { buildAuthorModel } from "./models/author.js";
import { buildBookModel } from "./models/book.js";
import { buildSchema } from "./schema/schema.js";

/**
 * Composition root. Tests pass `{ Book, Author }` to plug in
 * in-memory-Mongo-backed models; production builds them from real
 * mongoose models.
 *
 * Uses graphql core directly (no graphql-http / express-graphql) — those
 * libraries instanceof-check the schema across module realms which trips
 * on the graphql package's dual ESM/CJS exports.
 */
export function createApp({ Book, Author, logger = console } = {}) {
  const BookModel = Book ?? buildBookModel();
  const AuthorModel = Author ?? buildAuthorModel();
  const schema = buildSchema({ Book: BookModel, Author: AuthorModel });

  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.get("/", (_req, res) => res.json({ service: "graphql-react", version: "1.0.0" }));
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.all("/graphql", async (req, res) => {
    let query, variableValues, operationName;
    if (req.method === "GET") {
      query = req.query.query;
      operationName = req.query.operationName;
      try {
        variableValues = req.query.variables ? JSON.parse(req.query.variables) : undefined;
      } catch {
        return res.status(400).json({ errors: [{ message: "invalid variables JSON" }] });
      }
    } else if (req.method === "POST") {
      query = req.body?.query;
      variableValues = req.body?.variables;
      operationName = req.body?.operationName;
    } else {
      res.set("Allow", "GET, POST, OPTIONS");
      return res.status(405).json({ errors: [{ message: "method not allowed" }] });
    }
    if (!query) {
      return res.status(400).json({ errors: [{ message: "query is required" }] });
    }
    try {
      const document = parse(query);
      const validationErrors = validate(schema, document);
      if (validationErrors.length > 0) {
        return res.status(200).json({ errors: validationErrors.map((e) => ({ message: e.message }))});
      }
      const result = await graphql({ schema, source: query, variableValues, operationName });
      return res.json(result);
    } catch (err) {
      logger.error?.("graphql exec error", err);
      return res.status(400).json({ errors: [{ message: err.message }] });
    }
  });

  // GraphiQL-style explorer
  app.get("/explorer", (_req, res) => {
    res.type("html").send(ruruHTML({ endpoint: "/graphql" }));
  });

  app.use((_req, res) => res.status(404).json({ error: "not found" }));
  app.use((err, _req, res, _next) => {
    logger.error?.("unhandled error", err);
    res.status(500).json({ error: "internal server error" });
  });

  return app;
}
