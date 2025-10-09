import type { NextRequest } from "next/server";
import { createComment } from "@/app/lib/comments/access";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "500kb",
    },
  },
};

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const newComment = await request.json();
    const lastComment = await createComment(newComment);

    return new Response(
      JSON.stringify({
        lastComment,
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return new Response("FAILURE", { status: 500 });
  }
}
