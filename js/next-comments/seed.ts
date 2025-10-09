import postgres from "postgres";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const frames = "⠋⠙⠸⢰⣠⣄⡆⠇";
const maxFrames = frames.length - 1;

async function setupDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS comment (
      id SERIAL PRIMARY KEY,
      date TIMESTAMP NOT NULL,
      post VARCHAR(255) NOT NULL,
      text TEXT NOT NULL,
      author TEXT NOT NULL,
      author_image TEXT
    );
  `;
}

let i = 0;
const loading = setInterval(() => {
  process.stdout.write("\r" + frames[i++]);
  i &= maxFrames;
}, 100);

console.log(`Seeding Database: ${process.env.POSTGRES_URL}`);
setupDB().then(() => {
  clearInterval(loading);
  process.stdout.write("\rDone\n");
  sql.end();
});
