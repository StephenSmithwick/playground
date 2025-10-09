"use client";

import React, { useState, useEffect } from "react";
import Author from "./Author";

import { Comment } from "@/app/lib/comments/definitions";

import { remark } from "remark";
import html from "remark-html";

export default function Comments({
  post,
  lastComment,
}: {
  post: string;
  lastComment?: number;
}) {
  const [comments, setData] = useState<Comment[]>();
  const remarkHtml = remark().use(html);

  useEffect(() => {
    const fetchData = async () => {
      const request = await fetch(`/api/comments/${post}`);
      const newComments: Comment[] = await Promise.all<Comment[]>(
        (await request.json()).map(
          async (comment: Comment): Promise<Comment> => ({
            ...comment,
            text: (await remarkHtml.process(comment.text)).toString(),
          }),
        ),
      );

      setData(newComments);
    };

    fetchData().catch((e) => {
      console.error("An error occurred while fetching comments.", e);
    });
  }, [post, lastComment]);

  return comments ? (
    <ul className="comment-list">
      {comments.map((comment) => (
        <li className="comment" key={comment.id}>
          <div
            className="comment-body"
            dangerouslySetInnerHTML={{ __html: comment.text }}
          />
          <div className="comment-meta">
            — <Author author={comment.author} /> • {`${comment.date}`}{" "}
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <ul className="loading comment-list">
      <li>Loading...</li>
    </ul>
  );
}
