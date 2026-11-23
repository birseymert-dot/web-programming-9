const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

async function request(path, { method = "GET", body, signal } = {}) {
  const headers = {};
  const options = { method, headers, signal };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, options);
  if (response.status === 204) return null;
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); }
    catch { data = { message: text }; }
  }
  if (!response.ok) throw new Error(data?.error || data?.message || `Request failed with status ${response.status}`);
  return data;
}

export function listBooks(filters = {}, signal) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "" && value !== null && value !== undefined) query.set(key, String(value));
  }
  return request(`/api/books${query.size ? `?${query.toString()}` : ""}`, { signal });
}

export function getBook(id, signal) { return request(`/api/books/${encodeURIComponent(id)}`, { signal }); }
export function getStats(signal) { return request("/api/stats", { signal }); }
export function createBook(book) { return request("/api/books", { method: "POST", body: book }); }
export function replaceBook(id, book) { return request(`/api/books/${encodeURIComponent(id)}`, { method: "PUT", body: book }); }
export function patchBook(id, changes) { return request(`/api/books/${encodeURIComponent(id)}`, { method: "PATCH", body: changes }); }
export function deleteBook(id) { return request(`/api/books/${encodeURIComponent(id)}`, { method: "DELETE" }); }
