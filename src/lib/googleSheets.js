import { google } from "googleapis";

function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY in .env.local"
    );
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

// Google Sheets tab names can't contain: : \ / ? * [ ]  and max 100 chars
function sanitizeTabName(name) {
  const cleaned = (name || "General")
    .replace(/[:\\/?*\[\]]/g, "-")
    .trim()
    .slice(0, 90);
  return cleaned || "General";
}

const HEADER_ROW = ["Date", "Name", "Phone", "Gender", "Address", "Course"];

async function ensureTabExists(sheets, spreadsheetId, tabName) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = (meta.data.sheets || []).map(
    (s) => s.properties.title
  );

  if (existing.includes(tabName)) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tabName } } }],
    },
  });

  // Add header row to the new tab
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [HEADER_ROW] },
  });
}

/**
 * Appends rows to a sheet, grouped by course — each course gets its own tab
 * within the same spreadsheet. Creates the tab (with header row) if missing.
 * `groupedRows` = { [courseName]: [ [date, name, phone, gender, address, course], ... ] }
 */
export async function appendRowsByCourse(groupedRows) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID in .env.local");
  }

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  for (const [course, rows] of Object.entries(groupedRows)) {
    if (!rows.length) continue;
    const tabName = sanitizeTabName(course);

    await ensureTabExists(sheets, spreadsheetId, tabName);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tabName}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: rows },
    });
  }
}

