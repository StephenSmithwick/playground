import { fetchPostComments } from "@/app/lib/comments/access";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> },
) {
  const { path } = await params;
  const comments = await fetchPostComments(path);

  return new Response(JSON.stringify(comments), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
