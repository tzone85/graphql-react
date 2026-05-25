# graphql-react · Books + Authors GraphQL API

Express + GraphQL + Mongoose backend exposing a `Book` and `Author` schema
with nested relationship resolution. Includes a built-in [Ruru](https://github.com/graphile/ruru)
explorer at `/explorer`.

[![CI](https://github.com/tzone85/graphql-react/actions/workflows/ci.yml/badge.svg)](https://github.com/tzone85/graphql-react/actions/workflows/ci.yml)
![Node 20+](https://img.shields.io/badge/node-20%2B-339933)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

The original repo had a complete-ish GraphQL schema but **`package.json`
only declared `express`** — graphql, mongoose, lodash, express-graphql were
all required by the code yet never installed. Plus the seed data was
re-inserted on every server startup, the credentials were hardcoded, and
there was a duplicate `Book` model defined inline in `app.js` that shadowed
`models/book.js`. This rewrite delivers a working product.

## Bugs / smells fixed during the port

| File / area (original)              | Issue                                                                                          |
|-------------------------------------|------------------------------------------------------------------------------------------------|
| `server/package.json`               | Listed only `express`. Code required `graphql`, `mongoose`, `lodash`, `express-graphql`. Now all real deps declared. |
| `server/app.js:14`                  | Hardcoded `mongodb://root:example@localhost:27017/admin`. Now `MONGO_URL` env via zod-validated `loadConfig`. |
| `server/app.js:17`                  | Inline `mongoose.model('Books', books)` shadowed `models/book.js`. Removed; single source of truth in `src/models/book.js`. |
| `server/app.js:34`                  | `Book.insertMany([...])` ran on every server start, polluting the DB with duplicates. Replaced with an idempotent `npm run seed` script (`countDocuments() > 0 → skip`). |
| `server/app.js:36`                  | `express-graphql` is deprecated. Replaced with a tiny Express middleware that calls `graphql()` core directly (avoids the dual-package ESM/CJS instanceof hazard that `graphql-http`/`express-graphql` both hit). |
| `server/controllers/BookController.js` | Empty stub with a comment about an unfinished `getBooks` function. Removed — GraphQL resolvers replace REST controllers here. |
| `server/routes/index.js`            | Half-Fastify-style placeholder with empty handler. Removed. |
| `server/schema/schema.js`           | Args used `GraphQLID` without `GraphQLNonNull` — clients could send `null` and crash the resolver. Added `GraphQLNonNull` on all required args. Also tightened ID type to `ObjectId` ref in the model. |

## Architecture

![Component diagram](docs/architecture/component.svg)

![Sequence — nested book→author query](docs/architecture/sequence_query.svg)

![Deployment](docs/architecture/deployment.svg)

Diagrams are PlantUML under `docs/architecture/*.puml`; rendered SVGs are checked in. Regenerate with `./scripts/render_diagrams.sh`.

## Schema

```graphql
type Author {
  id: ID
  name: String
  age: Int
  books: [Book]          # nested via authorId reverse-lookup
}

type Book {
  id: ID
  name: String
  genre: String
  author: Author         # nested via authorId
}

type Query {
  book(id: ID!): Book
  books: [Book]
  author(id: ID!): Author
  authors: [Author]
}

type Mutation {
  addAuthor(name: String!, age: Int!): Author
  addBook(name: String!, genre: String!, authorId: ID!): Book
  deleteBook(id: ID!): Book
}
```

## Quick start

```
cp .env.example .env       # adjust MONGO_URL if needed
npm install
docker run -d -p 27017:27017 --name mongo mongo:7    # or: docker compose up mongo
npm start
npm run seed                # one-shot idempotent seed
```

Then open `http://localhost:4000/explorer` and run:

```graphql
query {
  authors {
    name
    age
    books { name genre }
  }
}
```

Full stack via Docker:

```
docker compose up --build
```

## Configuration

| Variable    | Required | Default                                  |
|-------------|----------|------------------------------------------|
| `MONGO_URL` | no       | `mongodb://localhost:27017/library`      |
| `PORT`      | no       | `4000`                                   |
| `LOG_LEVEL` | no       | `info`                                   |

## Project layout

```
src/
├── server.js              # entrypoint (loads .env, connects to mongo)
├── seed.js                # idempotent npm run seed
├── app.js                 # composition root — createApp({Book?, Author?})
├── config.js              # zod-validated env
├── db/connect.js          # mongoose with retry
├── models/
│   ├── book.js
│   └── author.js
└── schema/
    └── schema.js          # buildSchema({Book, Author}) — testable factory
tests/
├── unit/config.test.js    # 4 tests
└── integration/graphql.test.js  # 14 supertest GraphQL tests vs in-memory Mongo
docs/architecture/         # PlantUML + SVGs
.github/workflows/ci.yml
Dockerfile
docker-compose.yml
```

## Tests

| Suite                                | Count   | What                                                                       |
|--------------------------------------|---------|----------------------------------------------------------------------------|
| `tests/unit/config.test.js`          | 4       | Defaults, MONGO_URL validation, PORT numeric, LOG_LEVEL enum               |
| `tests/integration/graphql.test.js`  | 14      | Meta routes, addAuthor + author/authors, addBook + book/books with nested author resolution, author.books reverse lookup, deleteBook, GraphQL validation errors on missing args / unknown fields |
| **Total**                            | **18**  | 85% line / 75% branch gate                                                 |

## CI

Lint → tests (in-memory Mongo) → Docker build → `npm audit --audit-level=high --omit=dev`. `master` branch-protected requiring all 4 checks.

## License

MIT — see [LICENSE](LICENSE).
