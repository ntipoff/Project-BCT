"use server";

import { revalidatePath } from "next/cache";
import { createMeetingRecord, deleteMeetingRecord, setAttendanceRecord } from "@/lib/meetings";

export async function createMeeting(formData: FormData) {
  await createMeetingRecord(formData);
  revalidatePath("/meetings");
}

export async function deleteMeeting(meetingId: string) {
  await deleteMeetingRecord(meetingId);
  revalidatePath("/meetings");
}

export async function setAttendance(meetingId: string, formData: FormData) {
  const memberIds = formData.getAll("memberIds").filter((v): v is string => typeof v === "string");
  await setAttendanceRecord(meetingId, memberIds);
  revalidatePath(`/meetings/${meetingId}`);
}
