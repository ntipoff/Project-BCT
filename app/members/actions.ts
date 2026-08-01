"use server";

import { revalidatePath } from "next/cache";
import { createMemberRecord, deleteMemberRecord } from "@/lib/members";

export async function createMember(formData: FormData) {
  await createMemberRecord(formData);
  revalidatePath("/members");
}

export async function deleteMember(memberId: string) {
  await deleteMemberRecord(memberId);
  revalidatePath("/members");
}
