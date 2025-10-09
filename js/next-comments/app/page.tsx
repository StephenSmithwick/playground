"use client";

import Comments from "@/app/ui/Comments";
import { default as CommentForm, CommentsUpdated } from "@/app/ui/CommentForm";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <CommentBlock />
    </Suspense>
  );
}

function CommentBlock() {
  const post = useSearchParams().get("post") || "default";
  const [lastComment, setLastComment] = useState<number>();

  const commentsUpdated: CommentsUpdated = (id: number) => {
    setLastComment(id);
  };

  useEffect(() => {
    console.log("Updating Updating Comments>Home>CommentBlock");
    window.postMessage({ update: "done" });
  });

  return (
    <div id="comment-section">
      <Header />
      <CommentForm post={post} onUpdate={commentsUpdated} />
      <Comments post={post} lastComment={lastComment} />
    </div>
  );
}

const Header = () => <h2>Comments</h2>;

const Loading = () => (
  <>
    <Header />
    <ul className="loading comment-list">
      <li>Loading...</li>
    </ul>
  </>
);
