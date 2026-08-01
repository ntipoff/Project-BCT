import { db } from "@/lib/db";
import { averageRating, booksReadThisYear, mostActiveMembers } from "@/lib/dashboard";

export default async function DashboardPage() {
  const [booksThisYear, avgRating, activeMembers] = await Promise.all([
    booksReadThisYear(),
    averageRating(),
    mostActiveMembers(),
  ]);

  const memberIds = activeMembers.map((a) => a.memberId);
  const members = await db.member.findMany({ where: { id: { in: memberIds } } });
  const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? "Unknown";

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Books read this year</p>
          <p className="text-2xl font-semibold">{booksThisYear.length}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Average rating</p>
          <p className="text-2xl font-semibold">
            {avgRating != null ? avgRating.toFixed(1) : "—"}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded border p-4">
        <h2 className="mb-2 font-medium">Books finished this year</h2>
        {booksThisYear.length === 0 ? (
          <p className="text-sm text-gray-500">None yet.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {booksThisYear.map((b) => (
              <li key={b.id}>
                {b.title} {b.rating != null && <span className="text-gray-500">({b.rating}/5)</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded border p-4">
        <h2 className="mb-2 font-medium">Most active members</h2>
        {activeMembers.length === 0 ? (
          <p className="text-sm text-gray-500">No attendance logged yet.</p>
        ) : (
          <ol className="flex flex-col gap-1 text-sm">
            {activeMembers.map((a) => (
              <li key={a.memberId}>
                {memberName(a.memberId)} — {a._count.memberId} meeting
                {a._count.memberId === 1 ? "" : "s"}
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
