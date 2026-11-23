function BookCard({ book, busy, onEdit, onToggleRead, onRate, onDelete }) {
  return (
    <article className={`book-card ${book.read ? "is-read" : "is-unread"}`}>
      <div className="book-topline"><span className="genre-pill">{book.genre.replace("-", " ")}</span><span className={`read-pill ${book.read ? "read" : "unread"}`}>{book.read ? "Read" : "Unread"}</span></div>
      <div className="book-main"><p className="book-year">{book.year}</p><h3>{book.title}</h3><p className="book-author">by {book.author}</p><p className="book-rating">{book.rating === null ? "Not rated" : `★ ${book.rating} / 5`}</p></div>
      <div className="book-controls">
        <label className="compact-label"><span>Rating</span><select aria-label={`Rating for ${book.title}`} value={book.rating ?? ""} disabled={!book.read || busy} onChange={(event) => onRate(event.target.value === "" ? null : Number(event.target.value))}><option value="">None</option>{[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} ★</option>)}</select></label>
        <div className="book-actions"><button type="button" className="text-button" onClick={onToggleRead} disabled={busy}>{book.read ? "Mark unread" : "Mark read"}</button><button type="button" className="text-button" onClick={onEdit} disabled={busy}>Edit</button><button type="button" className="text-button danger-text" onClick={onDelete} disabled={busy}>Delete</button></div>
      </div>
    </article>
  );
}

export default BookCard;
