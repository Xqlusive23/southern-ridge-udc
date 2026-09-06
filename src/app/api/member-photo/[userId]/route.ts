import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { loadMemberPhoto } from "@/lib/persist";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { userId } = await context.params;
  if (session.role === "member" && session.id !== userId) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const photo = await loadMemberPhoto(userId);
  if (!photo) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(new Uint8Array(photo.bytes), {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "private, max-age=60",
    },
  });
}
