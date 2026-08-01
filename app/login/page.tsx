import { db } from "@/lib/db";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const members = await db.member.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-8">
      <h1 className="mb-6 text-xl font-semibold">Book Club Tracker</h1>

      {error && (
        <p className="mb-4 text-sm text-red-600">
          Wrong password, or no member selected. Try again.
        </p>
      )}

      {members.length === 0 ? (
        <p className="text-sm text-gray-600">
          No members exist yet. Ask whoever set this up to add one before logging in.
        </p>
      ) : (
        <form action={login} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span>Password</span>
            <input
              type="password"
              name="password"
              required
              className="rounded border px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Who are you?</span>
            <select name="memberId" required className="rounded border px-2 py-1">
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Log in
          </button>
        </form>
      )}
    </main>
  );
}
