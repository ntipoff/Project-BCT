import { afterEach, expect, test } from "vitest";
import { db } from "../lib/db";
import { createMemberRecord as createMember, deleteMemberRecord as deleteMember } from "../lib/members";

afterEach(async () => {
  await db.attendance.deleteMany({});
  await db.meeting.deleteMany({});
  await db.member.deleteMany({});
});

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

test("createMember creates a member with a name and optional contact", async () => {
  await createMember(formData({ name: "Alice", contact: "alice@example.com" }));

  const members = await db.member.findMany();
  expect(members).toHaveLength(1);
  expect(members[0].name).toBe("Alice");
  expect(members[0].contact).toBe("alice@example.com");
});

test("createMember rejects an empty name", async () => {
  await expect(createMember(formData({ name: "  " }))).rejects.toThrow();

  const members = await db.member.findMany();
  expect(members).toHaveLength(0);
});

test("deleteMember removes the member", async () => {
  const member = await db.member.create({ data: { name: "Bob" } });

  await deleteMember(member.id);

  const members = await db.member.findMany();
  expect(members).toHaveLength(0);
});
