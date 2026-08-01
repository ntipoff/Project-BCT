"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken } from "@/lib/session";
import { SESSION_COOKIE } from "@/proxy";

export async function login(formData: FormData) {
  const password = formData.get("password");
  const memberId = formData.get("memberId");

  if (
    typeof password !== "string" ||
    password !== process.env.APP_PASSWORD ||
    typeof memberId !== "string" ||
    !memberId
  ) {
    redirect("/login?error=1");
  }

  const token = await createSessionToken({ memberId }, process.env.SESSION_SECRET!);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
