import { signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { Anonymous, Author } from "@/app/lib/comments/definitions";

function SignOutButton({ user }: { user: Author }) {
  return (
    <button onClick={() => signOut()}>
      <img className="avatar" src={user.image} alt="Author Avatar" />{" "}
      {user.name}
    </button>
  );
}

function SignInButton() {
  return (
    <button onClick={() => signIn("github", { redirect: false })}>
      <img className="avatar" src={Anonymous.image} alt="Author Avatar" /> Sign
      in
    </button>
  );
}

export default function UserChooser({ session }: { session?: Session | null }) {
  const user = {
    ...Anonymous,
    ...session?.user,
  } as Author;

  return session?.user ? <SignOutButton user={user} /> : <SignInButton />;
}
