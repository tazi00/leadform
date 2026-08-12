import { Pool } from "pg";

let pool = null;

function getPool() {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL;

    if (!connectionString) {
      throw new Error(
        "Missing DATABASE_URL (or POSTGRES_URL) env var. Set it in .env.local or your Vercel project's Environment Variables."
      );
    }

    pool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

let tableReady = null;

async function ensureTable() {
  if (!tableReady) {
    tableReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        exported BOOLEAN NOT NULL DEFAULT FALSE,
        type TEXT,
        first_name TEXT,
        middle_name TEXT,
        last_name TEXT,
        phone TEXT,
        gender TEXT,
        address_line1 TEXT,
        address_line2 TEXT,
        course TEXT,
        agree_fees BOOLEAN,
        agree_terms BOOLEAN
      );
    `);
  }
  await tableReady;
}

function rowToRecord(row) {
  return {
    id: row.id,
    createdAt: row.created_at.toISOString(),
    exported: row.exported,
    type: row.type,
    firstName: row.first_name,
    middleName: row.middle_name,
    lastName: row.last_name,
    phone: row.phone,
    gender: row.gender,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    course: row.course,
    agreeFees: row.agree_fees,
    agreeTerms: row.agree_terms,
  };
}

export async function addSubmission(entry) {
  await ensureTable();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const { rows } = await getPool().query(
    `INSERT INTO submissions
      (id, exported, type, first_name, middle_name, last_name, phone, gender, address_line1, address_line2, course, agree_fees, agree_terms)
     VALUES ($1,false,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      id,
      entry.type || "registration",
      entry.firstName || "",
      entry.middleName || "",
      entry.lastName || "",
      entry.phone || "",
      entry.gender || "",
      entry.addressLine1 || "",
      entry.addressLine2 || "",
      entry.course || "",
      !!entry.agreeFees,
      !!entry.agreeTerms,
    ]
  );

  return rowToRecord(rows[0]);
}

export async function listSubmissions() {
  await ensureTable();
  const { rows } = await getPool().query(
    `SELECT * FROM submissions ORDER BY created_at DESC`
  );
  return rows.map(rowToRecord);
}

export async function markExported(ids) {
  if (!ids.length) return;
  await ensureTable();
  await getPool().query(
    `UPDATE submissions SET exported = true WHERE id = ANY($1::text[])`,
    [ids]
  );
}

export async function deleteSubmission(id) {
  await ensureTable();
  await getPool().query(`DELETE FROM submissions WHERE id = $1`, [id]);
}
