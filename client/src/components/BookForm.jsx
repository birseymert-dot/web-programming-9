import { useState } from "react";

const genres = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];

function BookForm({ book, busy, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    title: book?.title ?? "", author: book?.author ?? "", year: book?.year ?? "",
    genre: book?.genre ?? "fiction", read: book?.read ?? false, rating: book?.rating ?? "",
  }));
  function update(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }
  function submit(event) {
    event.preventDefault();
    onSubmit({ title: form.title, author: form.author, year: Number(form.year), genre: form.genre,
      read: form.read, rating: form.read && form.rating !== "" ? Number(form.rating) : null });
  }

  return (
    <form className="book-form" onSubmit={submit}>
      <div className="form-heading"><div><p className="eyebrow">{book ? "Update your shelf" : "A new chapter"}</p><h2 id="form-title">{book ? "Edit book" : "Add a book"}</h2></div><button className="icon-button" type="button" onClick={onCancel} aria-label="Close form" disabled={busy}>×</button></div>
      <label>Title<input name="title" value={form.title} onChange={update} autoFocus /></label>
      <label>Author<input name="author" value={form.author} onChange={update} /></label>
      <div className="form-row"><label>Year<input name="year" type="number" value={form.year} onChange={update} /></label><label>Genre<select name="genre" value={form.genre} onChange={update}>{genres.map((genre) => <option key={genre} value={genre}>{genre.replace("-", " ")}</option>)}</select></label></div>
      <label className="checkbox-label"><input name="read" type="checkbox" checked={form.read} onChange={update} /> I have read this book</label>
      <label>Rating<select name="rating" value={form.rating} onChange={update} disabled={!form.read}><option value="">No rating</option>{[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label>
      <div className="form-actions"><button className="secondary-button" type="button" onClick={onCancel} disabled={busy}>Cancel</button><button className="primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : book ? "Save changes" : "Add to shelf"}</button></div>
    </form>
  );
}

export default BookForm;
