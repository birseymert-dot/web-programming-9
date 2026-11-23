function StatsPanel({ stats, error }) {
  if (error) return <p className="error-message stats-error" role="alert">Statistics could not be loaded: {error}</p>;
  if (!stats) return <section className="stats-panel" aria-label="Reading statistics"><p className="state-message">Loading statistics…</p></section>;
  return (
    <section className="stats-panel" aria-label="Reading statistics">
      <div className="stat-item"><span className="stat-number">{stats.total}</span><span className="stat-label">Total books</span></div>
      <div className="stat-item"><span className="stat-number">{stats.read}</span><span className="stat-label">Read</span></div>
      <div className="stat-item"><span className="stat-number">{stats.unread}</span><span className="stat-label">Still to read</span></div>
      <div className="stat-item"><span className="stat-number">{stats.averageRating === null ? "—" : `★ ${stats.averageRating}`}</span><span className="stat-label">Average rating</span></div>
      <div className="genre-summary"><span className="stat-label">Genres</span><p>{Object.entries(stats.byGenre).map(([genre, count]) => `${genre.replace("-", " ")} ${count}`).join(" · ")}</p></div>
    </section>
  );
}

export default StatsPanel;
