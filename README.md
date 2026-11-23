# Assignment 9 — Reading List

A small full-stack reading list: an Express 5 REST API stores books in memory, and a React app built with Vite talks to it using Fetch. There is no database or login; restarting the API restores the six seed books.

## Run the project

Use two terminals. The server defaults to port `3000`; the Vite client defaults to `http://localhost:5173`.

```sh
cd server
npm install
npm run dev
```

In the second terminal:

```sh
cd client
cp .env.example .env
npm install
npm run dev
```

On PowerShell, replace `cp .env.example .env` with `Copy-Item .env.example .env`. `server/` reads `PORT` and `CLIENT_ORIGIN` from the environment. `CLIENT_ORIGIN` defaults to `http://localhost:5173`. The client reads `VITE_API_URL` from `client/.env`; its example value is `http://localhost:3000`. No Vite proxy is configured. `.env` files and `node_modules/` are ignored by Git; commit `client/.env.example` instead.

To make a production client build, run `npm run build` in `client/`.

## File organization

- `server/server.js` configures CORS and JSON parsing, declares REST routes, and handles 404s and errors.
- `server/booksStore.js` owns the seed data and asynchronous, immutable in-memory operations.
- `server/validate.js` validates path parameters, query options, and complete or partial book data.
- `server/package.json` and `server/package-lock.json` declare and lock Express 5 and `cors`.
- `client/src/api/books.js` is the only module that calls Fetch or constructs API URLs.
- `client/src/components/` contains the book form, book card, and statistics panel.
- `client/src/App.jsx` coordinates filters, requests, forms, and server-confirmed updates.
- `client/.env.example` documents the API URL; `client/vite.config.js` contains no proxy.

## API routes

| Method and path | Result |
| --- | --- |
| `GET /api/books` | Filtered, sorted and paged book list |
| `GET /api/books/:id` | One book, or `400`/`404` |
| `POST /api/books` | Create a book; `201` and `Location` |
| `PUT /api/books/:id` | Replace every book field |
| `PATCH /api/books/:id` | Change only supplied, recognized fields |
| `DELETE /api/books/:id` | `204` with no response body |
| `GET /api/stats` | Statistics calculated from current books |
| `GET /api/crash` | Intentional async failure used to demonstrate the error handler |

List options can be combined: `genre`, `read`, `q`, `sort`, `order`, `limit`, and `page`. Unknown `/api` routes return JSON 404 errors. The duplicate rule compares trimmed title and author case-insensitively. Book IDs are always assigned by the server; any `id` in the request body is ignored.

## `curl --include` evidence

Start the server with `npm run dev` in `server/`, then run these requests from another terminal. The outputs below were captured from the running API on 23 November 2026. The POST response uses the test book, which is removed later in the sequence.

```sh
curl --include "http://localhost:3000/api/books?genre=science&read=true"
curl --include http://localhost:3000/api/books/1
curl --include -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"title":"Test title","author":"Test author","year":2020,"genre":"other","read":false}'
curl --include -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"title":"","year":2020,"genre":"fantasy"}'
curl --include "http://localhost:3000/api/books?genre=fiction&genre=history"
curl --include http://localhost:3000/api/books/99999
curl --include -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"title":"The Hobbit","author":"J. R. R. Tolkien","year":1937,"genre":"fantasy","read":true,"rating":5}'
curl --include -X PUT http://localhost:3000/api/books/1 -H "Content-Type: application/json" -d '{"title":"Pride and Prejudice","author":"Jane Austen","year":1813,"genre":"fiction","read":true,"rating":5}'
curl --include -X PATCH http://localhost:3000/api/books/1 -H "Content-Type: application/json" -d '{"year":1814}'
curl --include -X DELETE http://localhost:3000/api/books/7
curl --include -X DELETE http://localhost:3000/api/books/7
curl --include http://localhost:3000/api/stats
```

#### 1. Statistics before the create

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 111
ETag: W/"6f-yucHg90h9E2eYPTaX7lPc/eteA8"
Date: Mon, 23 Nov 2026 20:58:43 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":6,"read":4,"unread":2,"averageRating":4.5,"byGenre":{"fiction":2,"science":2,"fantasy":1,"history":1}}
```

#### 2. Combined list filters

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 251
ETag: W/"fb-eHxH/c0GICwjGp4sWuxS3z6hyqc"
Date: Mon, 23 Nov 2026 20:58:43 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":2,"title":"A Brief History of Time","author":"Stephen Hawking","year":1988,"genre":"science","read":true,"rating":4},{"id":5,"title":"The Left Hand of Darkness","author":"Ursula K. Le Guin","year":1969,"genre":"science","read":true,"rating":4}]
```

#### 3. One book

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 114
ETag: W/"72-bqsASFD9Pln9b+pUeDff67TcR3E"
Date: Mon, 23 Nov 2026 20:58:43 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"Pride and Prejudice","author":"Jane Austen","year":1813,"genre":"fiction","read":true,"rating":5}
```

#### 4. Create and stats after the change

```http
HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Location: /api/books/7
Content-Type: application/json; charset=utf-8
Content-Length: 123
ETag: W/"7b-jsz+XiQCUHFY14L6/cIgSfCf1tI"
Date: Mon, 23 Nov 2026 20:58:43 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"CORS and Composition","author":"Nora Reader","year":2021,"genre":"non-fiction","read":false,"rating":null,"id":7}
```

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 127
ETag: W/"7f-gdr2xX44Qoeo8Nvw+Z/ScMbGois"
Date: Mon, 23 Nov 2026 20:58:43 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":7,"read":4,"unread":3,"averageRating":4.5,"byGenre":{"fiction":2,"science":2,"fantasy":1,"history":1,"non-fiction":1}}
```

#### 5. Invalid body

```http
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 54
ETag: W/"36-2Rygc0uaNi6iZpfSVzMK4FGxgrE"
Date: Mon, 23 Nov 2026 20:58:43 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Title must be between 1 and 100 characters"}
```

#### 6. Repeated query parameter

```http
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 58
ETag: W/"3a-CpKmvhchdET8H1tXZcmkRyZDI/8"
Date: Mon, 23 Nov 2026 20:58:43 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Query parameter \"genre\" may only appear once"}
```

#### 7. Missing book

```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Mon, 23 Nov 2026 20:58:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}
```

#### 8. Duplicate

```http
HTTP/1.1 409 Conflict
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 60
ETag: W/"3c-YJy0XpDp5agPe/8cl8QkvyagI8A"
Date: Mon, 23 Nov 2026 20:58:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"A book with this title and author already exists"}
```

#### 9. PUT replacement

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 124
ETag: W/"7c-ggpD/9uZPnr4b38U1J/QagwcKWg"
Date: Mon, 23 Nov 2026 20:58:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"Pride and Prejudice (Revised)","author":"Jane Austen","year":1814,"genre":"fiction","read":true,"rating":5}
```

#### 10. PATCH on the same book

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 124
ETag: W/"7c-zs+5dbA016e7hQavVn0wlNZ62ZA"
Date: Mon, 23 Nov 2026 20:58:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"Pride and Prejudice (Revised)","author":"Jane Austen","year":1815,"genre":"fiction","read":true,"rating":5}
```

#### 11. Delete and repeat the delete

```http
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Date: Mon, 23 Nov 2026 20:58:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Mon, 23 Nov 2026 20:58:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}
```

#### 12. CORS preflight

The CORS middleware answers an `OPTIONS` preflight before a JSON write from `http://localhost:5173`. A command-line preflight check returned `204`; its exact allowed origin and request headers are shown below.

```http
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin, Access-Control-Request-Headers
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type
Content-Length: 0
Date: Mon, 23 Nov 2026 20:59:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

The expected Chrome Network sequence for adding or editing a book is `OPTIONS /api/books` followed by `POST` or `PUT`. The `OPTIONS` response is `204` and includes `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE`, and `Access-Control-Allow-Headers: content-type`. These preflight headers were captured with `curl`; no screenshot or direct Network-panel capture is included.

## Reasoning questions

### 1. Parameters

An `id` identifies one particular resource, so it belongs in the route path: `/api/books/3`. A `genre` or `sort` value changes which collection is returned or how it is ordered, so it belongs in the query string and can be combined with other list options. Putting an ID in the query would make the single-book route less clear and mix resource identity with collection filters.

### 2. Body parsing — experiment

With `express.json()` below the routes, a JSON `POST` reaches the route before the parser has populated `req.body`. The create validation then returns `400` because the required book fields are missing. The submitted server keeps the parser above the routes. The temporary parser-order experiment still needs to be run to record the actual observation.

### 3. One response — experiment

If the `return` is removed from the missing-book check, the handler continues after sending `404` and tries to send a second response. Express reports that headers have already been sent; the `return` prevents that second response attempt. The submitted code keeps the `return`; the temporary double-response experiment still needs to be run to record the actual observation.

### 4. PUT and PATCH

`PATCH` is useful when changing one field, such as updating a book's rating, because the rest of the current book stays as it is. `PUT` replaces the complete resource, so editing a title, author, year, genre, read state, and rating together is a full replacement and must send all required fields.

### 5. CORS — experiment

The preflight request from the configured client origin returned `204` and the allowed-origin header, as shown above. If `CLIENT_ORIGIN` is changed to another origin, the browser reports a CORS policy error because `Access-Control-Allow-Origin` does not match the page; the request still reaches the server logger, which runs before CORS middleware. `curl` does not enforce browser CORS rules, so it can still display the HTTP response. The wrong-origin browser-console experiment remains to be run.

### 6. Validation

Client-side checks help a person correct mistakes before submitting, but a client can be changed or bypassed. The API is the trusted boundary for every caller, so it must independently validate types, ranges, allowed genres, rating/read consistency, and duplicate titles/authors.

### 7. State

Books are held in a module-level array in `booksStore.js`, so restarting the server recreates that array from the six seed entries. Any added or edited books disappear on restart. Keeping changes would require persistent storage such as a database or file-backed store. The restart experiment still needs to be run to record the actual observation.

## Self-study notes

- `URLSearchParams` encodes query values safely. The API module builds list-query strings with it instead of concatenating unescaped input.
- `String.prototype.localeCompare()` compares titles and authors alphabetically. The server sorts a copy, and rated books stay ahead of unrated books even in descending rating order.
- Vite exposes client variables prefixed with `VITE_` through `import.meta.env`; these values are bundled for browser use, so they are not secrets.
- Express's `res.status(204).end()` sends a successful no-content response without a JSON body.
- The client passes an `AbortSignal` from `AbortController` into each list request. When filters change, the effect cleanup aborts the old request and ignores its `AbortError` so stale results do not replace the latest list.
- Express 5 forwards rejected promises from async handlers to the error middleware. The intentional `/api/crash` route demonstrates this; the middleware logs the error but returns only a generic JSON 500 message.

Documentation consulted: [Vite environment variables](https://vite.dev/guide/env-and-mode), [Express 5 error handling](https://expressjs.com/en/guide/error-handling.html), [Express response API](https://expressjs.com/en/5x/api/response.html), [MDN URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams), [MDN `localeCompare`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare), [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

## Challenges faced

The trickiest part was keeping validation consistent between create, replace, and partial updates. I made `PATCH` merge recognized fields with the current server book and validate the resulting complete object, and I clear a rating when marking a read book unread so the data still follows the rule that unread books cannot be rated.
