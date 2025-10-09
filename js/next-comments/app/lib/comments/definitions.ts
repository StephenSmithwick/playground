export type Comment = {
  id: number;
  date: string;
  post: string;
  text: string;
  author: Author;
};

export type Author = {
  name: string;
  image: string;
};

export const Anonymous: Author = {
  name: "Anonymous",
  image: "https://github.com/identicons/stephensmithwick.png",
};
