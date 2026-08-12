import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

const file = path.join(process.cwd(), "data", "db.json");
const adapter = new JSONFile(file);
const defaultData = { submissions: [] };

let dbInstance = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = new Low(adapter, defaultData);
    await dbInstance.read();
    dbInstance.data ||= defaultData;
    dbInstance.data.submissions ||= [];
  }
  return dbInstance;
}

export async function addSubmission(entry) {
  const db = await getDb();
  const record = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    createdAt: new Date().toISOString(),
    exported: false,
    ...entry,
  };
  db.data.submissions.unshift(record);
  await db.write();
  return record;
}

export async function listSubmissions() {
  const db = await getDb();
  return db.data.submissions;
}

export async function markExported(ids) {
  const db = await getDb();
  db.data.submissions = db.data.submissions.map((s) =>
    ids.includes(s.id) ? { ...s, exported: true } : s
  );
  await db.write();
}

export async function deleteSubmission(id) {
  const db = await getDb();
  db.data.submissions = db.data.submissions.filter((s) => s.id !== id);
  await db.write();
}
