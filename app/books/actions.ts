"use server";

import { revalidatePath } from "next/cache";
import {
  createBookRecord,
  startReadingRecord,
  finishBookRecord,
  deleteBookRecord,
} from "@/lib/books";

export async function createBook(formData: FormData) {
  await createBookRecord(formData);
  revalidatePath("/books");
}

export async function startReading(bookId: string) {
  await startReadingRecord(bookId);
  revalidatePath("/books");
}

export async function finishBook(bookId: string, formData: FormData) {
  await finishBookRecord(bookId, formData);
  revalidatePath("/books");
}

export async function deleteBook(bookId: string) {
  await deleteBookRecord(bookId);
  revalidatePath("/books");
}
