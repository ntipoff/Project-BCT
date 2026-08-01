import Link from "next/link";
import { getCurrentSession } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export default async function Nav() {
  const session = await getCurrentSession();
  if (!session) return null;

  return (
    <nav className="flex items-center justify-between border-b px-8 py-3 text-sm">
      <div className="flex gap-4">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/books" className="hover:underline">
          Books
        </Link>
        <Link href="/members" className="hover:underline">
          Members
        </Link>
        <Link href="/meetings" className="hover:underline">
          Meetings
        </Link>
      </div>
      <form action={logout}>
        <button type="submit" className="text-gray-500 hover:underline">
          Log out
        </button>
      </form>
    </nav>
  );
}
