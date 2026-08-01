import { cookies } from "next/headers";
import { verifySessionToken } from "./session";
import { SESSION_COOKIE } from "@/proxy";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, process.env.SESSION_SECRET!);
}
