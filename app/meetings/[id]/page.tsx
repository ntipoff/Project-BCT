import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { setAttendance } from "../actions";

function formatDate(d: Date) {
  return new Date(d).toISOString().slice(0, 10);
}

export default async function MeetingAttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [meeting, members] = await Promise.all([
    db.meeting.findUnique({
      where: { id },
      include: { book: true, host: true, attendance: true },
    }),
    db.member.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!meeting) notFound();

  const attendingIds = new Set(meeting.attendance.map((a) => a.memberId));

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 text-xl font-semibold">
        {formatDate(meeting.date)} · {meeting.book.title}
      </h1>
      <p className="mb-6 text-sm text-gray-500">Hosted by {meeting.host.name}</p>

      <form action={setAttendance.bind(null, meeting.id)} className="flex flex-col gap-3">
        <h2 className="font-medium">Who attended?</h2>
        {members.map((m) => (
          <label key={m.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="memberIds"
              value={m.id}
              defaultChecked={attendingIds.has(m.id)}
            />
            {m.name}
          </label>
        ))}
        {members.length === 0 && (
          <p className="text-sm text-gray-500">No members exist yet.</p>
        )}
        <button
          type="submit"
          className="self-start rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Save attendance
        </button>
      </form>
    </main>
  );
}
