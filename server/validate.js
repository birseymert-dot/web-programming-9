export const GENRES = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];
const BOOK_FIELDS = ["title", "author", "year", "genre", "read", "rating"];
const CURRENT_YEAR = new Date().getFullYear();

export function parseBookId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return { valid: false, error: "Book id must be a positive integer" };
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    return { valid: false, error: "Book id is outside the supported range" };
  }
  return { valid: true, value: id };
}

export function validateCompleteBook(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const author = typeof input.author === "string" ? input.author.trim() : "";
  if (title.length < 1 || title.length > 100) {
    return { valid: false, error: "Title must be between 1 and 100 characters" };
  }
  if (author.length < 1 || author.length > 100) {
    return { valid: false, error: "Author must be between 1 and 100 characters" };
  }
  if (!Number.isInteger(input.year) || input.year < 1000 || input.year > CURRENT_YEAR) {
    return { valid: false, error: `Year must be an integer from 1000 to ${CURRENT_YEAR}` };
  }
  if (!GENRES.includes(input.genre)) {
    return { valid: false, error: `Genre must be one of: ${GENRES.join(", ")}` };
  }

  const read = input.read === undefined ? false : input.read;
  if (typeof read !== "boolean") {
    return { valid: false, error: "Read must be true or false" };
  }
  const rating = input.rating === undefined ? null : input.rating;
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return { valid: false, error: "Rating must be an integer from 1 to 5, or null" };
  }
  if (rating !== null && !read) {
    return { valid: false, error: "A book must be marked as read before it can be rated" };
  }

  return {
    valid: true,
    value: { title, author, year: input.year, genre: input.genre, read, rating },
  };
}

export function validateBookQuery(searchParams) {
  for (const key of new Set(searchParams.keys())) {
    if (searchParams.getAll(key).length > 1) {
      return { valid: false, error: `Query parameter "${key}" may only appear once` };
    }
  }

  const genre = searchParams.get("genre");
  if (genre !== null && !GENRES.includes(genre)) {
    return { valid: false, error: `Genre must be one of: ${GENRES.join(", ")}` };
  }

  const readValue = searchParams.get("read");
  if (readValue !== null && readValue !== "true" && readValue !== "false") {
    return { valid: false, error: 'Read must be "true" or "false"' };
  }

  const sort = searchParams.get("sort") ?? "id";
  if (!["id", "title", "author", "year", "rating"].includes(sort)) {
    return { valid: false, error: "Sort must be title, author, year, or rating" };
  }

  const order = searchParams.get("order") ?? "asc";
  if (order !== "asc" && order !== "desc") {
    return { valid: false, error: 'Order must be "asc" or "desc"' };
  }

  const limit = searchParams.has("limit") ? Number(searchParams.get("limit")) : 50;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    return { valid: false, error: "Limit must be an integer from 1 to 50" };
  }

  const page = searchParams.has("page") ? Number(searchParams.get("page")) : 1;
  if (!Number.isInteger(page) || page < 1) {
    return { valid: false, error: "Page must be a positive integer" };
  }

  return {
    valid: true,
    value: {
      genre: genre ?? undefined,
      read: readValue === null ? undefined : readValue === "true",
      q: searchParams.get("q") ?? undefined,
      sort,
      order,
      limit,
      page,
    },
  };
}

export function mergeAndValidateBook(existing, patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return { valid: false, error: "Request body must be a JSON object" };
  }
  const allowedChanges = Object.fromEntries(
    Object.entries(patch).filter(([key]) => BOOK_FIELDS.includes(key)),
  );
  return validateCompleteBook({ ...existing, ...allowedChanges });
}
