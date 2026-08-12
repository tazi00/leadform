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

function getSpreadsheetId() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID in .env.local");
  }
  return spreadsheetId;
}

function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
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

async function getSpreadsheetMeta(sheets, spreadsheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  return meta.data.sheets || [];
}

async function ensureTabExists(sheets, spreadsheetId, tabName) {
  const existingSheets = await getSpreadsheetMeta(sheets, spreadsheetId);
  const found = existingSheets.find((s) => s.properties.title === tabName);
  if (found) return found.properties.sheetId;

  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tabName } } }],
    },
  });

  const newSheetId =
    res.data.replies[0].addSheet.properties.sheetId;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [HEADER_ROW] },
  });

  return newSheetId;
}

/**
 * Appends one registration directly to the sheet — creates the course's
 * tab (with header row) if it doesn't exist yet.
 */
export async function appendRegistrationRow(course, rowValues) {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();
  const tabName = sanitizeTabName(course);

  await ensureTabExists(sheets, spreadsheetId, tabName);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [rowValues] },
  });
}

/**
 * Reads every course tab and returns all rows combined, newest first.
 * Each record's `id` encodes {sheetId}:{rowNumber} so it can be deleted later.
 */
export async function listAllSubmissions() {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();
  const tabs = await getSpreadsheetMeta(sheets, spreadsheetId);

  const all = [];

  for (const tab of tabs) {
    const title = tab.properties.title;
    const sheetId = tab.properties.sheetId;

    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${title}!A2:F`,
    });

    const rows = data.values || [];
    rows.forEach((row, idx) => {
      const rowNumber = idx + 2; // header is row 1
      const [date, name, phone, gender, address, course] = row;
      if (!date && !name) return; // skip blank rows
      all.push({
        id: `${sheetId}:${rowNumber}`,
        createdAt: date || "",
        name: name || "",
        phone: phone || "",
        gender: gender || "",
        address: address || "",
        course: course || title,
      });
    });
  }

  all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return all;
}

export async function deleteSubmissionRow(id) {
  const [sheetIdStr, rowNumberStr] = String(id).split(":");
  const sheetId = Number(sheetIdStr);
  const rowNumber = Number(rowNumberStr);

  if (!Number.isFinite(sheetId) || !Number.isFinite(rowNumber)) {
    throw new Error("Invalid submission id");
  }

  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });
}
