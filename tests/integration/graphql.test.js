import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { buildAuthorModel } from "../../src/models/author.js";
import { buildBookModel } from "../../src/models/book.js";

let mongod;
let app;
let Book;
let Author;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  Book = buildBookModel();
  Author = buildAuthorModel();
  app = createApp({ Book, Author, logger: { error: () => {} } });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod?.stop();
});

afterEach(async () => {
  await Book.deleteMany({});
  await Author.deleteMany({});
});

async function gql(query, variables) {
  return request(app).post("/graphql").send({ query, variables });
}

describe("meta", () => {
  it("GET / returns service banner", async () => {
    const r = await request(app).get("/");
    expect(r.status).toBe(200);
    expect(r.body.service).toBe("graphql-react");
  });

  it("GET /health returns ok", async () => {
    const r = await request(app).get("/health");
    expect(r.body).toEqual({ status: "ok" });
  });

  it("GET /explorer returns HTML for the Ruru explorer", async () => {
    const r = await request(app).get("/explorer");
    expect(r.status).toBe(200);
    expect(r.text).toMatch(/<html/i);
  });

  it("unknown route 404", async () => {
    const r = await request(app).get("/nope");
    expect(r.status).toBe(404);
  });
});

describe("Author mutations + queries", () => {
  it("addAuthor mutation creates and returns the author", async () => {
    const r = await gql(`mutation { addAuthor(name: "Alice", age: 30) { id name age } }`);
    expect(r.status).toBe(200);
    expect(r.body.data.addAuthor.id).toBeDefined();
    expect(r.body.data.addAuthor.name).toBe("Alice");
    expect(r.body.data.addAuthor.age).toBe(30);
  });

  it("author(id) returns the matching record", async () => {
    const create = await gql(`mutation { addAuthor(name: "B", age: 21) { id } }`);
    const id = create.body.data.addAuthor.id;
    const r = await gql(`query ($id: ID!) { author(id: $id) { name age } }`, { id });
    expect(r.body.data.author).toEqual({ name: "B", age: 21 });
  });

  it("authors returns the full list", async () => {
    await gql(`mutation { addAuthor(name: "A", age: 20) { id } }`);
    await gql(`mutation { addAuthor(name: "B", age: 21) { id } }`);
    const r = await gql(`query { authors { name } }`);
    expect(r.body.data.authors).toHaveLength(2);
  });
});

describe("Book mutations + queries", () => {
  async function makeAuthor(name = "Author", age = 30) {
    const r = await gql(`mutation ($n: String!, $a: Int!) { addAuthor(name: $n, age: $a) { id } }`, { n: name, a: age });
    return r.body.data.addAuthor.id;
  }

  it("addBook creates with authorId", async () => {
    const authorId = await makeAuthor();
    const r = await gql(
      `mutation ($n: String!, $g: String!, $a: ID!) { addBook(name: $n, genre: $g, authorId: $a) { id name genre } }`,
      { n: "Hyperion", g: "Sci-Fi", a: authorId },
    );
    expect(r.body.data.addBook.id).toBeDefined();
    expect(r.body.data.addBook.name).toBe("Hyperion");
  });

  it("book(id).author resolves the related author", async () => {
    const authorId = await makeAuthor("Dan", 65);
    const bookRes = await gql(
      `mutation ($n: String!, $g: String!, $a: ID!) { addBook(name: $n, genre: $g, authorId: $a) { id } }`,
      { n: "Endymion", g: "Sci-Fi", a: authorId },
    );
    const bookId = bookRes.body.data.addBook.id;
    const r = await gql(
      `query ($id: ID!) { book(id: $id) { name author { name age } } }`,
      { id: bookId },
    );
    expect(r.body.data.book.name).toBe("Endymion");
    expect(r.body.data.book.author).toEqual({ name: "Dan", age: 65 });
  });

  it("author.books resolves the related book list", async () => {
    const authorId = await makeAuthor("Multi", 40);
    await gql(`mutation ($n: String!, $g: String!, $a: ID!) { addBook(name: $n, genre: $g, authorId: $a) { id } }`, { n: "B1", g: "F", a: authorId });
    await gql(`mutation ($n: String!, $g: String!, $a: ID!) { addBook(name: $n, genre: $g, authorId: $a) { id } }`, { n: "B2", g: "F", a: authorId });
    const r = await gql(`query ($id: ID!) { author(id: $id) { name books { name } } }`, { id: authorId });
    expect(r.body.data.author.books).toHaveLength(2);
  });

  it("books returns full list", async () => {
    const authorId = await makeAuthor();
    await gql(`mutation ($n: String!, $g: String!, $a: ID!) { addBook(name: $n, genre: $g, authorId: $a) { id } }`, { n: "B", g: "F", a: authorId });
    const r = await gql(`query { books { name genre } }`);
    expect(r.body.data.books).toHaveLength(1);
  });

  it("deleteBook removes the book and returns it", async () => {
    const authorId = await makeAuthor();
    const create = await gql(`mutation ($n: String!, $g: String!, $a: ID!) { addBook(name: $n, genre: $g, authorId: $a) { id } }`, { n: "Tmp", g: "F", a: authorId });
    const id = create.body.data.addBook.id;
    const del = await gql(`mutation ($id: ID!) { deleteBook(id: $id) { id name } }`, { id });
    expect(del.body.data.deleteBook.id).toBe(id);
    const after = await gql(`query ($id: ID!) { book(id: $id) { name } }`, { id });
    expect(after.body.data.book).toBeNull();
  });
});

describe("validation", () => {
  it("rejects mutation with missing required arg", async () => {
    const r = await gql(`mutation { addAuthor(name: "x") { id } }`);
    expect(r.body.errors).toBeDefined();
    expect(r.body.errors[0].message).toMatch(/argument "age"/i);
  });

  it("returns errors on malformed query", async () => {
    const r = await gql(`query { not_a_field }`);
    expect(r.body.errors).toBeDefined();
  });
});
