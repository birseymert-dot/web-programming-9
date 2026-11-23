import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createBook,
  deleteBook,
  getBookById,
  getStats,
  hasDuplicate,
  listBooks,
  replaceBook,
} from "./booksStore.js";
import { mergeAndValidateBook, parseBookId, validateBookQuery, validateCompleteBook } from "./validate.js";

const app = express();
const port = process.env.PORT || 3000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const thisDirectory = path.dirname(fileURLToPath(import.meta.url));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get("/api/books", async (req, res) => {
  const query = new URL(req.originalUrl, "http://localhost").searchParams;
  const parsed = validateBookQuery(query);
  if (!parsed.valid) return res.status(400).json({ error: parsed.error });
  const result = await listBooks(parsed.value);
  return res.json(result);
});

app.get("/api/books/:id", async (req, res) => {
  const parsedId = parseBookId(req.params.id);
  if (!parsedId.valid) return res.status(400).json({ error: parsedId.error });
  const book = await getBookById(parsedId.value);
  if (!book) return res.status(404).json({ error: "Book not found" });
  return res.json(book);
});

app.post("/api/books", async (req, res) => {
  const parsed = validateCompleteBook(req.body);
  if (!parsed.valid) return res.status(400).json({ error: parsed.error });
  if (await hasDuplicate(parsed.value.title, parsed.value.author)) {
    return res.status(409).json({ error: "A book with this title and author already exists" });
  }
  const book = await createBook(parsed.value);
  return res.location(`/api/books/${book.id}`).status(201).json(book);
});

app.put("/api/books/:id", async (req, res) => {
  const parsedId = parseBookId(req.params.id);
  if (!parsedId.valid) return res.status(400).json({ error: parsedId.error });
  const existing = await getBookById(parsedId.value);
  if (!existing) return res.status(404).json({ error: "Book not found" });
  const parsed = validateCompleteBook(req.body);
  if (!parsed.valid) return res.status(400).json({ error: parsed.error });
  if (await hasDuplicate(parsed.value.title, parsed.value.author, parsedId.value)) {
    return res.status(409).json({ error: "A book with this title and author already exists" });
  }
  const book = await replaceBook(parsedId.value, parsed.value);
  if (!book) return res.status(404).json({ error: "Book not found" });
  return res.json(book);
});

app.patch("/api/books/:id", async (req, res) => {
  const parsedId = parseBookId(req.params.id);
  if (!parsedId.valid) return res.status(400).json({ error: parsedId.error });
  const existing = await getBookById(parsedId.value);
  if (!existing) return res.status(404).json({ error: "Book not found" });
  const parsed = mergeAndValidateBook(existing, req.body);
  if (!parsed.valid) return res.status(400).json({ error: parsed.error });
  if (await hasDuplicate(parsed.value.title, parsed.value.author, parsedId.value)) {
    return res.status(409).json({ error: "A book with this title and author already exists" });
  }
  const book = await replaceBook(parsedId.value, parsed.value);
  if (!book) return res.status(404).json({ error: "Book not found" });
  return res.json(book);
});

app.delete("/api/books/:id", async (req, res) => {
  const parsedId = parseBookId(req.params.id);
  if (!parsedId.valid) return res.status(400).json({ error: parsedId.error });
  const deleted = await deleteBook(parsedId.value);
  if (!deleted) return res.status(404).json({ error: "Book not found" });
  return res.status(204).end();
});

app.get("/api/stats", async (req, res) => {
  const stats = await getStats();
  return res.json(stats);
});

// Intentional async failure route for the error-middleware experiment.
app.get("/api/crash", async () => {
  throw new Error("Intentional async route failure");
});

app.use((req, res) => {
  if (req.path === "/api" || req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.status(404).json({ error: "Not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  if (error?.type === "entity.parse.failed" || (error instanceof SyntaxError && error.status === 400)) {
    return res.status(400).json({ error: "Malformed JSON request body" });
  }
  return res.status(500).json({ error: "Something went wrong" });
});

app.listen(port, () => {
  console.log(`Reading List API listening at http://localhost:${port}`);
  console.log(`Allowed client origin: ${clientOrigin}`);
});
