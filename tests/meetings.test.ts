import { afterEach, beforeEach, expect, test } from "vitest";
import { db } from "../lib/db";
import {
  createMeetingRecord,
  deleteMeetingRecord,
  setAttendanceRecord,
} from "../lib/meetings";

let bookId: string;
let hostId: string;
let otherMemberId: string;

beforeEach(async () => {
  const book = await db.book.create({ data: { title: "Dune", author: "Frank Herbert" } });
  const host = await db.member.create({ data: { name: "Host" } });
  const other = await db.member.create({ data: { name: "Other" } });
  bookId = book.id;
  hostId = host.id;
  otherMemberId = other.id;
});

afterEach(async () => {
  await db.attendance.deleteMany({});
  await db.meeting.deleteMany({});
  await db.member.deleteMany({});
  await db.book.deleteMany({});
});

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

test("createMeetingRecord creates a meeting with date, book, host, and notes", async () => {
  const meeting = await createMeetingRecord(
    formData({ date: "2026-03-01", bookId, hostId, notes: "Great discussion" })
  );

  expect(meeting.bookId).toBe(bookId);
  expect(meeting.hostId).toBe(hostId);
  expect(meeting.notes).toBe("Great discussion");
});

test("createMeetingRecord requires a date, book, and host", async () => {
  await expect(
    createMeetingRecord(formData({ date: "", bookId, hostId }))
  ).rejects.toThrow();
  await expect(
    createMeetingRecord(formData({ date: "2026-03-01", bookId: "", hostId }))
  ).rejects.toThrow();
  await expect(
    createMeetingRecord(formData({ date: "2026-03-01", bookId, hostId: "" }))
  ).rejects.toThrow();
});

test("deleteMeetingRecord removes the meeting and its attendance (cascade)", async () => {
  const meeting = await createMeetingRecord(formData({ date: "2026-03-01", bookId, hostId }));
  await db.attendance.create({ data: { meetingId: meeting.id, memberId: hostId } });

  await deleteMeetingRecord(meeting.id);

  expect(await db.meeting.findMany()).toHaveLength(0);
  expect(await db.attendance.findMany()).toHaveLength(0);
});

test("setAttendanceRecord records who attended, replacing any prior set", async () => {
  const meeting = await createMeetingRecord(formData({ date: "2026-03-01", bookId, hostId }));

  await setAttendanceRecord(meeting.id, [hostId, otherMemberId]);
  let attendance = await db.attendance.findMany({ where: { meetingId: meeting.id } });
  expect(attendance).toHaveLength(2);

  await setAttendanceRecord(meeting.id, [hostId]);
  attendance = await db.attendance.findMany({ where: { meetingId: meeting.id } });
  expect(attendance).toHaveLength(1);
  expect(attendance[0].memberId).toBe(hostId);
});
