import { afterEach, expect, test } from "vitest";
import { db } from "../lib/db";
import {
  createBookRecord,
  startReadingRecord,
  finishBookRecord,
  deleteBookRecord,
} from "../lib/books";

afterEach(async () => {
  await db.attendance.deleteMany({});
  await db.meeting.deleteMany({});
  await db.book.deleteMany({});
});

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

test("createBookRecord creates a PLANNED book with title and author", async () => {
  await createBookRecord(formData({ title: "Dune", author: "Frank Herbert" }));

  const books = await db.book.findMany();
  expect(books).toHaveLength(1);
  expect(books[0].title).toBe("Dune");
  expect(books[0].status).toBe("PLANNED");
  expect(books[0].rating).toBeNull();
});

test("createBookRecord rejects a missing title or author", async () => {
  await expect(createBookRecord(formData({ title: "", author: "Someone" }))).rejects.toThrow();
  await expect(createBookRecord(formData({ title: "Something", author: "" }))).rejects.toThrow();
});

test("startReadingRecord moves a book to READING and sets dateStarted", async () => {
  const book = await db.book.create({ data: { title: "Dune", author: "Frank Herbert" } });

  const updated = await startReadingRecord(book.id);

  expect(updated.status).toBe("READING");
  expect(updated.dateStarted).not.toBeNull();
});

test("finishBookRecord moves a book to FINISHED, sets dateFinished and rating", async () => {
  const book = await db.book.create({
    data: { title: "Dune", author: "Frank Herbert", status: "READING" },
  });

  const updated = await finishBookRecord(book.id, formData({ rating: "5" }));

  expect(updated.status).toBe("FINISHED");
  expect(updated.dateFinished).not.toBeNull();
  expect(updated.rating).toBe(5);
});

test("finishBookRecord rejects an out-of-range rating", async () => {
  const book = await db.book.create({
    data: { title: "Dune", author: "Frank Herbert", status: "READING" },
  });

  await expect(finishBookRecord(book.id, formData({ rating: "7" }))).rejects.toThrow();
});

test("deleteBookRecord removes the book", async () => {
  const book = await db.book.create({ data: { title: "Dune", author: "Frank Herbert" } });

  await deleteBookRecord(book.id);

  expect(await db.book.findMany()).toHaveLength(0);
});
