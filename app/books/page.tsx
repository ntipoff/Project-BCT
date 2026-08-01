import { db } from "@/lib/db";
import { createBook, startReading, finishBook, deleteBook } from "./actions";

function formatDate(d: Date | null) {
  if (!d) return null;
  return new Date(d).toISOString().slice(0, 10);
}

export default async function BooksPage() {
  const books = await db.book.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-xl font-semibold">Books</h1>

      <ul className="mb-8 flex flex-col gap-3">
        {books.map((b) => (
          <li key={b.id} className="rounded border p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">
                  {b.title} <span className="text-sm text-gray-500">by {b.author}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {b.status}
                  {b.dateStarted && ` · started ${formatDate(b.dateStarted)}`}
                  {b.dateFinished && ` · finished ${formatDate(b.dateFinished)}`}
                  {b.rating != null && ` · rated ${b.rating}/5`}
                </p>
              </div>
              <form action={deleteBook.bind(null, b.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Remove
                </button>
              </form>
            </div>

            {b.status === "PLANNED" && (
              <form action={startReading.bind(null, b.id)} className="mt-2">
                <button
                  type="submit"
                  className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                >
                  Start reading
                </button>
              </form>
            )}

            {b.status === "READING" && (
              <form action={finishBook.bind(null, b.id)} className="mt-2 flex items-center gap-2">
                <label className="text-sm">
                  Rating:
                  <select name="rating" className="ml-1 rounded border px-2 py-1 text-sm">
                    <option value="">—</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                >
                  Mark finished
                </button>
              </form>
            )}
          </li>
        ))}
        {books.length === 0 && <li className="text-sm text-gray-500">No books yet.</li>}
      </ul>

      <form action={createBook} className="flex flex-col gap-3 rounded border p-4">
        <h2 className="font-medium">Add a book</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span>Title</span>
          <input name="title" required className="rounded border px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Author</span>
          <input name="author" required className="rounded border px-2 py-1" />
        </label>
        <button
          type="submit"
          className="self-start rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Add book
        </button>
      </form>
    </main>
  );
}
