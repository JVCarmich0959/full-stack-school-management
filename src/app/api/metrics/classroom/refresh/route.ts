import { NextResponse } from "next/server";

import { enqueueSnapshotRefresh } from "@/lib/performance";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryStudentId = searchParams.get("studentId");
  let studentId = queryStudentId;

  if (!studentId) {
    try {
      const payload = await request.json();
      studentId = payload?.studentId;
    } catch {
      // ignore parse errors
    }
  }

  if (!studentId) {
    return NextResponse.json(
      { error: "studentId is required" },
      { status: 400 }
    );
  }

  try {
    await enqueueSnapshotRefresh(studentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/metrics/classroom/refresh]", error);
    return NextResponse.json(
      { error: "Unable to enqueue snapshot refresh" },
      { status: 500 }
    );
  }
}
