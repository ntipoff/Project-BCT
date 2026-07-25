import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export default function setup() {
  const dir = mkdtempSync(join(tmpdir(), "bct-test-"));
  const dbPath = join(dir, "test.db");
  process.env.DATABASE_URL = `file:${dbPath}`;

  execSync("npx prisma migrate deploy", {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });

  return () => {
    rmSync(dir, { recursive: true, force: true });
  };
}
