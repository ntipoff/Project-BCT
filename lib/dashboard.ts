import { db } from "./db";

function startOfCurrentYear() {
  return new Date(new Date().getFullYear(), 0, 1);
}

export async function booksReadThisYear() {
  return db.book.findMany({
    where: { status: "FINISHED", dateFinished: { gte: startOfCurrentYear() } },
  });
}

// D-007 requires PLANNED/READING books to never affect this average, even if a stray
// rating value exists on one (data written outside the normal flow). Filtering on
// status here, not just rating-not-null, is what D-005's simpler query is missing.
export async function averageRating() {
  const result = await db.book.aggregate({
    _avg: { rating: true },
    where: { status: "FINISHED", rating: { not: null } },
  });
  return result._avg.rating;
}

export async function mostActiveMembers() {
  return db.attendance.groupBy({
    by: ["memberId"],
    _count: { memberId: true },
    orderBy: { _count: { memberId: "desc" } },
  });
}
