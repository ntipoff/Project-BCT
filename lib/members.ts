import { db } from "./db";

export async function createMemberRecord(formData: FormData) {
  const name = formData.get("name");
  const contact = formData.get("contact");

  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("Member name is required");
  }

  return db.member.create({
    data: {
      name: name.trim(),
      contact: typeof contact === "string" && contact.trim() !== "" ? contact.trim() : null,
    },
  });
}

export async function deleteMemberRecord(memberId: string) {
  return db.member.delete({ where: { id: memberId } });
}
