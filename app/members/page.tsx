import { db } from "@/lib/db";
import { createMember, deleteMember } from "./actions";

export default async function MembersPage() {
  const members = await db.member.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-xl font-semibold">Members</h1>

      <ul className="mb-8 flex flex-col gap-2">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between rounded border px-3 py-2">
            <span>
              {m.name}
              {m.contact && <span className="ml-2 text-sm text-gray-500">{m.contact}</span>}
            </span>
            <form action={deleteMember.bind(null, m.id)}>
              <button type="submit" className="text-sm text-red-600 hover:underline">
                Remove
              </button>
            </form>
          </li>
        ))}
        {members.length === 0 && <li className="text-sm text-gray-500">No members yet.</li>}
      </ul>

      <form action={createMember} className="flex flex-col gap-3 rounded border p-4">
        <h2 className="font-medium">Add a member</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span>Name</span>
          <input name="name" required className="rounded border px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Contact (optional)</span>
          <input name="contact" className="rounded border px-2 py-1" />
        </label>
        <button
          type="submit"
          className="self-start rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Add member
        </button>
      </form>
    </main>
  );
}
