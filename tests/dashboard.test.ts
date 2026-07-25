import { afterEach, beforeAll, expect, test } from "vitest";
import { db } from "../lib/db";
import { averageRating, booksReadThisYear, mostActiveMembers } from "../lib/dashboard";

const thisYear = new Date().getFullYear();
const lastYear = thisYear - 1;

afterEach(async () => {
  await db.attendance.deleteMany({});
  await db.meeting.deleteMany({});
  await db.member.deleteMany({});
  await db.book.deleteMany({});
});

test("books read this year: only FINISHED books with dateFinished in the current year", async () => {
  await db.book.create({
    data: {
      title: "Finished This Year",
      author: "A",
      status: "FINISHED",
      dateFinished: new Date(thisYear, 5, 1),
      rating: 5,
    },
  });
  await db.book.create({
    data: {
      title: "Finished Last Year",
      author: "B",
      status: "FINISHED",
      dateFinished: new Date(lastYear, 5, 1),
      rating: 4,
    },
  });
  await db.book.create({ data: { title: "Still Reading", author: "C", status: "READING" } });

  const result = await booksReadThisYear();

  expect(result).toHaveLength(1);
  expect(result[0].title).toBe("Finished This Year");
});

test("average rating: only counts FINISHED books with a rating", async () => {
  await db.book.create({
    data: { title: "Rated 4", author: "A", status: "FINISHED", rating: 4 },
  });
  await db.book.create({
    data: { title: "Rated 2", author: "B", status: "FINISHED", rating: 2 },
  });

  const avg = await averageRating();

  expect(avg).toBe(3);
});

test("average rating: excludes PLANNED/READING books even with a stray rating value", async () => {
  await db.book.create({
    data: { title: "Finished, rated 5", author: "A", status: "FINISHED", rating: 5 },
  });
  // Data that shouldn't normally exist (rating set before status = FINISHED), but the
  // query must be robust to it per D-007 requirement 4.
  await db.book.create({
    data: { title: "Still reading, stray rating", author: "B", status: "READING", rating: 1 },
  });
  await db.book.create({
    data: { title: "Planned, stray rating", author: "C", status: "PLANNED", rating: 1 },
  });

  const avg = await averageRating();

  expect(avg).toBe(5);
});

test("most active members: counts attendance rows per member, most active first", async () => {
  const book = await db.book.create({ data: { title: "Book", author: "A" } });
  const alice = await db.member.create({ data: { name: "Alice" } });
  const bob = await db.member.create({ data: { name: "Bob" } });

  const m1 = await db.meeting.create({ data: { date: new Date(), bookId: book.id, hostId: alice.id } });
  const m2 = await db.meeting.create({ data: { date: new Date(), bookId: book.id, hostId: alice.id } });
  const m3 = await db.meeting.create({ data: { date: new Date(), bookId: book.id, hostId: alice.id } });

  await db.attendance.create({ data: { meetingId: m1.id, memberId: alice.id } });
  await db.attendance.create({ data: { meetingId: m2.id, memberId: alice.id } });
  await db.attendance.create({ data: { meetingId: m3.id, memberId: alice.id } });
  await db.attendance.create({ data: { meetingId: m1.id, memberId: bob.id } });

  const result = await mostActiveMembers();

  expect(result[0].memberId).toBe(alice.id);
  expect(result[0]._count.memberId).toBe(3);
  expect(result[1].memberId).toBe(bob.id);
  expect(result[1]._count.memberId).toBe(1);
});
