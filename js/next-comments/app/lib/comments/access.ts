import postgres from "postgres";
import { Author, Comment } from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

type CommentRow = {
  id: number;
  date: string;
  post: string;
  text: string;
  author: string;
  author_image: string;
};

export async function fetchPostComments(post: string): Promise<Comment[]> {
  try {
    const comments = await sql<CommentRow[]>`SELECT
        id, date, post, text, author, author_image
      FROM comment
      WHERE comment.post = ${post}
      ORDER BY comment.id ASC
      LIMIT 1000`;
    return comments.map(to_comment);
  } catch (error) {
    console.error(`Database Error: on ${process.env.POSTGRES_URL}`, error);
    throw new Error("Failed to fetch the latest comments.");
  }
}

type CommentInsert = {
  id: number;
};

export async function createComment({
  post,
  author,
  text,
}: {
  post: string;
  author: Author;
  text: string;
}): Promise<number> {
  try {
    const lastComment = await sql<
      CommentInsert[]
    >`INSERT INTO comment (post, author, author_image, text, date )
      VALUES (${post}, ${author.name}, ${author.image}, ${text}, current_timestamp)
      RETURNING id`;
    return lastComment[0].id;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to insert comment.");
  }
}

function to_comment(res: CommentRow): Comment {
  return {
    ...res,
    author: {
      name: res.author,
      image: res.author_image,
    },
  };
}
