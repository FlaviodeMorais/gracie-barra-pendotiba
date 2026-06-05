import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const absPath = path.join(ROOT, "dev.db").replace(/\\/g, "/");

const client = createClient({ url: `file:///${absPath}` });

await client.execute("PRAGMA journal_mode = WAL;");
const result = await client.execute("PRAGMA journal_mode;");
console.log("Journal mode:", result.rows[0][0]);
console.log("✓ WAL mode ativado! Arquivo pronto para upload.");
await client.close();
