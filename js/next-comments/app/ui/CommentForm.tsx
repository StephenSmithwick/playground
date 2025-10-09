"use client";

import { useSession } from "next-auth/react";
import Login from "./Login";
import { Anonymous, Author } from "../lib/comments/definitions";

export default function NewComment({
  post,
  onUpdate,
}: {
  post: string;
  onUpdate: CommentsUpdated;
}) {
  const { data: session } = useSession();
  const user = { ...Anonymous, ...session?.user } as Author;

  return (
    <form className="comment-form" action={postComment(post, user, onUpdate)}>
      <textarea name="text" placeholder="Leave a comment…" required></textarea>
      <div className="comment-actions">
        <button type="submit">Post</button> as <Login session={session} />
      </div>
    </form>
  );
}

export type CommentsUpdated = (lastComment: number) => void;

function postComment(post: string, user: Author, onUpdate: CommentsUpdated) {
  return async function postComment(form: FormData) {
    const response = await fetch("api/comments", {
      method: "POST",
      body: JSON.stringify({
        post: post,
        author: user,
        text: `${form.get("text")}`,
      }),
    });
    onUpdate((await response.json()).lastComment);
  };
}
