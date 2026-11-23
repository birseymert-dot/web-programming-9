import { useEffect, useState } from "react";
import { createBook, deleteBook, listBooks, patchBook, replaceBook, getStats } from "./api/books.js";
import BookCard from "./components/BookCard.jsx";
import BookForm from "./components/BookForm.jsx";
import StatsPanel from "./components/StatsPanel.jsx";
import "./App.css";

const initialFilters = { q: "", genre: "", read: "", sort: "id", order: "asc" };

function App() {
  const [filters, setFilters] = useState(initialFilters);
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [statsError, setStatsError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyBookId, setBusyBookId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setListError("");
    listBooks(filters, controller.signal)
      .then((data) => setBooks(data))
      .catch((error) => {
        if (error.name !== "AbortError") setListError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    setStatsError("");
    getStats(controller.signal)
      .then((data) => setStats(data))
      .catch((error) => {
        if (error.name !== "AbortError") setStatsError(error.message);
      });
    return () => controller.abort();
  }, [refreshKey]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function refreshAfterChange() {
    setRefreshKey((current) => current + 1);
  }

  async function handleSave(payload) {
    setSaving(true);
    setActionError("");
    try {
      if (editingBook) await replaceBook(editingBook.id, payload);
      else await createBook(payload);
      setFormOpen(false);
      setEditingBook(null);
      refreshAfterChange();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function runBookAction(book, action) {
    setBusyBookId(book.id);
    setActionError("");
    try {
      await action();
      refreshAfterChange();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyBookId(null);
    }
  }

  function beginEdit(book) {
    setActionError("");
    setEditingBook(book);
    setFormOpen(true);
  }

  function beginAdd() {
    setActionError("");
    setEditingBook(null);
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingBook(null);
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">A little shelf for your next great read</p>
          <h1>Reading List</h1>
          <p className="hero-copy">Keep your books in one place. Search, sort, rate, and update your reading progress.</p>
        </div>
        <button className="primary-button add-button" type="button" onClick={beginAdd}>＋ Add a book</button>
      </header>

      <StatsPanel stats={stats} error={statsError} />

      <section className="library-panel" aria-labelledby="library-heading">
        <div className="section-heading">
          <div><p className="eyebrow">Your collection</p><h2 id="library-heading">Bookshelf</h2></div>
          <span className="result-count">{loading ? "Loading…" : `${books.length} ${books.length === 1 ? "book" : "books"}`}</span>
        </div>

        <div className="filters" aria-label="Filter and sort books">
          <label className="search-field"><span>Search title or author</span><input name="q" value={filters.q} onChange={updateFilter} placeholder="Try “Tolkien”" /></label>
          <label><span>Genre</span><select name="genre" value={filters.genre} onChange={updateFilter}><option value="">All genres</option><option value="fiction">Fiction</option><option value="non-fiction">Non-fiction</option><option value="science">Science</option><option value="history">History</option><option value="fantasy">Fantasy</option><option value="other">Other</option></select></label>
          <label><span>Reading status</span><select name="read" value={filters.read} onChange={updateFilter}><option value="">All books</option><option value="true">Read</option><option value="false">Unread</option></select></label>
          <label><span>Sort by</span><select name="sort" value={filters.sort} onChange={updateFilter}><option value="id">Recently added</option><option value="title">Title</option><option value="author">Author</option><option value="year">Year</option><option value="rating">Rating</option></select></label>
          <label><span>Direction</span><select name="order" value={filters.order} onChange={updateFilter}><option value="asc">Ascending</option><option value="desc">Descending</option></select></label>
        </div>

        {actionError && <p className="error-message action-error" role="alert">{actionError}</p>}
        {loading && <p className="state-message">Loading your books…</p>}
        {!loading && listError && <p className="error-message" role="alert">{listError}</p>}
        {!loading && !listError && books.length === 0 && <div className="empty-state"><span className="empty-icon">✦</span><h3>No books found</h3><p>Try changing the filters or add a book to your shelf.</p></div>}
        {!loading && !listError && books.length > 0 && (
          <div className="book-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                busy={busyBookId === book.id}
                onEdit={() => beginEdit(book)}
                onToggleRead={() => runBookAction(book, () => patchBook(book.id, book.read ? { read: false, rating: null } : { read: true }))}
                onRate={(rating) => runBookAction(book, () => patchBook(book.id, { rating }))}
                onDelete={() => runBookAction(book, () => deleteBook(book.id))}
              />
            ))}
          </div>
        )}
      </section>

      {formOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeForm();
        }}>
          <section className="book-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <BookForm key={editingBook?.id ?? "new-book"} book={editingBook} busy={saving} onSubmit={handleSave} onCancel={closeForm} />
          </section>
        </div>
      )}
      <footer className="site-footer">A quiet shelf, ready for your next chapter.</footer>
    </main>
  );
}

export default App;
