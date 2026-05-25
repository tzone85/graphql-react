/**
 * Idempotent seed script — run with `npm run seed`. Inserts a fixed set of
 * authors + books if and only if the collections are empty. Safe to run
 * repeatedly.
 */
import "dotenv/config";
import { loadConfig } from "./config.js";
import { connectMongo } from "./db/connect.js";
import { buildAuthorModel } from "./models/author.js";
import { buildBookModel } from "./models/book.js";

async function seed() {
  const config = loadConfig();
  await connectMongo(config.mongoUrl);
  const Author = buildAuthorModel();
  const Book = buildBookModel();

  if ((await Author.countDocuments()) > 0) {
    console.log("authors already present — skip seed");
    return;
  }

  const [rothfuss, hobb, mini] = await Author.create([
    { name: "Patrick Rothfuss", age: 51 },
    { name: "Robin Hobb", age: 71 },
    { name: "Thando Mini", age: 35 },
  ]);
  await Book.create([
    { name: "The Name of the Wind", genre: "Fantasy", authorId: rothfuss._id },
    { name: "The Wise Man's Fear", genre: "Fantasy", authorId: rothfuss._id },
    { name: "Assassin's Apprentice", genre: "Fantasy", authorId: hobb._id },
    { name: "Royal Assassin", genre: "Fantasy", authorId: hobb._id },
    { name: "Umzimba Wam", genre: "Sci-Fi", authorId: mini._id },
    { name: "Thando Mini Chronicles", genre: "Auto Biography", authorId: mini._id },
  ]);
  console.log("seed complete");
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
