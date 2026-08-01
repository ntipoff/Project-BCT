import { db } from "./db";

export async function createMeetingRecord(formData: FormData) {
  const date = formData.get("date");
  const bookId = formData.get("bookId");
  const hostId = formData.get("hostId");
  const notes = formData.get("notes");

  if (typeof date !== "string" || date.trim() === "" || Number.isNaN(Date.parse(date))) {
    throw new Error("A valid date is required");
  }
  if (typeof bookId !== "string" || bookId === "") {
    throw new Error("A book is required");
  }
  if (typeof hostId !== "string" || hostId === "") {
    throw new Error("A host is required");
  }

  return db.meeting.create({
    data: {
      date: new Date(date),
      bookId,
      hostId,
      notes: typeof notes === "string" && notes.trim() !== "" ? notes.trim() : null,
    },
  });
}

export async function deleteMeetingRecord(meetingId: string) {
  return db.meeting.delete({ where: { id: meetingId } });
}

export async function setAttendanceRecord(meetingId: string, memberIds: string[]) {
  await db.$transaction([
    db.attendance.deleteMany({ where: { meetingId } }),
    db.attendance.createMany({
      data: memberIds.map((memberId) => ({ meetingId, memberId })),
    }),
  ]);
}
