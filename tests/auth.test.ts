import { expect, test } from "vitest";
import { NextRequest } from "next/server";
import { checkSession } from "../proxy";
import { createSessionToken } from "../lib/session";

const SECRET = "test-secret";

test("auth middleware blocks an unauthenticated request to a protected route", async () => {
  const req = new NextRequest(new URL("http://localhost/books"));
  const res = await checkSession(req, SECRET);

  expect(res.headers.get("location")).toContain("/login");
});

test("auth middleware allows a request with a valid session cookie", async () => {
  const token = await createSessionToken({ memberId: "member-123" }, SECRET);
  const req = new NextRequest(new URL("http://localhost/books"), {
    headers: { cookie: `bct_session=${token}` },
  });
  const res = await checkSession(req, SECRET);

  expect(res.headers.get("location")).toBeNull();
});

test("auth middleware rejects a tampered session cookie", async () => {
  const token = await createSessionToken({ memberId: "member-123" }, SECRET);
  const tampered = token.slice(0, -1) + (token.at(-1) === "a" ? "b" : "a");
  const req = new NextRequest(new URL("http://localhost/books"), {
    headers: { cookie: `bct_session=${tampered}` },
  });
  const res = await checkSession(req, SECRET);

  expect(res.headers.get("location")).toContain("/login");
});
