import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { redis } from "@/lib/cache";
import { s3, S3_BUCKET } from "@/lib/storage";
import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { logError } from "@/lib/log-context";

export const dynamic = "force-dynamic";

// Valida a fundação: conexão com Postgres, Redis e MinIO.
export async function GET() {
  const checks: Record<string, "ok" | "erro"> = {
    postgres: "erro",
    redis: "erro",
    minio: "erro",
  };

  try {
    await db.execute(sql`select 1`);
    checks.postgres = "ok";
  } catch (err) {
    await logError({ err, action: "health", dep: "postgres" }, "postgres indisponível");
  }

  try {
    const pong = await redis.ping();
    if (pong === "PONG") checks.redis = "ok";
  } catch (err) {
    await logError({ err, action: "health", dep: "redis" }, "redis indisponível");
  }

  try {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
    checks.minio = "ok";
  } catch (err) {
    await logError({ err, action: "health", dep: "minio" }, "minio indisponível");
  }

  const ok = Object.values(checks).every((s) => s === "ok");
  return NextResponse.json(
    { status: ok ? "ok" : "degradado", checks },
    { status: ok ? 200 : 503 }
  );
}
