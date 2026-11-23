const pause = () => new Promise((resolve) => setTimeout(resolve, 12));

let books = [
  { id: 1, title: "Pride and Prejudice", author: "Jane Austen", year: 1813, genre: "fiction", read: true, rating: 5 },
  { id: 2, title: "A Brief History of Time", author: "Stephen Hawking", year: 1988, genre: "science", read: true, rating: 4 },
  { id: 3, title: "The Hobbit", author: "J. R. R. Tolkien", year: 1937, genre: "fantasy", read: true, rating: 5 },
  { id: 4, title: "The Diary of a Young Girl", author: "Anne Frank", year: 1947, genre: "history", read: false, rating: null },
  { id: 5, title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", year: 1969, genre: "science", read: true, rating: 4 },
  { id: 6, title: "The Little Prince", author: "Antoine de Saint-Exupéry", year: 1943, genre: "fiction", read: false, rating: null },
];

let nextId = books.reduce((largestId, book) => Math.max(largestId, book.id), 0) + 1;

export async function listBooks(options = {}) {
  await pause();
  const { genre, read, q, sort = "id", order = "asc", limit = 50, page = 1 } = options;
  const search = q?.trim().toLocaleLowerCase();
  let result = books.filter((book) => {
    if (genre && book.genre !== genre) return false;
    if (read !== undefined && book.read !== read) return false;
    if (search && !`${book.title} ${book.author}`.toLocaleLowerCase().includes(search)) return false;
    return true;
  });

  const direction = order === "desc" ? -1 : 1;
  result = [...result].sort((left, right) => {
    if (sort === "rating") {
      if (left.rating === null && right.rating !== null) return 1;
      if (right.rating === null && left.rating !== null) return -1;
    }

    let comparison = 0;
    if (sort === "title" || sort === "author") {
      comparison = left[sort].localeCompare(right[sort], undefined, { sensitivity: "base" });
    } else {
      comparison = (left[sort] ?? 0) - (right[sort] ?? 0);
    }
    return comparison === 0 ? left.id - right.id : comparison * direction;
  });

  const start = (page - 1) * limit;
  return result.slice(start, start + limit).map((book) => ({ ...book }));
}

export async function getBookById(id) {
  await pause();
  const book = books.find((item) => item.id === id);
  return book ? { ...book } : null;
}

export async function hasDuplicate(title, author, excludedId = null) {
  await pause();
  const normalizedTitle = title.trim().toLocaleLowerCase();
  const normalizedAuthor = author.trim().toLocaleLowerCase();
  return books.some((book) =>
    book.id !== excludedId &&
    book.title.trim().toLocaleLowerCase() === normalizedTitle &&
    book.author.trim().toLocaleLowerCase() === normalizedAuthor,
  );
}

export async function createBook(bookData) {
  await pause();
  const newBook = { ...bookData, id: nextId };
  books = [...books, newBook];
  nextId += 1;
  return { ...newBook };
}

export async function replaceBook(id, bookData) {
  await pause();
  const existing = books.find((book) => book.id === id);
  if (!existing) return null;
  const replacement = { id, ...bookData };
  books = books.map((book) => (book.id === id ? replacement : book));
  return { ...replacement };
}

export async function deleteBook(id) {
  await pause();
  const exists = books.some((book) => book.id === id);
  if (exists) books = books.filter((book) => book.id !== id);
  return exists;
}

export async function getStats() {
  await pause();
  const readBooks = books.filter((book) => book.read).length;
  const ratedBooks = books.filter((book) => book.rating !== null);
  const byGenre = books.reduce((counts, book) => ({
    ...counts,
    [book.genre]: (counts[book.genre] ?? 0) + 1,
  }), {});

  return {
    total: books.length,
    read: readBooks,
    unread: books.length - readBooks,
    averageRating: ratedBooks.length
      ? Math.round((ratedBooks.reduce((total, book) => total + book.rating, 0) / ratedBooks.length) * 10) / 10
      : null,
    byGenre,
  };
}
