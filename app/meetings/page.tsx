import Link from "next/link";
import { db } from "@/lib/db";
import { createMeeting, deleteMeeting } from "./actions";

function formatDate(d: Date) {
  return new Date(d).toISOString().slice(0, 10);
}

export default async function MeetingsPage() {
  const [meetings, books, members] = await Promise.all([
    db.meeting.findMany({
      include: { book: true, host: true, _count: { select: { attendance: true } } },
      orderBy: { date: "desc" },
    }),
    db.book.findMany({ orderBy: { title: "asc" } }),
    db.member.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-xl font-semibold">Meetings</h1>

      <ul className="mb-8 flex flex-col gap-3">
        {meetings.map((m) => (
          <li key={m.id} className="rounded border p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">
                  {formatDate(m.date)} · <span className="italic">{m.book.title}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Hosted by {m.host.name} · {m._count.attendance} attended
                </p>
                {m.notes && <p className="mt-1 text-sm">{m.notes}</p>}
              </div>
              <form action={deleteMeeting.bind(null, m.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Remove
                </button>
              </form>
            </div>
            <Link href={`/meetings/${m.id}`} className="mt-2 inline-block text-sm underline">
              Log attendance
            </Link>
          </li>
        ))}
        {meetings.length === 0 && <li className="text-sm text-gray-500">No meetings yet.</li>}
      </ul>

      <form action={createMeeting} className="flex flex-col gap-3 rounded border p-4">
        <h2 className="font-medium">Schedule a meeting</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span>Date</span>
          <input type="date" name="date" required className="rounded border px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Book</span>
          <select name="bookId" required className="rounded border px-2 py-1">
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Host</span>
          <select name="hostId" required className="rounded border px-2 py-1">
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Notes (optional)</span>
          <textarea name="notes" className="rounded border px-2 py-1" />
        </label>
        <button
          type="submit"
          className="self-start rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Schedule
        </button>
      </form>
    </main>
  );
}
