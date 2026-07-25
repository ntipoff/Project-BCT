import { afterEach, beforeEach, expect, test } from "vitest";
import { db } from "../lib/db";

let bookId: string;
let hostId: string;
let meetingId: string;

beforeEach(async () => {
  const book = await db.book.create({ data: { title: "Test Book", author: "Test Author" } });
  const host = await db.member.create({ data: { name: "Host Member" } });
  const meeting = await db.meeting.create({
    data: { date: new Date(), bookId: book.id, hostId: host.id },
  });
  bookId = book.id;
  hostId = host.id;
  meetingId = meeting.id;
});

afterEach(async () => {
  await db.attendance.deleteMany({});
  await db.meeting.deleteMany({});
  await db.member.deleteMany({});
  await db.book.deleteMany({});
});

test("attendance composite key rejects a duplicate (same member, same meeting)", async () => {
  await db.attendance.create({ data: { meetingId, memberId: hostId } });

  await expect(
    db.attendance.create({ data: { meetingId, memberId: hostId } })
  ).rejects.toThrow();
});

test("attendance allows the same member at a different meeting", async () => {
  await db.attendance.create({ data: { meetingId, memberId: hostId } });

  const otherMeeting = await db.meeting.create({
    data: { date: new Date(), bookId, hostId },
  });

  await expect(
    db.attendance.create({ data: { meetingId: otherMeeting.id, memberId: hostId } })
  ).resolves.toBeTruthy();
});
