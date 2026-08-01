import { db } from "./db";

export async function createBookRecord(formData: FormData) {
  const title = formData.get("title");
  const author = formData.get("author");

  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("Title is required");
  }
  if (typeof author !== "string" || author.trim() === "") {
    throw new Error("Author is required");
  }

  return db.book.create({ data: { title: title.trim(), author: author.trim() } });
}

export async function startReadingRecord(bookId: string) {
  return db.book.update({
    where: { id: bookId },
    data: { status: "READING", dateStarted: new Date() },
  });
}

function parseRating(formData: FormData): number | null {
  const raw = formData.get("rating");
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const rating = Number(raw);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer from 1 to 5");
  }
  return rating;
}

export async function finishBookRecord(bookId: string, formData: FormData) {
  const rating = parseRating(formData);
  return db.book.update({
    where: { id: bookId },
    data: { status: "FINISHED", dateFinished: new Date(), rating },
  });
}

export async function deleteBookRecord(bookId: string) {
  return db.book.delete({ where: { id: bookId } });
}
